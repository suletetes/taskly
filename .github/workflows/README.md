# CI/CD Workflows

Automated testing and deployment workflows for Taskly.

## Current Setup

### ✅ Active Workflows (No Secrets Required)

These workflows run automatically on every push and pull request:

#### 1. Frontend CI/CD (`frontend-deploy.yml`)
- **Triggers**: Push/PR to `main` or `develop` branches
- **What it does**:
  - Lints code
  - Runs tests
  - Checks for security vulnerabilities
  - Builds application for development and production
  - Creates build artifacts

#### 2. Backend CI/CD (`backend-deploy.yml`)
- **Triggers**: Push/PR to `main` or `develop` branches
- **What it does**:
  - Starts MongoDB test database
  - Lints code
  - Runs tests
  - Checks for security vulnerabilities
  - Creates deployment package
  - Uploads artifacts

## How to Use

### 1. Push Code to Trigger CI

```bash
git add .
git commit -m "Your changes"
git push origin main
```

### 2. View Workflow Results

1. Go to your GitHub repository
2. Click on "Actions" tab
3. See the running/completed workflows
4. Click on any workflow to see detailed logs

### 3. Download Build Artifacts

After a successful build:
1. Go to Actions → Select workflow run
2. Scroll down to "Artifacts" section
3. Download the build files

## Adding Deployment (Optional)

When you're ready to deploy, uncomment the deployment jobs in the workflow files and add these secrets:

### GitHub Secrets Required

Go to: Repository → Settings → Secrets and variables → Actions

#### For Vercel Deployment:
```
VERCEL_TOKEN - Your Vercel API token
VERCEL_ORG_ID - Your Vercel organization ID
VERCEL_PROJECT_ID - Your Vercel project ID
```

#### For Self-Hosted Deployment:
```
STAGING_HOST - Staging server IP/hostname
STAGING_USER - SSH username
STAGING_SSH_KEY - Private SSH key
PROD_HOST - Production server IP/hostname
PROD_USER - SSH username
PROD_SSH_KEY - Private SSH key
```

## Workflow Status Badges

Add these to your README.md to show build status:

```markdown
![Frontend CI](https://github.com/yourusername/taskly/workflows/Frontend%20CI/CD/badge.svg)
![Backend CI](https://github.com/yourusername/taskly/workflows/Backend%20CI/CD/badge.svg)
```

## Local Testing

Test the build process locally before pushing:

### Frontend
```bash
cd frontend
npm ci
npm run lint
npm test
npm run build
```

### Backend
```bash
cd backend
npm ci
npm run lint
npm test
```

## Troubleshooting

### Workflow Fails on Lint

Fix linting errors:
```bash
cd frontend  # or backend
npm run lint
```

### Workflow Fails on Tests

Run tests locally to debug:
```bash
cd frontend  # or backend
npm test
```

### MongoDB Connection Issues (Backend)

The workflow uses MongoDB 5.0 in a Docker container. If tests fail:
- Check MongoDB connection string in test
- Verify test environment variables

### Build Artifacts Not Created

- Check if the build step completed successfully
- Verify the `dist` folder exists after build
- Check workflow logs for errors

## Customization

### Change Trigger Branches

Edit the workflow file:

```yaml
on:
  push:
    branches: [main, develop, your-branch]
```

### Add More Environments

Add a new build matrix:

```yaml
strategy:
  matrix:
    environment: [development, staging, production]
```

### Skip CI for Specific Commits

Add to commit message:
```bash
git commit -m "Your message [skip ci]"
```

## Next Steps

1. ✅ Workflows are running automatically
2. ⏳ Add deployment when infrastructure is ready
3. ⏳ Add environment-specific secrets
4. ⏳ Configure custom domains
5. ⏳ Setup monitoring and alerts

## Support

For issues with workflows:
1. Check the Actions tab for error logs
2. Review this documentation
3. Check GitHub Actions documentation
4. Open an issue in the repository
