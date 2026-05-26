# ─── Dev Environment Configuration ────────────────────────────────────────────
# Minimal resources for development and testing
# Single DocumentDB instance, low concurrency limits

project_name = "taskly"
environment  = "dev"
aws_region   = "us-east-1"

# VPC
vpc_cidr = "10.0.0.0/16"

# DocumentDB — single instance, smallest size
documentdb_instance_class = "db.t3.medium"
documentdb_instance_count = 1

# Lambda — low memory and concurrency
api_handler_memory              = 256
api_handler_timeout             = 29
processor_memory                = 128
reserved_concurrency_api        = 10
reserved_concurrency_processors = 5

# API Gateway
throttling_burst_limit = 50
throttling_rate_limit  = 25

# WAF — count mode (don't block in dev)
waf_rate_limit        = 2000
waf_rate_limit_action = "count"

# Monitoring
log_retention_days     = 7
monthly_budget_amount  = 50
alarm_email_endpoints  = []

# CloudFront
cloudfront_price_class = "PriceClass_100"

# CORS
cors_allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
