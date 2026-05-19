# CloudFront Module - Outputs
# Exports distribution identifiers for use by other modules (CI/CD, DNS, application config)

# =============================================================================
# FRONTEND DISTRIBUTION
# =============================================================================

output "frontend_distribution_id" {
  description = "ID of the frontend CloudFront distribution (used for cache invalidation in CI/CD)"
  value       = aws_cloudfront_distribution.frontend.id
}

output "frontend_distribution_arn" {
  description = "ARN of the frontend CloudFront distribution (used for S3 bucket policy and WAF association)"
  value       = aws_cloudfront_distribution.frontend.arn
}

output "frontend_distribution_domain_name" {
  description = "Domain name of the frontend CloudFront distribution (e.g., d1234.cloudfront.net)"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "frontend_distribution_hosted_zone_id" {
  description = "Route 53 hosted zone ID for the frontend distribution (for alias records)"
  value       = aws_cloudfront_distribution.frontend.hosted_zone_id
}

# =============================================================================
# UPLOADS DISTRIBUTION
# =============================================================================

output "uploads_distribution_id" {
  description = "ID of the uploads CloudFront distribution (used for cache invalidation)"
  value       = aws_cloudfront_distribution.uploads.id
}

output "uploads_distribution_arn" {
  description = "ARN of the uploads CloudFront distribution (used for S3 bucket policy)"
  value       = aws_cloudfront_distribution.uploads.arn
}

output "uploads_distribution_domain_name" {
  description = "Domain name of the uploads CloudFront distribution (e.g., d5678.cloudfront.net)"
  value       = aws_cloudfront_distribution.uploads.domain_name
}

output "uploads_distribution_hosted_zone_id" {
  description = "Route 53 hosted zone ID for the uploads distribution (for alias records)"
  value       = aws_cloudfront_distribution.uploads.hosted_zone_id
}

# =============================================================================
# OAC IDENTIFIERS
# =============================================================================

output "frontend_oac_id" {
  description = "ID of the Origin Access Control for the frontend distribution"
  value       = aws_cloudfront_origin_access_control.frontend.id
}

output "uploads_oac_id" {
  description = "ID of the Origin Access Control for the uploads distribution"
  value       = aws_cloudfront_origin_access_control.uploads.id
}
