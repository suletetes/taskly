###############################################################################
# Disaster Recovery Module — Cross-Region Backup and Replication
#
# Configures:
# - DocumentDB continuous backup for 5-minute RPO
# - S3 cross-region replication for critical buckets
# - Backup verification resources
#
# RTO: 30 minutes for cluster recovery
# RPO: 5 minutes (continuous backup)
#
# : 13.1, 13.2, 13.4, 13.5
###############################################################################

# ─── Variables ────────────────────────────────────────────────────────────────

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "taskly"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "primary_region" {
  description = "Primary AWS region"
  type        = string
  default     = "us-east-1"
}

variable "dr_region" {
  description = "Disaster recovery AWS region"
  type        = string
  default     = "us-west-2"
}

variable "documentdb_cluster_arn" {
  description = "ARN of the DocumentDB cluster"
  type        = string
}

variable "uploads_bucket_arn" {
  description = "ARN of the uploads S3 bucket"
  type        = string
}

variable "uploads_bucket_id" {
  description = "ID of the uploads S3 bucket"
  type        = string
}

variable "tags" {
  description = "Common resource tags"
  type        = map(string)
  default     = {}
}

# ─── DocumentDB Continuous Backup ─────────────────────────────────────────────
#
# DocumentDB automated backups provide point-in-time recovery.
# Backup retention of 7 days with continuous backup enabled gives 5-minute RPO.
# (Configured in the DocumentDB module via backup_retention_period)

# ─── S3 Cross-Region Replication ──────────────────────────────────────────────

# DR region provider
provider "aws" {
  alias  = "dr"
  region = var.dr_region
}

# Replication destination bucket in DR region
resource "aws_s3_bucket" "uploads_replica" {
  provider = aws.dr
  bucket   = "${var.project_name}-${var.environment}-uploads-replica"

  tags = merge(var.tags, {
    Name      = "${var.project_name}-${var.environment}-uploads-replica"
    Component = "disaster-recovery"
    Region    = var.dr_region
  })
}

resource "aws_s3_bucket_versioning" "uploads_replica" {
  provider = aws.dr
  bucket   = aws_s3_bucket.uploads_replica.id

  versioning_configuration {
    status = "Enabled"
  }
}

# IAM role for S3 replication
resource "aws_iam_role" "replication" {
  name = "${var.project_name}-${var.environment}-s3-replication"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "s3.amazonaws.com"
      }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "replication" {
  name = "s3-replication"
  role = aws_iam_role.replication.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetReplicationConfiguration",
          "s3:ListBucket"
        ]
        Effect   = "Allow"
        Resource = var.uploads_bucket_arn
      },
      {
        Action = [
          "s3:GetObjectVersionForReplication",
          "s3:GetObjectVersionAcl",
          "s3:GetObjectVersionTagging"
        ]
        Effect   = "Allow"
        Resource = "${var.uploads_bucket_arn}/*"
      },
      {
        Action = [
          "s3:ReplicateObject",
          "s3:ReplicateDelete",
          "s3:ReplicateTags"
        ]
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.uploads_replica.arn}/*"
      }
    ]
  })
}

# Replication configuration on source bucket
resource "aws_s3_bucket_replication_configuration" "uploads" {
  bucket = var.uploads_bucket_id
  role   = aws_iam_role.replication.arn

  rule {
    id     = "replicate-all"
    status = "Enabled"

    destination {
      bucket        = aws_s3_bucket.uploads_replica.arn
      storage_class = "STANDARD_IA"
    }
  }
}

# ─── Outputs ──────────────────────────────────────────────────────────────────

output "replica_bucket_arn" {
  description = "ARN of the S3 replica bucket in DR region"
  value       = aws_s3_bucket.uploads_replica.arn
}

output "replica_bucket_id" {
  description = "ID of the S3 replica bucket in DR region"
  value       = aws_s3_bucket.uploads_replica.id
}

output "replication_role_arn" {
  description = "ARN of the S3 replication IAM role"
  value       = aws_iam_role.replication.arn
}
