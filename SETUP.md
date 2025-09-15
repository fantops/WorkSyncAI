# WorkSync AI - Setup Guide

## 🚀 Quick Setup for Hackathon Demo

### Prerequisites Installation

#### 1. Install Node.js
**Option A: Direct Download (Recommended)**
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version (18.x or 20.x)
3. Run the installer and follow the setup wizard
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

**Option B: Using Chocolatey (if you have it)**
```powershell
choco install nodejs
```

**Option C: Using Winget**
```powershell
winget install OpenJS.NodeJS
```

#### 2. Install Git (if not already installed)
```powershell
winget install Git.Git
```

### Project Setup

#### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
copy .env.example .env

# Edit .env file with your configurations
# - Add your Azure AD app registration details
# - Configure ADO organization settings
notepad .env
```

#### 2. Frontend Setup
```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Copy environment template (if exists)
copy .env.example .env

# Edit frontend environment
notepad .env
```

### Azure AD App Registration

#### Step 1: Create Azure AD App
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in:
   - **Name**: WorkSync AI Demo
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: 
     - Platform: Web
     - URI: `http://localhost:3001/api/v1/auth/microsoft/callback`

#### Step 2: Configure Permissions
1. Go to **API permissions**
2. Add permissions:
   - **Microsoft Graph**: `User.Read`
   - **Azure DevOps**: `user_impersonation`
3. Click **Grant admin consent**

#### Step 3: Create Federated Credentials with Managed Identity
1. Go to **Certificates & secrets**
2. Click the **Federated credentials** tab
3. Click **Add credential**
4. Select **Managed identity**
5. Fill in:
   - **Subscription**: Select your Azure subscription
   - **Resource group**: Select the resource group where your app will be deployed
   - **Managed identity**: Select the managed identity for your Azure service (App Service, Container Instance, etc.)
   - **Name**: `worksync-ai`
   - **Description**: `Managed identity credential for WorkSync AI demo`

**Alternative for local development:**
If you need client secret for local testing:
1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Description: "WorkSync AI Local Dev"
4. Expires: 6 months
5. **Copy the secret value** (you won't see it again!)

#### Step 4: Update Environment Variables
Update your `backend/.env` file:

**For Managed Identity (Azure deployment):**
```bash
MICROSOFT_CLIENT_ID=your-app-id-from-step-1
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_USE_MANAGED_IDENTITY=true
ADO_DEFAULT_ORGANIZATION=your-ado-organization-name
```

**For Client Secret (local dev only):**
```bash
MICROSOFT_CLIENT_ID=your-app-id-from-step-1
MICROSOFT_CLIENT_SECRET=your-secret-from-step-3
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_USE_MANAGED_IDENTITY=false
ADO_DEFAULT_ORGANIZATION=your-ado-organization-name
```

### Running the Application

#### Start Backend Server
```bash
# From backend directory
npm run dev
# Server starts on http://localhost:3001
```

#### Start Frontend Development Server
```bash
# From frontend directory (new terminal)
npm run dev
# App opens on http://localhost:3000
```

### Testing ADO Integration

#### 1. Test ADO Service
```bash
# From backend directory
node test/ado-integration-test.js
```

#### 2. Test API Endpoints
Use a tool like Postman or curl:

```bash
# Health check
curl http://localhost:3001/api/v1/health

# Test ADO connection (after authentication)
curl -H "Authorization: Bearer your-jwt-token" \
     http://localhost:3001/api/v1/ado/test-connection
```

## 🎯 Demo Preparation Checklist

### Day 1 - Core Setup (2 hours)
- [ ] Install Node.js and dependencies
- [ ] Create Azure AD app registration
- [ ] Configure environment variables
- [ ] Test backend server startup
- [ ] Verify ADO service connectivity

### Day 2 - Authentication Integration (3 hours)
- [ ] Implement Microsoft OAuth flow
- [ ] Update frontend for Microsoft login
- [ ] Test end-to-end authentication
- [ ] Store ADO credentials securely

### Day 3 - ADO Data Integration (2 hours)
- [ ] Connect to real ADO organization
- [ ] Test work item retrieval
- [ ] Verify data transformation
- [ ] Handle edge cases and errors

### Day 4 - Priority Engine (2 hours)
- [ ] Implement rule-based scoring
- [ ] Add communication context simulation
- [ ] Test priority calculations
- [ ] Create sample demo data

### Days 5-6 - UI Polish (4 hours)
- [ ] Build task dashboard
- [ ] Show priority explanations
- [ ] Add user feedback system
- [ ] Create smooth demo flow

### Day 7 - Demo Preparation (2 hours)
- [ ] Prepare demo scenarios
- [ ] Test full user flow
- [ ] Create presentation slides
- [ ] Practice 5-minute pitch

## 🔧 Troubleshooting

### Common Issues

#### Node.js Installation
- **Issue**: "node is not recognized"
- **Fix**: Restart PowerShell/terminal after installation
- **Alternative**: Use full path: `C:\Program Files\nodejs\node.exe`

#### Permission Errors
```powershell
# If you get execution policy errors
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Port Conflicts
- Backend (3001): Check if anything else is using this port
- Frontend (3000): Vite will automatically try 3001, 3002, etc.

#### ADO Connection Issues
- Verify organization name (exact spelling)
- Check Azure AD app permissions
- Ensure user has ADO access
- Test with Postman first

### Getting Help
- **Azure AD Setup**: [Microsoft Docs](https://docs.microsoft.com/en-us/azure/active-directory/)
- **ADO API**: [Azure DevOps REST API Docs](https://docs.microsoft.com/en-us/rest/api/azure/devops/)
- **React + MSAL**: [Microsoft Authentication Library](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-overview)

## 🎪 Demo Success Tips

### Technical Tips
1. **Prepare Sample Data**: Have a few work items in your ADO project
2. **Test Scenarios**: Create realistic priority conflicts to demonstrate
3. **Backup Plan**: Have screenshots ready in case of live demo issues
4. **Clean UI**: Focus on polish over features

### Presentation Tips
1. **Start with Problem**: Show the pain of scattered task information
2. **Demo Real Data**: Use actual ADO tasks, not mock data
3. **Explain Intelligence**: Show why AI ranked tasks differently
4. **Future Vision**: Paint the enterprise integration picture

### Winning Strategy
- **Real Integration** beats mockups every time
- **Clear Value Prop**: Time saved per person daily
- **Enterprise Focus**: Built for Microsoft ecosystem
- **Learning Foundation**: Shows path to advanced AI

---

**Ready to build the winning hackathon demo!** 🚀

For questions or issues during setup, check the troubleshooting section above or create demo data to ensure a smooth presentation.