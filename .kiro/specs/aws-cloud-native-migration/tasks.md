# Implementation Plan: AWS Cloud-Native Migration

## Overview

This plan migrates the Taskly application from a monolithic Docker/PM2 deployment to a serverless AWS architecture. Implementation uses Terraform for infrastructure, Node.js for Lambda functions (adapting the existing Express codebase), and GitHub Actions for CI/CD. Tasks are ordered by dependency: infrastructure foundations first, then services, application adaptation, CI/CD pipelines, and finally monitoring/security hardening.

## Tasks

- [ ] 1. Set up Terraform project structure and shared modules
  - [x] 1.1 Create Terraform project directory structure with environment configurations
    - Create `infrastructure/` directory with `modules/`, `environments/dev/`, `environments/staging/`, `environments/prod/`
    - Create `infrastructure/main.tf`, `variables.tf`, `outputs.tf`, `providers.tf`, `backend.tf`
    - Configure AWS provider, Terraform state backend (S3 + DynamoDB locking)
    - Define shared variables: region, environment, project name, cost-center tags
    - _Requirements: 9.1, 9.2, 9.5, 9.7_

  - [x] 1.2 Create shared IAM module with least-privilege policies
    - Create `infrastructure/modules/iam/` with roles for Lambda, API Gateway, EventBridge
    - Define Lambda execution role with CloudWatch Logs, VPC access, Secrets Manager read
    - Define per-function IAM policies (auth functions get Cognito access, upload functions get S3 access)
    - Output role ARNs for use by other modules
    - _Requirements: 9.4, 11.9_

  - [x] 1.3 Create resource tagging module and naming conventions
    - Create `infrastructure/modules/tags/` with standard tag map (environment, project, cost-center, managed-by)
    - Create a naming convention local that prefixes all resources with `taskly-{env}-`
    - Apply deletion protection for stateful resources (DocumentDB, S3)
    - _Requirements: 9.5, 9.6_

- [ ] 2. VPC and networking infrastructure
  - [x] 2.1 Create VPC module with public and private subnets
    - Create `infrastructure/modules/vpc/`
    - Define VPC with CIDR block, 2 public subnets and 2 private subnets across 2 AZs
    - Create Internet Gateway for public subnets
    - Create NAT Gateway (single for dev, HA pair for prod) for private subnet internet access
    - Define route tables for public and private subnets
    - _Requirements: 11.3, 2.2, 13.3_

  - [x] 2.2 Configure VPC endpoints and security groups
    - Create VPC endpoints for S3, DynamoDB, Secrets Manager, SQS, EventBridge (Gateway/Interface types)
    - Define security group for Lambda functions (outbound to DocumentDB, internet)
    - Define security group for DocumentDB (inbound only from Lambda security group on port 27017)
    - Ensure no direct internet access to private subnets except through NAT
    - _Requirements: 11.3, 11.4, 2.8_

- [x] 3. Checkpoint - Validate networking foundation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. DocumentDB cluster provisioning
  - [x] 4.1 Create DocumentDB module with multi-AZ deployment
    - Create `infrastructure/modules/documentdb/`
    - Define DocumentDB cluster with `db.t3.medium` instances (parameterized for environment)
    - Configure 2 instances across 2 AZs for high availability
    - Enable encryption at rest (KMS) and in transit (TLS)
    - Configure automated backups with 7-day retention
    - Place cluster in private subnets with DocumentDB security group
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.8, 12.2_

  - [x] 4.2 Configure DocumentDB parameter group and connection settings
    - Create custom parameter group enabling `audit_logs` and `profiler`
    - Configure TLS enforcement for all connections
    - Set connection timeout and keep-alive parameters
    - Output cluster endpoint, reader endpoint, and port for application configuration
    - _Requirements: 2.4, 2.7, 10.1_

  - [x] 4.3 Write integration test for DocumentDB connectivity
    - Create test script that connects to DocumentDB using Mongoose
    - Verify TLS connection, basic CRUD operations, and index creation
    - Test failover behavior by connecting to reader endpoint
    - _Requirements: 2.1, 2.7_

- [ ] 5. Secrets Manager configuration
  - [x] 5.1 Create Secrets Manager module for application secrets
    - Create `infrastructure/modules/secrets/`
    - Define secrets for: DocumentDB credentials, JWT signing key, Cognito client secret, SES SMTP credentials
    - Configure automatic rotation every 90 days for database credentials
    - Create Lambda rotation function for DocumentDB password rotation
    - Grant Lambda execution role read access to specific secrets only
    - _Requirements: 11.5, 11.6_

  - [x] 5.2 Create secrets retrieval utility for Lambda functions
    - Create `backend/utils/secrets.js` utility that fetches secrets from Secrets Manager with caching
    - Implement in-memory cache with TTL (5 minutes) to reduce API calls
    - Handle secret rotation gracefully (retry on auth failure with fresh secret)
    - _Requirements: 11.5, 11.6_

- [ ] 6. Cognito User Pool setup
  - [x] 6.1 Create Cognito module with user pool and app client
    - Create `infrastructure/modules/cognito/`
    - Define User Pool with email/username sign-in, password policy (min 6 chars)
    - Configure email verification via SES
    - Create App Client with OAuth 2.0 flows (authorization code, implicit)
    - Configure token expiry: access token 1 hour, refresh token 7 days
    - _Requirements: 3.1, 3.2, 3.4, 3.8_

  - [x] 6.2 Configure Google OAuth federation in Cognito
    - Add Google as identity provider in Cognito User Pool
    - Configure attribute mapping (email, name, picture)
    - Set up hosted UI domain for OAuth callback handling
    - Define user pool triggers for post-confirmation (create Taskly user record)
    - _Requirements: 3.3_

  - [x] 6.3 Create Cognito pre/post authentication Lambda triggers
    - Create `backend/lambda/triggers/post-confirmation.js` to create user record in DocumentDB on signup
    - Create `backend/lambda/triggers/pre-token-generation.js` to add custom claims (userId, roles)
    - Wire triggers to Cognito User Pool in Terraform
    - _Requirements: 3.3, 3.6_

- [ ] 7. S3 buckets and CloudFront distributions
  - [x] 7.1 Create S3 module for file uploads bucket
    - Create `infrastructure/modules/s3/`
    - Define uploads bucket with versioning, server-side encryption (AES-256)
    - Configure lifecycle rules: incomplete multipart upload cleanup after 24 hours
    - Configure lifecycle rules: transition to Intelligent-Tiering after 90 days
    - Block all public access, configure CORS for pre-signed URL uploads
    - _Requirements: 4.2, 4.3, 4.6, 4.7, 4.8, 11.7, 12.4_

  - [x] 7.2 Create S3 bucket for frontend static hosting
    - Define frontend assets bucket with versioning and encryption
    - Block all public access (served exclusively via CloudFront)
    - Configure bucket policy for CloudFront Origin Access Control
    - _Requirements: 5.1, 5.7_

  - [x] 7.3 Create CloudFront distribution for frontend
    - Create `infrastructure/modules/cloudfront/`
    - Define distribution with S3 origin and Origin Access Control
    - Configure custom error responses: 403/404 → index.html (SPA routing)
    - Enable gzip and Brotli compression
    - Set cache behaviors: hashed assets (1 year, immutable), index.html (no-cache)
    - Enforce HTTPS, redirect HTTP to HTTPS
    - Use PriceClass_100 (North America + Europe)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6, 12.6_

  - [x] 7.4 Create CloudFront distribution for uploaded files
    - Define separate distribution for S3 uploads bucket
    - Configure Origin Access Control for uploads bucket
    - Set cache TTL of 24 hours with cache invalidation support
    - Restrict access to signed URLs only
    - _Requirements: 4.5, 4.8_

- [~] 8. Checkpoint - Validate core infrastructure modules
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Lambda function packaging and Express adapter
  - [x] 9.1 Create Lambda handler wrapper for Express application
    - Create `backend/lambda/handler.js` using `@vendia/serverless-express` or custom adapter
    - Configure the adapter to translate API Gateway HTTP API events to Express req/res
    - Handle Lambda context (requestId for correlation IDs)
    - Configure connection reuse for DocumentDB (connection pooling across warm invocations)
    - _Requirements: 1.1, 1.2, 1.7_

  - [x] 9.2 Refactor backend configuration for Lambda environment
    - Create `backend/config/aws.js` to initialize AWS SDK clients (Secrets Manager, S3, SES, EventBridge)
    - Modify `backend/server.js` to conditionally export app (Lambda) or listen (local dev)
    - Replace `dotenv` environment variables with Secrets Manager lookups for production
    - Remove PM2, express-session (stateless JWT), and connect-mongo dependencies
    - _Requirements: 1.2, 11.5, 11.6_

  - [x] 9.3 Adapt authentication middleware for Cognito JWT validation
    - Modify `backend/middleware/auth.js` to validate Cognito JWT tokens
    - Use `aws-jwt-verify` library to verify token signature, expiry, and audience
    - Extract user claims (sub, email, custom:userId) from validated token
    - Maintain backward compatibility for local development with existing JWT
    - _Requirements: 3.6, 3.7_

  - [x] 9.4 Adapt file upload routes for S3 pre-signed URLs
    - Modify `backend/routes/upload.js` to generate S3 pre-signed upload URLs
    - Replace Cloudinary upload logic with S3 `PutObject` pre-signed URL generation
    - Add file type validation (jpg, jpeg, png, gif, webp, svg for avatars; 25MB max for attachments)
    - Create image processing Lambda trigger for avatar resizing (400x400)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 9.5 Write unit tests for Lambda handler and auth middleware
    - Test API Gateway event translation to Express request
    - Test Cognito JWT validation with valid/expired/malformed tokens
    - Test S3 pre-signed URL generation with correct parameters
    - _Requirements: 1.1, 1.7, 3.6, 3.7_

- [ ] 10. API Gateway configuration
  - [x] 10.1 Create API Gateway module with HTTP API
    - Create `infrastructure/modules/apigateway/`
    - Define HTTP API (not REST API) for lower latency and cost
    - Configure Cognito JWT authorizer for protected routes
    - Define route integrations mapping to Lambda function
    - Set timeout to 29 seconds, payload format version 2.0
    - _Requirements: 1.1, 1.5, 3.6, 3.7_

  - [x] 10.2 Configure API Gateway routes and stages
    - Define all API routes matching existing Express routes (auth, users, tasks, projects, teams, invitations, notifications, search, calendar, upload)
    - Configure CORS settings matching current frontend origin
    - Set up stage variables for environment-specific configuration
    - Enable access logging to CloudWatch
    - _Requirements: 1.1, 1.2, 10.1_

  - [x] 10.3 Create Lambda function Terraform resources
    - Create `infrastructure/modules/lambda/`
    - Define Lambda function resource with ARM64 architecture (Graviton2)
    - Configure VPC attachment (private subnets, Lambda security group)
    - Set memory (256MB-512MB based on route complexity) and timeout (29s)
    - Configure environment variables pointing to Secrets Manager ARNs
    - Set reserved concurrency limits per environment
    - _Requirements: 1.3, 1.6, 11.4, 12.1, 12.5_

- [ ] 11. SES domain verification and email templates
  - [x] 11.1 Create SES module with domain verification
    - Create `infrastructure/modules/ses/`
    - Configure domain identity verification with DNS records (SPF, DKIM, DMARC)
    - Output DNS records needed for domain verification
    - Configure SES sending authorization policy
    - Request production access (move out of sandbox) documentation
    - _Requirements: 6.2_

  - [x] 11.2 Migrate email templates to SES and create email service
    - Create `backend/services/emailService.js` using AWS SES SDK
    - Migrate existing email templates (password reset, team invitation, notification digest) from Nodemailer/Resend to SES
    - Implement email sending with SQS integration for buffering
    - Add retry logic with exponential backoff (3 attempts)
    - _Requirements: 6.1, 6.3, 6.4, 6.5_

  - [x] 11.3 Write unit tests for email service
    - Test email template rendering with various data inputs
    - Test SQS message publishing for email queue
    - Test retry logic on simulated SES failures
    - _Requirements: 6.1, 6.3, 6.4_

- [ ] 12. EventBridge and SQS setup
  - [x] 12.1 Create EventBridge module with event bus and rules
    - Create `infrastructure/modules/eventbridge/`
    - Define custom event bus for Taskly application events
    - Create rules for: `task.completed`, `team.member.added`, `project.updated`, `user.activity`
    - Configure rule targets pointing to processing Lambda functions
    - _Requirements: 7.1, 7.4_

  - [x] 12.2 Create SQS module with queues and dead-letter queues
    - Create `infrastructure/modules/sqs/`
    - Define email queue with DLQ (maxReceiveCount: 3)
    - Define notification batch queue with DLQ
    - Define event processing DLQ for failed EventBridge events
    - Configure visibility timeout, message retention (14 days for DLQ)
    - _Requirements: 7.3, 7.5, 6.3, 6.5_

  - [x] 12.3 Create event publishing service and async processors
    - Create `backend/services/eventService.js` to publish events to EventBridge
    - Create `backend/lambda/processors/achievement-processor.js` for task completion events
    - Create `backend/lambda/processors/notification-processor.js` for notification batching
    - Create `backend/lambda/processors/email-processor.js` for SQS email queue consumer
    - Ensure all processors complete within 60 seconds
    - _Requirements: 7.1, 7.2, 7.5, 7.6_

  - [x] 12.4 Refactor synchronous notification/achievement logic to event-driven
    - Modify task completion handlers to publish events instead of inline processing
    - Modify team membership handlers to publish events for notifications
    - Remove synchronous achievement checking from API request path
    - Wire EventBridge rules to processor Lambda functions in Terraform
    - _Requirements: 7.1, 7.2, 7.4_

- [x] 13. Checkpoint - Validate application layer migration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. WAF rules and security hardening
  - [x] 14.1 Create WAF module with managed rule groups
    - Create `infrastructure/modules/waf/`
    - Attach WAF WebACL to API Gateway
    - Enable AWS Managed Rules: Core Rule Set (CRS), Known Bad Inputs, SQL Injection, XSS
    - Configure rate-limiting rule: 1000 requests per IP per 5-minute window
    - Configure IP blocking action for rate limit violations
    - _Requirements: 11.1, 11.2_

  - [x] 14.2 Configure TLS and additional security settings
    - Enforce TLS 1.2 minimum on API Gateway custom domain
    - Configure security headers via CloudFront response headers policy
    - Enable API Gateway access logging with request/response details
    - Verify all S3 buckets have public access blocked
    - _Requirements: 11.7, 11.8_

- [ ] 15. CloudWatch dashboards and alarms
  - [x] 15.1 Create CloudWatch module with custom metrics and structured logging
    - Create `infrastructure/modules/monitoring/`
    - Configure Lambda function log groups with 30-day retention
    - Create metric filters for: error rate, latency percentiles, cold starts
    - Create log subscription filter to archive logs to S3 after 30 days (90-day retention)
    - _Requirements: 10.1, 10.2, 10.6_

  - [x] 15.2 Create CloudWatch alarms and SNS notifications
    - Define alarm: API error rate > 5% over 5-minute window → SNS notification
    - Define alarm: Lambda cold start > 3 seconds → warning notification
    - Define alarm: DocumentDB failover event → critical notification
    - Define alarm: Monthly cost exceeds budget threshold → billing alert
    - Define alarm: SES bounce rate > 5% → warning notification
    - Create SNS topic for operations team notifications
    - _Requirements: 10.3, 10.4, 10.7, 12.3, 6.6_

  - [x] 15.3 Create CloudWatch dashboard
    - Define dashboard with widgets: request volume, latency distribution (p50/p95/p99), error breakdown
    - Add database performance metrics (connections, CPU, memory)
    - Add cost metrics and Lambda concurrent execution tracking
    - Add email delivery rate and bounce rate panels
    - _Requirements: 10.5_

  - [x] 15.4 Add structured logging with correlation IDs to Lambda functions
    - Create `backend/utils/logger.js` with JSON structured logging
    - Include correlation ID (API Gateway requestId) in all log entries
    - Add request/response logging middleware with latency tracking
    - Configure log levels per environment (debug for dev, info for prod)
    - _Requirements: 10.1, 10.2, 1.7_

- [ ] 16. CI/CD pipeline (GitHub Actions)
  - [x] 16.1 Create infrastructure deployment workflow
    - Create `.github/workflows/infrastructure-deploy.yml`
    - Configure Terraform init, plan, apply stages
    - Run on push to main (paths: `infrastructure/**`)
    - Use OIDC for AWS authentication (no long-lived credentials)
    - Deploy infrastructure before application code
    - Store plan output as artifact (30-day retention)
    - _Requirements: 8.1, 8.2, 8.6, 8.8_

  - [x] 16.2 Create backend Lambda deployment workflow
    - Rewrite `.github/workflows/backend-deploy.yml` for Lambda deployment
    - Stages: lint → test → build → package → deploy
    - Package Lambda function with production dependencies (exclude tests, dev deps)
    - Deploy using AWS CLI `lambda update-function-code`
    - Implement canary deployment: deploy to alias, shift 10% traffic, monitor errors, promote or rollback
    - Automatic rollback if error rate exceeds 1%
    - _Requirements: 8.1, 8.4, 8.7, 8.8_

  - [x] 16.3 Create frontend deployment workflow
    - Rewrite `.github/workflows/frontend-deploy.yml` for S3/CloudFront deployment
    - Stages: lint → test → build → deploy to S3 → invalidate CloudFront
    - Sync build output to S3 frontend bucket
    - Create CloudFront invalidation for `/*` on deploy
    - _Requirements: 8.1, 8.5, 5.5_

  - [x] 16.4 Create PR validation workflow
    - Create `.github/workflows/pr-validation.yml`
    - Run lint and test stages for both backend and frontend on PR
    - Run `terraform plan` (no apply) for infrastructure changes
    - Do NOT deploy on pull requests
    - Notify team on pipeline failure
    - _Requirements: 8.3, 8.7_

- [x] 17. Checkpoint - Validate CI/CD pipelines
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Data migration scripts
  - [x] 18.1 Create MongoDB to DocumentDB migration script
    - Create `scripts/migration/migrate-data.js`
    - Implement collection-by-collection data transfer using `mongodump`/`mongorestore` or programmatic approach
    - Validate record counts match between source and destination for each collection
    - Preserve all indexes (text search, compound, unique) with DocumentDB compatibility checks
    - Log any schema incompatibilities and apply documented transformations
    - _Requirements: 14.1, 14.2, 14.3, 14.7_

  - [x] 18.2 Create migration validation and rollback scripts
    - Create `scripts/migration/validate-migration.js` to verify data integrity post-migration
    - Create `scripts/migration/rollback-migration.js` to restore original MongoDB connection within 15 minutes
    - Implement checksum comparison for critical collections (users, tasks, projects)
    - Ensure read availability from source during migration
    - _Requirements: 14.2, 14.4, 14.5_

  - [x] 18.3 Create migration runbook with maintenance window procedure
    - Create `scripts/migration/README.md` with step-by-step migration procedure
    - Document pre-migration checklist, execution steps, validation steps, rollback procedure
    - Ensure migration completes within 2-hour maintenance window for up to 10GB
    - Include connection string switchover procedure
    - _Requirements: 14.4, 14.5, 14.6_

- [ ] 19. Disaster recovery configuration
  - [x] 19.1 Configure cross-region backup replication
    - Enable DocumentDB continuous backup for 5-minute RPO
    - Configure S3 cross-region replication for critical buckets
    - Document RTO of 30 minutes for cluster recovery
    - Create backup verification script
    - _Requirements: 13.1, 13.2, 13.4, 13.5_

  - [x] 19.2 Configure DNS failover and maintenance page
    - Create Route 53 health check for API Gateway endpoint
    - Configure DNS failover to static S3 maintenance page
    - Set failover TTL to 60 seconds
    - Document regional redeployment procedure using Terraform (2-hour target)
    - _Requirements: 13.7, 13.6_

- [ ] 20. Final integration and wiring
  - [x] 20.1 Create environment-specific Terraform variable files
    - Create `infrastructure/environments/dev/terraform.tfvars` with minimal resources (single DocumentDB instance, low concurrency)
    - Create `infrastructure/environments/staging/terraform.tfvars` with moderate resources
    - Create `infrastructure/environments/prod/terraform.tfvars` with full HA configuration
    - Wire all module outputs to dependent modules (VPC IDs → Lambda, DocumentDB endpoint → Secrets)
    - _Requirements: 9.2, 12.7_

  - [x] 20.2 Create application configuration wiring
    - Create `backend/config/production.js` that reads all config from Secrets Manager and environment variables
    - Update all service modules to use AWS SDK clients (S3, SES, EventBridge, SQS)
    - Ensure all Lambda functions have correct IAM permissions for their specific operations
    - Verify end-to-end request flow: CloudFront → API Gateway → Lambda → DocumentDB
    - _Requirements: 9.7, 11.9, 1.2_

  - [x] 20.3 Write end-to-end integration tests
    - Create `backend/tests/integration/aws-integration.test.js`
    - Test full request flow through API Gateway to Lambda
    - Test file upload flow with pre-signed URLs
    - Test authentication flow with Cognito tokens
    - Test event publishing and async processing
    - _Requirements: 1.2, 3.6, 4.1, 7.1_

- [x] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical boundaries
- Infrastructure modules should be applied in order: VPC → DocumentDB → Secrets → Cognito → S3/CloudFront → Lambda/API Gateway → EventBridge/SQS → WAF → Monitoring
- The existing Express codebase is adapted (not rewritten) using serverless-express adapter for Lambda compatibility
- All Terraform modules use HCL syntax; Lambda functions use JavaScript (Node.js 18+ runtime)
- Local development should continue to work with existing Docker/MongoDB setup alongside the AWS deployment path

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "5.1"] },
    { "id": 2, "tasks": ["2.2", "5.2"] },
    { "id": 3, "tasks": ["4.1", "6.1", "7.1", "7.2"] },
    { "id": 4, "tasks": ["4.2", "6.2", "7.3", "7.4", "11.1"] },
    { "id": 5, "tasks": ["4.3", "6.3", "9.1", "9.2", "11.2"] },
    { "id": 6, "tasks": ["9.3", "9.4", "11.3", "12.1", "12.2"] },
    { "id": 7, "tasks": ["9.5", "10.1", "12.3"] },
    { "id": 8, "tasks": ["10.2", "10.3", "12.4"] },
    { "id": 9, "tasks": ["14.1", "14.2", "15.1", "15.4"] },
    { "id": 10, "tasks": ["15.2", "15.3", "16.1"] },
    { "id": 11, "tasks": ["16.2", "16.3", "16.4"] },
    { "id": 12, "tasks": ["18.1", "19.1"] },
    { "id": 13, "tasks": ["18.2", "18.3", "19.2"] },
    { "id": 14, "tasks": ["20.1", "20.2"] },
    { "id": 15, "tasks": ["20.3"] }
  ]
}
```
