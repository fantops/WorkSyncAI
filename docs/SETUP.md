# WorkSync AI - Setup Guide

This guide provides detailed instructions for setting up WorkSync AI in your development environment and preparing for production deployment.

## Prerequisites

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **Git** - For cloning the repository
- **Azure DevOps Account** - With project access
- **Personal Access Token (PAT)** - With Work Items Read scope

## Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/fantops/WorkSyncAI.git
cd WorkSyncAI
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Environment Configuration

Create `.env` file in the backend directory:

```env
# Azure DevOps Configuration
ADO_PERSONAL_ACCESS_TOKEN=your-pat-token-here
ADO_DEFAULT_ORGANIZATION=microsoft.visualstudio.com

# Server Configuration  
NODE_ENV=development
PORT=3001

# Optional: Logging Level
LOG_LEVEL=info
```

### 4. Get Your Azure DevOps PAT

1. Go to [Azure DevOps](https://dev.azure.com/)
2. Click your profile → **Personal Access Tokens**
3. Click **New Token**
4. Configure:
   - **Name**: WorkSync AI Development
   - **Organization**: Select your organization
   - **Expiration**: 30 days (for development)
   - **Scopes**: Work Items (Read)
5. Copy the token and add to your `.env` file

### 5. Start the Backend

```bash
npm start
```

You should see:
```
WorkSync AI Backend server running on port 3001
Environment: development
Health check: http://localhost:3001/health
```

### 6. Test the Setup

```bash
# Test server health
curl http://localhost:3001/health

# Run comprehensive test suite
npm test
```

Expected test output:
```
🚀 WorkSync AI - API Test Suite
====================================
✅ Server is healthy
✅ ADO connection working  
✅ Found 124 projects
✅ Found 15 work items
📊 Test Summary: 5/5 passed
```

## Troubleshooting

### Common Issues

**❌ ADO Connection Failed**
```
Solution: Verify your PAT token has correct permissions and hasn't expired
Check: https://dev.azure.com → User Settings → Personal Access Tokens
```

**❌ No Projects Found**
```
Solution: Ensure your PAT has access to the organization specified in ADO_DEFAULT_ORGANIZATION
Check: Your user has project access in the ADO organization
```

**❌ Port Already in Use**
```
Solution: Change PORT in .env file or kill process using port 3001
Windows: netstat -ano | findstr :3001
Mac/Linux: lsof -ti:3001 | xargs kill
```

**❌ SSL Certificate Issues**
```
Solution: Add to .env file:
NODE_TLS_REJECT_UNAUTHORIZED=0
(Development only - never use in production)
```

### Debug Mode

Enable detailed logging:

```env
NODE_ENV=development
LOG_LEVEL=debug
```

This will show:
- All API requests and responses
- Detailed error messages
- Performance timing information

## Production Setup (Future)

### Environment Variables

```env
# Production Azure DevOps
ADO_PERSONAL_ACCESS_TOKEN=production-pat-token
ADO_DEFAULT_ORGANIZATION=your-company.visualstudio.com

# Production Server
NODE_ENV=production
PORT=3001

# Security
JWT_SECRET=your-secure-random-secret
CORS_ORIGIN=https://your-domain.com

# Microsoft Graph (Phase 2)
MICROSOFT_CLIENT_ID=azure-app-registration-id
MICROSOFT_CLIENT_SECRET=azure-app-secret
MICROSOFT_TENANT_ID=your-tenant-id

# Database (Phase 2)
DATABASE_URL=postgresql://user:pass@host:5432/worksync
REDIS_URL=redis://host:6379

# Monitoring
NEW_RELIC_LICENSE_KEY=your-key
SENTRY_DSN=your-sentry-dsn
```

### Security Checklist

- [ ] Use environment-specific PAT tokens
- [ ] Enable HTTPS with valid certificates
- [ ] Implement proper CORS configuration
- [ ] Add rate limiting for API endpoints
- [ ] Enable audit logging for compliance
- [ ] Regular security scanning of dependencies

### Deployment Options

**Azure App Service**:
```bash
# Install Azure CLI
az login
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name worksync-api --runtime "node|18-lts"
az webapp config appsettings set --resource-group myResourceGroup --name worksync-api --settings ADO_PERSONAL_ACCESS_TOKEN="your-token"
```

**Docker Deployment**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

**AWS Lambda** (with Serverless Framework):
```yaml
service: worksync-ai
provider:
  name: aws
  runtime: nodejs18.x
functions:
  api:
    handler: src/lambda.handler
    events:
      - http: ANY /{proxy+}
```

## Development Workflow

### Making Changes

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Make Changes**: Edit code, add tests

3. **Run Tests**:
   ```bash
   npm test
   npm run lint
   ```

4. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Add new feature: description"
   ```

5. **Push and Create PR**:
   ```bash
   git push origin feature/new-feature-name
   ```

### Code Quality

**ESLint Configuration**:
```json
{
  "extends": ["eslint:recommended", "node"],
  "env": {
    "node": true,
    "es2022": true
  },
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error"
  }
}
```

**Testing Standards**:
- Minimum 80% code coverage
- All API endpoints must have integration tests
- Error conditions must be tested
- Performance tests for critical paths

## Next Steps

Once you have the basic setup working:

1. **Explore the API**: Check out [API Documentation](./API.md)
2. **Understand Architecture**: Read [High-Level Design](./HLD.md)
3. **Review Roadmap**: See [Team Overview](../TEAM_OVERVIEW.md)
4. **Join Development**: Ready for Phase 2 Microsoft Graph integration

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/fantops/WorkSyncAI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/fantops/WorkSyncAI/discussions)
- **Email**: Contact the development team

---

*Ready to transform enterprise productivity with AI-powered workflow intelligence* 🎯