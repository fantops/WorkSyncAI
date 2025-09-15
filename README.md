# WorkSync AI# WorkSync AI - Hackathon Demo



**A simplified, focused task management system that integrates with Azure DevOps to provide a streamlined view of your personal work items.****An intelligent Azure DevOps task prioritization assistant that connects your ADO taskboard with communication context for smarter work prioritization.**



## 🎯 What This Does## 🎯 What This Demo Shows (7-Day Sprint)



**The Problem**: Managing work items across Azure DevOps can be overwhelming with complex filters and multiple work item types.**The Problem**: Your tasks in Azure DevOps look equal priority, but the real urgency is hidden in Teams chats and emails.



**Our Solution**: A clean, personal dashboard that shows all your assigned work items (Tasks, Bugs, Scenarios, Deliverables) in one simple interface.**Our Solution**: WorkSync AI connects ADO + Teams + Outlook to show you exactly what to work on next, with intelligent reasoning.



## 🚀 Quick Start## 🚀 Quick Start (Demo Setup)



### Prerequisites### Prerequisites

- Node.js 18+- Node.js 18+

- Azure DevOps Personal Access Token with Work Items Read scope- Microsoft work account (for ADO/Teams integration)

- Access to Azure DevOps organization- Azure DevOps organization access



### Setup### 1. Backend Setup

```bash

1. **Clone the repository**cd backend

   ```bashnpm install

   git clone https://github.com/fantops/WorkSyncAI.gitcp .env.example .env

   cd WorkSyncAI# Add your Microsoft app registration details

   ```npm run dev

```

2. **Backend Setup**

   ```bash### 2. Frontend Setup

   cd backend```bash

   npm installcd frontend

   ```npm install

npm run dev

3. **Environment Configuration**```

   Create `backend/.env` file:

   ```env### 3. Access Demo

   ADO_PERSONAL_ACCESS_TOKEN=your-pat-token-here- Open http://localhost:3000

   ADO_DEFAULT_ORGANIZATION=microsoft.visualstudio.com- Login with Microsoft OAuth

   NODE_ENV=development- See your real ADO tasks with intelligent prioritization

   PORT=3001

   ```## 🎯 Hackathon Demo Features (20-Hour Implementation)



4. **Start the Backend**### ✅ Days 1-2: Core Integration (8 hours)

   ```bash1. **Microsoft OAuth Authentication** - Real Microsoft work account login

   npm start2. **Azure DevOps Integration** - Pull actual tasks from your ADO organization

   ```3. **Basic Communication Scanning** - Detect urgency keywords in sample data



5. **Test the API**### ✅ Days 3-4: Intelligence Engine (6 hours)  

   ```bash4. **Priority Recommendation System** - AI ranks your ADO tasks with reasoning

   # Test connection5. **Task Dashboard** - Clean display of prioritized tasks with explanations

   curl http://localhost:3001/health6. **Execution Guidance** - Template-based step-by-step task breakdown

   

   # Run comprehensive test### ✅ Days 5-7: Demo Polish (6 hours)

   node test/simple-backlog-test.js7. **User Feedback System** - Rate recommendation accuracy  

   ```8. **Learning Foundation** - Track user choices for future ML

9. **Presentation Ready** - Smooth demo flow and compelling story

## ✅ Features Implemented

## 🛠️ Tech Stack (Focused for Demo)

- **Personal Work Items**: View all your assigned work items in one place

- **Azure DevOps Integration**: Direct connection using Personal Access Token- **Frontend**: React 18 + Vite + Tailwind CSS + MSAL (Microsoft Auth)

- **Multiple Work Item Types**: Tasks, Bugs, Scenarios, Deliverables, Task Groups- **Backend**: Node.js + Express + SQLite + Azure DevOps REST API

- **State Filtering**: Filter by organization-specific states (Started, Committed, Proposed, Active, etc.)- **Intelligence**: Rule-based priority scoring (no ML required for demo)

- **Project Discovery**: Automatically discovers all accessible ADO projects- **Integration**: Microsoft Graph API + Azure DevOps API

- **Clean API**: RESTful endpoints with proper error handling

- **Comprehensive Testing**: API test suite included## 📁 Project Structure (Hackathon-Focused)



## 🛠️ Tech Stack (Simplified)```

worksync-ai/

- **Backend**: Node.js + Express + Azure DevOps REST API├── backend/                    # Express.js API server

- **Authentication**: Personal Access Token (PAT) - Simple and secure│   ├── src/

- **Database**: None needed - direct API integration│   │   ├── models/            # User and Task models

- **Frontend**: React 18 + Vite (coming soon)│   │   ├── routes/            # Microsoft Auth + ADO API routes

│   │   ├── services/          # Azure DevOps and Microsoft Graph integration

## 📁 Project Structure│   │   ├── middleware/        # OAuth validation

│   │   ├── config/            # Microsoft app registration config

```│   │   └── server.js          # Main server file

worksync-ai/│   └── package.json           # Backend dependencies (@azure/msal-node, axios)

├── backend/├── frontend/                  # React application

│   ├── src/│   ├── src/

│   │   ├── services/adoService.js    # Core ADO integration│   │   ├── components/        # Task display and priority visualization

│   │   ├── routes/ado.js             # API routes│   │   ├── pages/             # Dashboard and auth pages

│   │   ├── middleware/               # Error handling│   │   ├── services/          # Microsoft OAuth + API calls

│   │   ├── utils/                    # Logging utilities│   │   └── hooks/             # ADO data fetching hooks

│   │   └── server.js                 # Express server│   └── package.json           # Frontend dependencies (@azure/msal-browser)

│   ├── test/                         # API tests├── docs/                      # Implementation documentation

│   │   ├── simple-backlog-test.js    # Main test file│   ├── HLD.md                # Simplified architecture for hackathon

│   │   └── other test files│   └── API.md                # Essential endpoints for demo

│   └── package.json├── TEAM_OVERVIEW.md          # 7-day implementation plan

├── frontend/                         # React app (planned)└── README.md                 # This file (demo-focused)

├── .gitignore                        # Comprehensive ignore rules```

└── README.md

```## 🎨 Demo User Flow (5-Minute Presentation)



## 🔧 API Endpoints1. **Problem Setup** (1 min)

   - Show ADO taskboard - all tasks look equal priority

### Core Endpoints   - Show Teams chat with urgent escalations

- `GET /health` - Health check   - "The important stuff is buried in communications"

- `GET /api/v1/ado/projects` - List accessible ADO projects

- `GET /api/v1/ado/backlog/:projectId` - Get personal backlog items2. **WorkSync Solution** (3 min)  

- `GET /api/v1/ado/workitem/:workItemId` - Get specific work item details   - Login with Microsoft account (OAuth working)

- `GET /api/v1/ado/test-connection` - Test ADO connection   - See real ADO tasks loaded automatically  

   - Tasks re-prioritized with AI reasoning

### Query Parameters   - "Bug #1234 moved to top - mentioned 3x in urgent Teams messages"

- `assignedToMe=true` - Filter items assigned to you   - Click task → see execution guidance

- `states=Started,Committed,Proposed,Active` - Filter by work item states

- `types=Scenario,Deliverable,Task,Bug,Task Group` - Filter by work item types3. **Enterprise Vision** (1 min)

- `top=20` - Limit number of results   - "This learns from your choices and gets smarter"

   - "Scales to team analytics and advanced ML"

## 📋 Work Item Types Supported   - "Built on Microsoft's productivity stack"



Based on your organization's configuration:## 🔧 Development

- **Scenario** - High-level requirements/features

- **Deliverable** - Specific deliverables### Essential API Endpoints (Hackathon Demo)

- **Task** - Development tasks- `GET /api/auth/microsoft` - Microsoft OAuth login redirect

- **Bug** - Issues to fix- `POST /api/auth/callback` - OAuth callback handler

- **Task Group** - Grouped tasks- `GET /api/ado/projects` - List user's ADO projects

- `GET /api/ado/workitems` - Fetch tasks from ADO

## 📊 States Supported- `POST /api/priority/analyze` - AI priority scoring with reasoning

- `POST /api/feedback` - User rating for recommendations

- **Started** - Work in progress

- **Committed** - Committed to sprint### Environment Variables (Microsoft Integration)

- **Proposed** - Proposed for consideration```bash

- **Active** - Active items# Backend (.env)

- **Completed** - Finished itemsMICROSOFT_CLIENT_ID=your-azure-app-id

- **Cut** - Removed from scopeMICROSOFT_CLIENT_SECRET=your-azure-app-secret

- **Resolved** - Bugs resolvedMICROSOFT_REDIRECT_URI=http://localhost:3001/api/auth/callback

- **Closed** - Completed bugsADO_ORGANIZATION=your-ado-org



## 🧪 Testing# Frontend (.env)  

VITE_API_BASE_URL=http://localhost:3001/api

```bashVITE_MICROSOFT_CLIENT_ID=your-azure-app-id

# Test the complete API```

cd backend

node test/simple-backlog-test.js## 🎯 Why This Will Win The Hackathon



# Start development server### ✅ **Real Integration, Not Mockups**

npm run dev- Actual Microsoft OAuth authentication working

```- Real ADO tasks pulled from user's organization

- Functional priority recommendations with reasoning

## 🎯 Architecture Highlights

### ✅ **Solves Universal Enterprise Problem**  

### ✅ **Simplified Authentication**- Every Microsoft-using company has scattered task context

- No complex OAuth flows- Immediate ROI - hours saved per person daily

- Personal Access Token based- No training required - works behind the scenes

- Direct API integration

### ✅ **Technical Excellence in 20 Hours**

### ✅ **Clean Integration**  - Working end-to-end integration with Microsoft APIs  

- Direct Azure DevOps REST API calls- Clean, demo-ready UI with intelligent prioritization

- No intermediate database needed- Foundation for machine learning and team analytics

- Real-time data access

### ✅ **Clear Enterprise Vision**

### ✅ **Personal Focus**- Path from demo to production-ready solution

- Filters to show only your assigned items- Scalable to team management and advanced AI

- Support for organization-specific work item types- Built on Microsoft's existing productivity ecosystem

- Customizable state filtering

## 🚧 What's Out Of Scope (Phase 2)

### ✅ **Developer Friendly**

- Comprehensive logging- Advanced NLP for complex communication parsing

- Clean error handling- Full reinforcement learning ML implementation  

- Easy to extend and modify- Real-time background monitoring

- Team analytics and manager dashboards

## 🚧 Roadmap- Complex dynamic execution workflows



- [ ] React frontend with clean UI## ⚡ Getting Started (Implementation Day 1)

- [ ] Work item editing capabilities

- [ ] Priority scoring and recommendations1. **Azure App Registration**: Set up Microsoft app for OAuth

- [ ] Team analytics (future scope)2. **Development Environment**: Clone repo and install dependencies  

3. **Microsoft Integration**: Configure ADO organization access

## 📝 License4. **Demo Data**: Prepare sample tasks and communication scenarios

5. **Basic UI**: Get login flow and task display working

MIT License - feel free to use and modify as needed.

---

---

**Built for 7-Day Hackathon Sprint** - Focused demo that proves enterprise integration concept and shows clear path to production-scale learning system.
**Built for rapid development** - Clean, focused implementation that solves real productivity problems.