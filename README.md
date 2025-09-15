# WorkSync AI

**An AI-powered background agent that automatically prioritizes your work based on real context from Azure DevOps, Teams chats, and email communications.**

> 🎯 **Vision**: Transform scattered enterprise task chaos into intelligent, automated workflow decisions that save hours daily.

## The Problem

Your Azure DevOps tasks all look equal priority, but the real urgency is scattered across Teams chats, emails, and calendar discussions. **Bug #1234** looks normal in ADO, but there are 3 escalations in Teams, 2 urgent emails, and a client call scheduled. You should work on it first, but how would you know?

## Our Solution

WorkSync AI runs as a background agent that:
1. **🧠 Analyzes** all your communication channels for task-related context
2. **📋 Prioritizes** your ADO backlog based on real urgency signals  
3. **🎯 Provides** step-by-step execution guidance for each task
4. **📊 Learns** from your choices to improve recommendations

## Current Status

- **✅ Phase 1 Complete**: Secure ADO integration foundation ready
- **🚧 Phase 2 In Progress**: AI Priority Engine + Microsoft Graph integration
- **🎯 Phase 3 Planned**: Advanced learning and team intelligence

## Quick Start

```bash
git clone https://github.com/fantops/WorkSyncAI.git
cd WorkSyncAI/backend
npm install
cp .env.example .env
# Add your ADO_PERSONAL_ACCESS_TOKEN
npm start
npm test
```

## Why This Matters

**Every enterprise has this exact problem**: Scattered task context across communication channels with no intelligent coordination. WorkSync AI is the missing intelligence layer that makes Microsoft's entire productivity ecosystem actually productive.

**From**: Hours of manual prioritization daily  
**To**: Seconds of AI-powered workflow decisions

## Documentation

- **[Setup Guide](./docs/SETUP.md)** - Detailed installation and configuration
- **[API Documentation](./docs/API.md)** - Complete API reference and examples  
- **[Technical Architecture](./docs/HLD.md)** - High-level design and implementation phases
- **[Team Overview](./TEAM_OVERVIEW.md)** - Hackathon implementation plan

## Demo

🎪 **5-Minute Hackathon Demo Flow**:
1. **Problem**: Show ADO tasks with hidden urgency in communications
2. **Solution**: AI automatically re-prioritizes with clear reasoning  
3. **Vision**: Learning system that scales to team intelligence

## Links

- **GitHub**: [github.com/fantops/WorkSyncAI](https://github.com/fantops/WorkSyncAI)
- **Live Demo**: *Coming soon*

---

*Building the missing intelligence layer for Microsoft's productivity stack* 🎯