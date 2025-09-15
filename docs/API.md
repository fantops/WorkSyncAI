# WorkSync AI - Hackathon API Documentation

## Overview

The WorkSync AI hackathon demo provides essential REST API endpoints for Microsoft OAuth authentication, Azure DevOps integration, and AI-powered task prioritization. Built for 20-hour implementation focused on core demo functionality.

## Base URL

```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require Microsoft OAuth authentication. The system uses OAuth 2.0 tokens from Microsoft Azure AD.

### Authentication Flow

#### GET /auth/microsoft
Initiate Microsoft OAuth 2.0 authentication flow.

**Response:**
Redirects to Microsoft OAuth consent screen.

#### POST /auth/callback
Handle OAuth callback from Microsoft.

**Request Body:**
```json
{
  "code": "oauth-authorization-code",
  "state": "anti-csrf-state-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "microsoft-user-id",
      "displayName": "John Doe",
      "email": "john.doe@company.com",
      "tenantId": "azure-tenant-id"
    },
    "accessToken": "encrypted-oauth-token",
    "sessionToken": "jwt-session-token"
  }
}
```

#### GET /auth/me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <session-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "microsoft-user-id",
      "displayName": "John Doe",
      "email": "john.doe@company.com",
      "adoOrgUrl": "https://dev.azure.com/company",
      "preferences": {
        "timezone": "UTC-8",
        "notifications": true
      }
    }
  }
}
```

#### POST /auth/logout
Logout user and invalidate session.

## Azure DevOps Integration

#### GET /ado/projects
List user's Azure DevOps projects.

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project-guid",
        "name": "Company Product",
        "description": "Main product development",
        "visibility": "private",
        "lastUpdated": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

#### GET /ado/workitems
Fetch work items from Azure DevOps.

**Query Parameters:**
- `projectId`: ADO project ID (required)
- `assignedToMe`: Filter to current user's tasks (default: true)
- `states`: Comma-separated list of states (default: "New,Active,Resolved")
- `workItemTypes`: Comma-separated types (default: "Task,Bug,User Story")
- `limit`: Number of items to return (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "workItems": [
      {
        "id": 12345,
        "title": "Fix login authentication bug",
        "description": "Users unable to login with SSO",
        "state": "Active",
        "priority": 1,
        "workItemType": "Bug",
        "assignedTo": {
          "displayName": "John Doe",
          "email": "john.doe@company.com"
        },
        "createdDate": "2024-01-10T09:00:00Z",
        "dueDate": "2024-01-18T17:00:00Z",
        "tags": ["authentication", "security", "urgent"],
        "url": "https://dev.azure.com/company/_workitems/edit/12345",
        "aiPriorityScore": null,
        "priorityReason": null
      }
    ],
    "totalCount": 25
  }
}
```

#### GET /ado/workitems/:id
Get specific work item details.

**Response:**
```json
{
  "success": true,
  "data": {
    "workItem": {
      "id": 12345,
      "title": "Fix login authentication bug",
      "description": "Users unable to login with SSO",
      "state": "Active",
      "priority": 1,
      "workItemType": "Bug",
      "assignedTo": {
        "displayName": "John Doe",
        "email": "john.doe@company.com"
      },
      "createdDate": "2024-01-10T09:00:00Z",
      "dueDate": "2024-01-18T17:00:00Z",
      "acceptanceCriteria": "Users can login successfully with SSO",
      "reproductionSteps": "1. Navigate to login page...",
      "tags": ["authentication", "security", "urgent"],
      "comments": [
        {
          "author": "jane.smith@company.com",
          "text": "This is blocking the release, urgent fix needed",
          "createdDate": "2024-01-12T14:30:00Z"
        }
      ],
      "url": "https://dev.azure.com/company/_workitems/edit/12345"
    }
  }
}
```

## AI Priority Engine

#### POST /priority/analyze
Analyze tasks and calculate AI priority scores.

**Request Body:**
```json
{
  "workItems": [
    {
      "id": 12345,
      "title": "Fix login authentication bug",
      "priority": 1,
      "dueDate": "2024-01-18T17:00:00Z",
      "workItemType": "Bug",
      "tags": ["authentication", "security", "urgent"]
    }
  ],
  "communicationContext": {
    "teamsMessages": [
      {
        "text": "Login bug is urgent - blocking client demo",
        "mentions": ["12345"],
        "timestamp": "2024-01-15T11:00:00Z"
      }
    ],
    "emails": [
      {
        "subject": "Critical: Authentication issue",
        "body": "Work item 12345 needs immediate attention",
        "timestamp": "2024-01-15T09:30:00Z"
      }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prioritizedTasks": [
      {
        "workItemId": 12345,
        "aiPriorityScore": 0.95,
        "priorityReason": "Critical bug with approaching deadline, mentioned 3x in urgent communications",
        "priorityFactors": {
          "adoPriority": 0.4,
          "deadlineUrgency": 0.3,
          "communicationMentions": 0.25,
          "workItemType": 0.0
        },
        "recommendedAction": "Start immediately - blocking issue",
        "executionGuidance": [
          "Set up local reproduction environment",
          "Analyze authentication flow logs",
          "Identify root cause in SSO integration",
          "Implement and test fix",
          "Deploy to staging for validation"
        ]
      }
    ]
  }
}
```

#### GET /priority/recommendations
Get general priority recommendations for current user.

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "type": "urgent_tasks",
        "title": "3 critical tasks need immediate attention",
        "taskIds": [12345, 12346, 12347],
        "reason": "These tasks have urgent communications and approaching deadlines"
      },
      {
        "type": "quick_wins",
        "title": "Complete 2 simple tasks for productivity boost",
        "taskIds": [12350, 12351],
        "reason": "Low complexity tasks that can be finished quickly"
      },
      {
        "type": "blocked_items",
        "title": "1 task needs dependency resolution",
        "taskIds": [12348],
        "reason": "Task blocked by external dependency, requires follow-up"
      }
    ]
  }
}
```

## User Feedback System

#### POST /feedback
Submit user feedback on AI recommendations.

**Request Body:**
```json
{
  "workItemId": 12345,
  "sessionId": "demo-session-uuid",
  "rating": 5,
  "followedRecommendation": true,
  "feedback": "Excellent prioritization - helped me focus on urgent bug",
  "actualOutcome": "Completed task ahead of deadline"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "feedbackId": "feedback-uuid",
    "recorded": true,
    "learningImpact": "Positive feedback helps improve future recommendations"
  }
}
```

#### GET /feedback/summary
Get feedback summary for learning insights.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalFeedback": 47,
      "averageRating": 4.3,
      "recommendationAccuracy": 0.89,
      "userSatisfaction": 0.91
    },
    "insights": [
      "Users prefer detailed execution guidance",
      "Communication context significantly improves accuracy",
      "Deadline proximity is most important priority factor"
    ]
  }
}
```

## Demo Support Endpoints

#### GET /demo/sample-data
Get sample communication data for demonstration.

**Response:**
```json
{
  "success": true,
  "data": {
    "teamsMessages": [
      {
        "text": "Bug 12345 is critical - customer escalation received",
        "author": "manager@company.com",
        "timestamp": "2024-01-15T08:00:00Z",
        "urgencyKeywords": ["critical", "escalation"],
        "mentions": ["12345"]
      }
    ],
    "emails": [
      {
        "subject": "URGENT: Release blocker in work item 12346", 
        "snippet": "This issue is preventing our sprint delivery...",
        "sender": "product.owner@company.com",
        "timestamp": "2024-01-15T10:30:00Z",
        "urgencyKeywords": ["urgent", "blocker"],
        "mentions": ["12346"]
      }
    ]
  }
}
```

#### POST /demo/reset
Reset demo state for fresh presentation.

**Request Body:**
```json
{
  "sessionId": "demo-session-uuid",
  "preserveAuth": true
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "MICROSOFT_AUTH_ERROR",
    "message": "Microsoft OAuth token has expired",
    "details": {
      "action": "Please login again with Microsoft account",
      "redirectUrl": "/api/auth/microsoft"
    }
  }
}
```

### Common Error Codes

- `MICROSOFT_AUTH_ERROR`: OAuth authentication issues
- `ADO_API_ERROR`: Azure DevOps API integration error
- `VALIDATION_ERROR`: Request parameter validation failed
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: API rate limits exceeded
- `DEMO_DATA_ERROR`: Demo simulation data issues

## Rate Limiting

API requests are rate-limited for demo stability:

- **Authentication endpoints**: 10 requests per minute
- **ADO integration**: 30 requests per minute  
- **AI priority analysis**: 20 requests per minute
- **User feedback**: 100 requests per minute

Rate limit headers:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1640995260
```

## Demo Environment Configuration

Essential environment variables for hackathon demo:

```bash
# Microsoft OAuth Configuration
MICROSOFT_CLIENT_ID=your-azure-app-registration-id
MICROSOFT_CLIENT_SECRET=your-azure-app-secret
MICROSOFT_REDIRECT_URI=http://localhost:3001/api/auth/callback
MICROSOFT_AUTHORITY=https://login.microsoftonline.com/common

# Azure DevOps Configuration  
ADO_ORGANIZATION=your-company-ado-org
ADO_API_VERSION=6.0

# Demo Configuration
DEMO_MODE=true
DEMO_SESSION_TIMEOUT=3600
SAMPLE_DATA_ENABLED=true

# Application Configuration
JWT_SECRET=your-demo-jwt-secret
DATABASE_PATH=./demo.sqlite
PORT=3001
```

## Hackathon Demo Script Integration

This API supports the 5-minute demo flow:

1. **Minute 1: Problem Setup**
   - `GET /ado/workitems` - Show tasks with equal ADO priority
   - `GET /demo/sample-data` - Display urgent communication context

2. **Minutes 2-4: WorkSync Solution**  
   - `GET /auth/microsoft` - Microsoft OAuth login
   - `GET /ado/workitems` - Load user's real ADO tasks
   - `POST /priority/analyze` - AI re-prioritization with reasoning
   - `GET /ado/workitems/:id` - Task details with execution guidance

3. **Minute 5: Learning Foundation**
   - `POST /feedback` - User rating demonstration
   - `GET /feedback/summary` - Learning metrics display

---

**Built for Hackathon Success** - Essential API endpoints to demonstrate enterprise integration concept with Microsoft ecosystem in 20-hour development sprint.