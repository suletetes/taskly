locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    CostCenter  = var.cost_center
    Owner       = var.owner
  }

  name_prefix = "${var.project_name}-${var.environment}"
}

# ─── Networking ───────────────────────────────────────────────────────────────

module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}

# ─── Database ─────────────────────────────────────────────────────────────────

module "documentdb" {
  source = "./modules/documentdb"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  lambda_sg_id       = module.vpc.lambda_security_group_id
  tags               = local.common_tags
}

# ─── Secrets ──────────────────────────────────────────────────────────────────

module "secrets" {
  source = "./modules/secrets"

  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}

# ─── Authentication ───────────────────────────────────────────────────────────

module "cognito" {
  source = "./modules/cognito"

  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}

# ─── Storage ──────────────────────────────────────────────────────────────────

module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}

# ─── CDN ──────────────────────────────────────────────────────────────────────

module "cloudfront" {
  source = "./modules/cloudfront"

  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}

# ─── IAM ──────────────────────────────────────────────────────────────────────

module "iam" {
  source = "./modules/iam"

  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}

# ─── Compute ──────────────────────────────────────────────────────────────────

module "lambda" {
  source = "./modules/lambda"

  project_name             = var.project_name
  environment              = var.environment
  vpc_id                   = module.vpc.vpc_id
  private_subnet_ids       = module.vpc.private_subnet_ids
  lambda_security_group_id = module.vpc.lambda_security_group_id
  execution_role_arn       = module.iam.lambda_execution_role_arn
  documentdb_secret_arn    = module.secrets.documentdb_secret_arn
  cognito_user_pool_id     = module.cognito.user_pool_id
  cognito_client_id        = module.cognito.client_id
  s3_upload_bucket         = module.s3.uploads_bucket_id
  event_bus_name           = module.eventbridge.event_bus_name
  email_queue_url          = module.sqs.email_queue_url
  email_queue_arn          = module.sqs.email_queue_arn
  notification_queue_url   = module.sqs.notification_queue_url
  cdn_domain               = module.cloudfront.uploads_distribution_domain
  api_handler_s3_bucket    = module.s3.deploy_bucket_id
  api_handler_s3_key       = "lambda/api-handler.zip"
  processor_s3_bucket      = module.s3.deploy_bucket_id
  achievement_processor_s3_key  = "lambda/achievement-processor.zip"
  notification_processor_s3_key = "lambda/notification-processor.zip"
  email_processor_s3_key        = "lambda/email-processor.zip"
  tags                     = local.common_tags
}

# ─── API Gateway ──────────────────────────────────────────────────────────────

module "apigateway" {
  source = "./modules/apigateway"

  project_name                = var.project_name
  environment                 = var.environment
  lambda_function_arn         = module.lambda.api_handler_invoke_arn
  lambda_function_name        = module.lambda.api_handler_function_name
  cognito_user_pool_arn       = module.cognito.user_pool_arn
  cognito_user_pool_client_id = module.cognito.client_id
  cognito_user_pool_endpoint  = module.cognito.user_pool_endpoint
  tags                        = local.common_tags
}

# ─── Email ────────────────────────────────────────────────────────────────────

module "ses" {
  source = "./modules/ses"

  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}

# ─── Event Bus ────────────────────────────────────────────────────────────────

module "eventbridge" {
  source = "./modules/eventbridge"

  project_name                       = var.project_name
  environment                        = var.environment
  event_processor_lambda_arn         = module.lambda.achievement_processor_arn
  event_processor_lambda_name        = module.lambda.achievement_processor_function_name
  notification_processor_lambda_arn  = module.lambda.notification_processor_arn
  notification_processor_lambda_name = module.lambda.notification_processor_function_name
  event_dlq_arn                      = module.sqs.event_processing_dlq_arn
  tags                               = local.common_tags
}

# ─── Queues ───────────────────────────────────────────────────────────────────

module "sqs" {
  source = "./modules/sqs"

  project_name            = var.project_name
  environment             = var.environment
  event_bus_arn           = module.eventbridge.event_bus_arn
  lambda_execution_role_arn = module.iam.lambda_execution_role_arn
  tags                    = local.common_tags
}

# ─── Security ─────────────────────────────────────────────────────────────────

module "waf" {
  source = "./modules/waf"

  project_name          = var.project_name
  environment           = var.environment
  api_gateway_stage_arn = module.apigateway.api_execution_arn
  tags                  = local.common_tags
}

# ─── Monitoring ───────────────────────────────────────────────────────────────

module "monitoring" {
  source = "./modules/monitoring"

  project_name               = var.project_name
  environment                = var.environment
  api_handler_function_name  = module.lambda.api_handler_function_name
  api_handler_log_group_name = "/aws/lambda/${module.lambda.api_handler_function_name}"
  documentdb_cluster_id      = module.documentdb.cluster_id
  tags                       = local.common_tags
}
