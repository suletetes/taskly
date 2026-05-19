###############################################################################
# WAF Module — Variables
#
# Requirements: 11.1, 11.2
###############################################################################

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "taskly"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "api_gateway_stage_arn" {
  description = "ARN of the API Gateway stage to associate with the WAF WebACL"
  type        = string
}

variable "rate_limit" {
  description = "Maximum requests per IP per 5-minute window before rate limiting"
  type        = number
  default     = 1000
}

variable "rate_limit_action" {
  description = "Action to take when rate limit is exceeded (block or count)"
  type        = string
  default     = "block"

  validation {
    condition     = contains(["block", "count"], var.rate_limit_action)
    error_message = "Rate limit action must be 'block' or 'count'."
  }
}

variable "ip_rate_limit_enabled" {
  description = "Whether to enable IP-based rate limiting"
  type        = bool
  default     = true
}

variable "managed_rules_enabled" {
  description = "Whether to enable AWS Managed Rule groups"
  type        = bool
  default     = true
}

variable "cloudwatch_metrics_enabled" {
  description = "Whether to enable CloudWatch metrics for WAF rules"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Common resource tags"
  type        = map(string)
  default     = {}
}
