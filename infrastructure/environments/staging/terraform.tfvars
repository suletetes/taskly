# ─── Staging Environment Configuration ────────────────────────────────────────
# Moderate resources for pre-production testing

project_name = "taskly"
environment  = "staging"
aws_region   = "us-east-1"

# VPC
vpc_cidr = "10.1.0.0/16"

# DocumentDB — 2 instances for HA testing
documentdb_instance_class = "db.t3.medium"
documentdb_instance_count = 2

# Lambda — moderate memory
api_handler_memory              = 512
api_handler_timeout             = 29
processor_memory                = 256
reserved_concurrency_api        = 50
reserved_concurrency_processors = 10

# API Gateway
throttling_burst_limit = 100
throttling_rate_limit  = 50

# WAF — block mode
waf_rate_limit        = 1000
waf_rate_limit_action = "block"

# Monitoring
log_retention_days     = 14
monthly_budget_amount  = 150
alarm_email_endpoints  = []

# CloudFront
cloudfront_price_class = "PriceClass_100"

# CORS
cors_allowed_origins = ["https://staging.taskly.app"]
