# ─── Production Environment Configuration ─────────────────────────────────────
# Full HA configuration with maximum reliability

project_name = "taskly"
environment  = "prod"
aws_region   = "us-east-1"

# VPC
vpc_cidr = "10.2.0.0/16"

# DocumentDB — 2 instances across 2 AZs for high availability
documentdb_instance_class = "db.t3.medium"
documentdb_instance_count = 2

# Lambda — full memory allocation
api_handler_memory              = 512
api_handler_timeout             = 29
processor_memory                = 256
reserved_concurrency_api        = -1  # Unreserved (use account limit)
reserved_concurrency_processors = -1

# API Gateway
throttling_burst_limit = 200
throttling_rate_limit  = 100

# WAF — strict blocking
waf_rate_limit        = 1000
waf_rate_limit_action = "block"

# Monitoring
log_retention_days         = 30
log_archive_retention_days = 90
monthly_budget_amount      = 500
alarm_email_endpoints      = []  # Set via environment variables or secrets

# CloudFront
cloudfront_price_class = "PriceClass_100"

# CORS
cors_allowed_origins = ["https://taskly.app", "https://www.taskly.app"]

# Disaster Recovery
dr_region = "us-west-2"
