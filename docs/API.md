# WorkSync AI - API Documentation

## Overview

WorkSync AI provides RESTful API endpoints for Azure DevOps integration with plans for Microsoft Graph integration and AI-powered task prioritization. Currently in Phase 1 with a solid foundation ready for hackathon demo expansion.

## Implementation Phases

**✅ Phase 1 (COMPLETED)**: Secure ADO integration foundation  
**🚧 Phase 2 (HACKATHON SPRINT)**: Microsoft Graph + AI Priority Engine  
**🎯 Phase 3 (FUTURE)**: Advanced learning and team intelligence  

## Base URL

```
Development: http://localhost:3001
Production: TBD
```

---

## Phase 1 API Endpoints (CURRENT)

### Health & Status

#### GET /health
Server health check and status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-15T16:07:15.123Z",
  "version": "1.0.0",
  "uptime": 3600
}
```

### Azure DevOps Integration

#### GET /api/v1/ado/test-connection
Test ADO connection and authentication.

**Response:**
```json
{
  "success": true,
  "message": "ADO connection successful", 
  "organization": "microsoft.visualstudio.com",
  "user": "authenticated-user@microsoft.com"
}
```

#### GET /api/v1/ado/projects
Discover all accessible ADO projects for authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "8d47e068-03c8-4cdc-aa9b-fc6929290322",
      "name": "OS",
      "description": "Operating System Development",
      "state": "wellFormed",
      "visibility": "private",
      "lastUpdated": "2025-09-15T10:00:00Z",
      "url": "https://dev.azure.com/microsoft/OS"
    }
  ],
  "count": 124
}
```

#### GET /api/v1/ado/backlog/:projectId
Get personal backlog items from specific ADO project.

**Path Parameters:**
- `projectId` (string, required): ADO project GUID

**Query Parameters:**
- `assignedToMe` (boolean): Filter to current user's assignments (default: true)
- `states` (string): Comma-separated states (default: "Started,Committed,Proposed,Active")  
- `types` (string): Comma-separated work item types (default: "Task,Bug,Scenario,Deliverable")
- `top` (number): Maximum results to return (default: 50)

**Example:**
```
GET /api/v1/ado/backlog/8d47e068-03c8-4cdc-aa9b-fc6929290322?assignedToMe=true&states=Active,Started&types=Bug,Task&top=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "backlogItems": [
      {
        "id": 12345,
        "title": "Fix critical authentication bug in login service",
        "workItemType": "Bug", 
        "state": "Active",
        "assignedTo": {
          "displayName": "John Doe",
          "email": "user@microsoft.com",
          "id": "microsoft-user-guid"
        },
        "priority": 1,
        "severity": "High",
        "tags": ["authentication", "urgent", "client-facing"],
        "createdDate": "2025-09-10T09:00:00Z",
        "changedDate": "2025-09-15T14:30:00Z",
        "dueDate": "2025-09-18T17:00:00Z",
        "url": "https://dev.azure.com/microsoft/OS/_workitems/edit/12345",
        "project": {
          "id": "8d47e068-03c8-4cdc-aa9b-fc6929290322", 
          "name": "OS"
        }
      }
    ],
    "totalCount": 45,
    "filteredCount": 10,
    "queryInfo": {
      "assignedToMe": true,
      "states": ["Active", "Started"],
      "types": ["Bug", "Task"]
    }
  }
}
```

#### GET /api/v1/ado/workitem/:workItemId
Get detailed information for specific work item.

**Path Parameters:**
- `workItemId` (number, required): ADO work item ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 12345,
    "title": "Fix critical authentication bug in login service",
    "description": "Users are unable to login when using SSO authentication. Error appears intermittently and affects 20% of login attempts.",
    "workItemType": "Bug",
    "state": "Active", 
    "assignedTo": {
      "displayName": "John Doe",
      "email": "user@microsoft.com",
      "id": "microsoft-user-guid"
    },
    "priority": 1,
    "severity": "High",
    "effort": 8,
    "tags": ["authentication", "urgent", "client-facing"],
    "acceptanceCriteria": "Users can successfully login with SSO 100% of the time",
    "reproductionSteps": "1. Navigate to login page\n2. Click 'Sign in with SSO'\n3. Enter credentials\n4. Observe intermittent failures",
    "createdDate": "2025-09-10T09:00:00Z", 
    "changedDate": "2025-09-15T14:30:00Z",
    "dueDate": "2025-09-18T17:00:00Z",
    "url": "https://dev.azure.com/microsoft/OS/_workitems/edit/12345",
    "project": {
      "id": "8d47e068-03c8-4cdc-aa9b-fc6929290322",
      "name": "OS"
    }
  }
}
```

---

## Phase 2 API Endpoints (HACKATHON SPRINT)

### Microsoft Graph Integration (Planned)

#### GET /api/v1/graph/teams/messages
Scan Teams chats for work item mentions and urgency signals.

**Query Parameters:**
- `workItemId` (number): Focus on specific work item
- `timeRange` (string): Time window ("1h", "6h", "24h", "7d")
- `urgencyKeywords` (boolean): Filter for urgency indicators

**Planned Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "teams-message-id",
        "text": "Bug 12345 is critical - customer escalation received!",
        "author": "manager@microsoft.com",
        "timestamp": "2025-09-15T08:00:00Z",
        "urgencyScore": 0.9,
        "workItemMentions": [12345],
        "urgencyKeywords": ["critical", "escalation"],
        "chatId": "teams-chat-id"
      }
    ],
    "summary": {
      "totalMessages": 15,
      "urgentMessages": 3,
      "workItemMentions": 8,
      "averageUrgencyScore": 0.6
    }
  }
}
```

#### GET /api/v1/graph/outlook/emails
Find emails related to specific work items.

**Planned Response:**
```json
{
  "success": true,
  "data": {
    "emails": [
      {
        "id": "outlook-message-id", 
        "subject": "URGENT: Release blocker in work item 12345",
        "snippet": "This authentication issue is preventing our sprint delivery...",
        "sender": "product.owner@microsoft.com",
        "timestamp": "2025-09-15T10:30:00Z",
        "urgencyScore": 0.95,
        "workItemMentions": [12345],
        "urgencyKeywords": ["urgent", "blocker", "release"]
      }
    ]
  }
}
```

### AI Priority Engine (Planned)

#### POST /api/v1/ai/analyze-priorities
Analyze tasks with communication context for intelligent prioritization.

**Planned Request:**
```json
{
  "workItems": [...],
  "communicationContext": {
    "teamsMessages": [...],
    "outlookEmails": [...]
  },
  "userPreferences": {
    "focusTime": "09:00-11:00",
    "workStyle": "deep-work-blocks"
  }
}
```

**Planned Response:**
```json
{
  "success": true,
  "data": {
    "prioritizedTasks": [
      {
        "workItemId": 12345,
        "aiPriorityScore": 0.95,
        "newRanking": 1,
        "originalRanking": 5,
        "priorityReason": "Critical bug with client escalation in Teams + urgent email from PM + deadline in 3 days",
        "priorityFactors": {
          "adoPriority": 0.2,
          "deadlineUrgency": 0.3, 
          "communicationUrgency": 0.4,
          "businessImpact": 0.1
        },
        "recommendedAction": "Start immediately - blocking issue for release",
        "executionGuidance": [
          "Set up local reproduction environment for authentication flow",
          "Review SSO integration logs from past 7 days",
          "Identify root cause in authentication service",
          "Implement fix with automated test coverage", 
          "Deploy to staging environment for validation",
          "Coordinate with QA team for regression testing"
        ],
        "estimatedTime": "6-8 hours",
        "blockers": [],
        "dependencies": []
      }
    ]
  }
}
```

#### GET /api/v1/ai/guidance/:workItemId
Get AI-generated execution guidance for specific task.

#### POST /api/v1/ai/feedback
Submit user feedback on AI recommendations for learning.

---

## Authentication & Security

### Current (Phase 1)
- **Personal Access Token (PAT)**: Via environment variable
- **Scope**: Work Items (read)
- **Organization**: Configurable via environment

### Future (Phase 2)
- **Microsoft OAuth2**: Full Graph API integration
- **Scopes**: ADO, Teams.ReadBasic.All, Mail.Read
- **Token Management**: Secure refresh handling

---

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "ADO_CONNECTION_FAILED",
    "message": "Unable to connect to Azure DevOps API",
    "details": "Personal Access Token may be invalid or expired",
    "timestamp": "2025-09-15T16:07:15.123Z",
    "requestId": "req-uuid-12345"
  }
}
```

### Common Error Codes
- `ADO_AUTH_ERROR`: ADO authentication failure
- `ADO_PROJECT_NOT_FOUND`: Project access denied or not found
- `ADO_WORKITEM_NOT_FOUND`: Work item doesn't exist or no access
- `VALIDATION_ERROR`: Request parameter validation failed
- `RATE_LIMIT_EXCEEDED`: ADO API rate limits exceeded
- `INTERNAL_ERROR`: Server-side processing error

---

## Testing

Run the comprehensive test suite:
```bash
cd backend
npm test
```

**Test Coverage:**
- ✅ Health check endpoint functionality
- ✅ ADO connection and authentication validation
- ✅ Project discovery with real ADO organization
- ✅ Work item retrieval with various filter combinations
- ✅ Error handling and edge cases
- ✅ Rate limiting and timeout scenarios

---

## Rate Limiting

**ADO API Constraints:**
- 200 requests per hour per PAT
- Backoff strategy implemented for rate limit errors
- Headers include rate limit status

**Planned Graph API:**
- Teams: 600 requests per 20 minutes
- Outlook: 10,000 requests per 10 minutes per application

---

**This API foundation enables the hackathon vision: from scattered task chaos to intelligent, automated workflow decisions.**