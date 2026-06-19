variable "aws_region" {
  description = "AWS region for resource deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "taskly"
}

variable "cost_center" {
  description = "Cost center tag for billing visibility"
  type        = string
  default     = "engineering"
}

variable "owner" {
  description = "Team or individual responsible for the resources"
  type        = string
  default     = "platform-team"
}

# ─── Networking ───────────────────────────────────────────────────────────────

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# ─── Database ─────────────────────────────────────────────────────────────────

variable "documentdb_master_password" {
  description = "Master password for the DocumentDB cluster"
  type        = string
  sensitive   = true
}

variable "documentdb_instance_class" {
  description = "DocumentDB instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "documentdb_instance_count" {
  description = "Number of DocumentDB instances"
  type        = number
  default     = 1
}

# ─── Secrets ──────────────────────────────────────────────────────────────────

variable "jwt_signing_key" {
  description = "JWT signing key for legacy token compatibility"
  type        = string
  sensitive   = true
}

# ─── Email ────────────────────────────────────────────────────────────────────

variable "ses_domain" {
  description = "Domain name for SES identity verification (e.g., taskly.app)"
  type        = string
  default     = "taskly.app"
}

# ─── DNS / Disaster Recovery ──────────────────────────────────────────────────

variable "hosted_zone_id" {
  description = "Route 53 hosted zone ID for DNS failover"
  type        = string
  default     = ""
}

variable "domain_name" {
  description = "Domain name for the API (e.g., api.taskly.app)"
  type        = string
  default     = "api.taskly.app"
}
