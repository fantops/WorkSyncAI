const axios = require('axios');
const logger = require('../utils/logger');

class ADOService {
  constructor() {
    this.baseURL = null;
    this.organization = null;
    this.accessToken = null;
  }

  /**
   * Initialize ADO service with user's organization and access token
   * @param {string} organization - ADO organization name
   * @param {string} accessToken - User's access token with ADO permissions
   */
  initialize(organization, accessToken) {
    this.organization = organization;
    this.accessToken = accessToken;
    this.baseURL = this.constructBaseURL(organization);
    logger.info(`ADO Service initialized for organization: ${organization}`);
  }

  /**
   * Initialize ADO service with Personal Access Token
   * @param {string} organization - ADO organization name
   * @param {string} pat - Personal Access Token
   */
  initializeWithPAT(organization, pat) {
    this.organization = organization;
    this.pat = pat;
    this.baseURL = this.constructBaseURL(organization);
    logger.info(`ADO Service initialized with PAT for organization: ${organization}`);
  }

  /**
   * Construct base URL based on organization format
   * @param {string} organization - Organization name or domain
   * @returns {string} Base URL for ADO API
   */
  constructBaseURL(organization) {
    // If organization contains a dot, assume it's a full domain (like microsoft.visualstudio.com)
    if (organization.includes('.')) {
      return `https://${organization}`;
    } else {
      // Otherwise, assume it's a dev.azure.com organization
      return `https://dev.azure.com/${organization}`;
    }
  }

  /**
   * Check if the service is properly authenticated
   */
  isAuthenticated() {
    return !!(this.accessToken || this.pat);
  }

  /**
   * Create axios instance with proper headers
   */
  createAxiosInstance() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json;api-version=7.0'
    };

    // Use PAT or Bearer token based on what's available
    if (this.pat) {
      // PAT uses Basic Auth with empty username
      const auth = Buffer.from(`:${this.pat}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    } else if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // Increased to 30 seconds for large projects
      headers
    });
  }

  /**
   * Get user's accessible projects
   * @returns {Promise<Array>} List of projects
   */
  async getProjects() {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('ADO service not initialized with authentication');
      }

      const api = this.createAxiosInstance();
      const response = await api.get('/_apis/projects');
      
      const projects = response.data.value.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        url: project.url,
        state: project.state,
        visibility: project.visibility
      }));

      logger.info(`Retrieved ${projects.length} projects from ADO`);
      return projects;
    } catch (error) {
      logger.error('Error fetching ADO projects:', error.message);
      throw new Error(`Failed to fetch ADO projects: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get backlog items from a specific project
   * @param {string} projectId - Project ID or name
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of backlog items
   */
  async getBacklogItems(projectId, options = {}) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('ADO service not initialized with authentication');
      }

      const api = this.createAxiosInstance();
      
      // First, get project name from project ID if needed
      let projectName = projectId;
      
      // If projectId looks like a GUID, we need to get the project name
      if (projectId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const projects = await this.getProjects();
        const project = projects.find(p => p.id === projectId);
        if (!project) {
          throw new Error(`Project with ID ${projectId} not found`);
        }
        projectName = project.name;
      }
      
      // Build WIQL query specifically for backlog items
      const wiqlQuery = this.buildBacklogWIQLQuery(projectName, options);
      const queryResponse = await api.post(`/_apis/wit/wiql`, {
        query: wiqlQuery
      });

      const workItemIds = queryResponse.data.workItems?.map(wi => wi.id) || [];
      
      if (workItemIds.length === 0) {
        return [];
      }

      // Get detailed work item information
      const workItemsResponse = await api.get(`/_apis/wit/workitems`, {
        params: {
          ids: workItemIds.slice(0, 15).join(','), // Get more backlog items
          '$expand': 'Relations'
        }
      });

      return workItemsResponse.data.value?.map(wi => this.transformWorkItem(wi)) || [];

    } catch (error) {
      logger.error('Error fetching ADO backlog items:', error.message);
      throw new Error(`Failed to fetch backlog items: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Build WIQL query specifically for backlog items
   * @param {string} projectName - Project name (not ID)
   * @param {Object} options - Query options
   * @returns {string} WIQL query
   */
  buildBacklogWIQLQuery(projectName, options = {}) {
    const {
      assignedToMe = true, // Changed to focus on me only
      states = ['Started', 'Committed', 'Proposed', 'Active'], // Updated with actual backlog states
      backlogTypes = ['Scenario', 'Deliverable', 'Task', 'Bug', 'Task Group'], // Updated with actual backlog types
      team = 'WSSI_IDC'
    } = options;

    // Query focused on backlog item types from your organization
    let query = `SELECT [System.Id], [System.Title], [System.State], [System.AssignedTo], [System.WorkItemType], [Microsoft.VSTS.Common.Priority], [Microsoft.VSTS.Scheduling.StoryPoints]
                 FROM WorkItems 
                 WHERE [System.TeamProject] = '${projectName}'`;
    
    // Filter by backlog work item types (Scenario, Deliverable, Task, Bug, Task Group)
    if (backlogTypes.length > 0) {
      const typesFilter = backlogTypes.map(type => `'${type}'`).join(', ');
      query += ` AND [System.WorkItemType] IN (${typesFilter})`;
    }
    
    // Filter by states appropriate for backlog (using correct states)
    if (states.length > 0) {
      const statesFilter = states.map(state => `'${state}'`).join(', ');
      query += ` AND [System.State] IN (${statesFilter})`;
    }
    
    // Filter only by items assigned to me
    if (assignedToMe) {
      query += ` AND [System.AssignedTo] = @Me`;
    }
    
    // Order by priority and story points for backlog view
    query += ` ORDER BY [Microsoft.VSTS.Common.Priority] ASC, [Microsoft.VSTS.Scheduling.StoryPoints] DESC, [System.ChangedDate] DESC`;

    return query;
  }

  /**
   * Build WIQL query for fetching work items
   * @param {string} projectName - Project name (not ID)
   * @param {Object} options - Query options
   * @returns {string} WIQL query
   */
  buildWIQLQuery(projectName, options = {}) {
    const {
      assignedToMe = true, // Default to assigned to user for faster query
      states = ['Active', 'New'], // Limit to active states only
      workItemTypes = ['Task', 'Bug', 'User Story'], // Common types only
      maxResults = 20 // Reduced for faster query
    } = options;

    // Simple targeted query for better performance
    let query = `SELECT [System.Id], [System.Title], [System.State], [System.AssignedTo] 
                 FROM WorkItems 
                 WHERE [System.TeamProject] = '${projectName}'`;

    // Always filter by assigned user for smaller result set
    if (assignedToMe) {
      query += ` AND [System.AssignedTo] = @Me`;
    }

    // Filter by states (reduced set)
    const statesFilter = states.map(state => `'${state}'`).join(', ');
    query += ` AND [System.State] IN (${statesFilter})`;

    // Filter by work item types (reduced set)
    const typesFilter = workItemTypes.map(type => `'${type}'`).join(', ');
    query += ` AND [System.WorkItemType] IN (${typesFilter})`;

    // Order by most recently changed and limit results
    query += ` ORDER BY [System.ChangedDate] DESC`;

    return query;
  }

  /**
   * Transform ADO work item to our internal format
   * @param {Object} workItem - Raw ADO work item
   * @returns {Object} Transformed work item
   */
  transformWorkItem(workItem) {
    const fields = workItem.fields;
    
    return {
      id: workItem.id || fields['System.Id'], // Try workItem.id first, then field
      title: fields['System.Title'],
      description: fields['System.Description'] || '',
      state: fields['System.State'],
      workItemType: fields['System.WorkItemType'],
      assignedTo: fields['System.AssignedTo']?.displayName || 'Unassigned',
      assignedToEmail: fields['System.AssignedTo']?.uniqueName || null,
      createdDate: fields['System.CreatedDate'],
      changedDate: fields['System.ChangedDate'],
      priority: fields['Microsoft.VSTS.Common.Priority'] || 2, // Default to Medium (2)
      severity: fields['Microsoft.VSTS.Common.Severity'] || null,
      storyPoints: fields['Microsoft.VSTS.Scheduling.StoryPoints'] || null, // Backlog field
      effort: fields['Microsoft.VSTS.Scheduling.Effort'] || null, // Backlog field
      businessValue: fields['Microsoft.VSTS.Common.BusinessValue'] || null, // Backlog field
      dueDate: fields['Microsoft.VSTS.Scheduling.DueDate'] || null,
      tags: fields['System.Tags'] || '',
      url: workItem._links?.html?.href || null,
      // Add calculated fields for our AI system
      aiPriorityScore: 0.5, // Will be calculated by priority service
      urgencyContext: [], // Will be populated by communication analysis
      lastUpdated: new Date(fields['System.ChangedDate']),
      isOverdue: false // Will be calculated based on due date
    };
  }

  /**
   * Get specific work item by ID
   * @param {number} workItemId - Work item ID
   * @returns {Promise<Object>} Work item details
   */
  async getWorkItem(workItemId) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('ADO service not initialized with authentication');
      }

      const api = this.createAxiosInstance();
      const response = await api.get(`/_apis/wit/workitems/${workItemId}`, {
        params: {
          '$expand': 'all'
        }
      });

      const workItem = this.transformWorkItem(response.data);
      logger.info(`Retrieved work item ${workItemId}: ${workItem.title}`);
      return workItem;
    } catch (error) {
      logger.error(`Error fetching work item ${workItemId}:`, error.message);
      throw new Error(`Failed to fetch work item: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Test connection to ADO
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('ADO service not initialized with authentication');
      }

      const api = this.createAxiosInstance();
      
      // Test with a simple projects call instead of profile (more reliable)
      const response = await api.get('/_apis/projects?$top=1');
      
      logger.info('ADO connection test successful');
      return {
        success: true,
        message: 'Successfully connected to Azure DevOps',
        userInfo: {
          organization: this.organization,
          projectCount: response.data.count || 0,
          baseURL: this.baseURL
        }
      };
    } catch (error) {
      logger.error('ADO connection test failed:', error.message);
      return {
        success: false,
        message: `Connection failed: ${error.response?.data?.message || error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Get user's recent activity
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} Recent activity items
   */
  async getRecentActivity(projectId) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('ADO service not initialized with authentication');
      }

      // For hackathon demo, we'll simulate recent activity
      // In a full implementation, this would query ADO's activity APIs
      logger.info(`Getting recent activity for project ${projectId}`);
      
      return [
        {
          id: 'activity1',
          type: 'work-item-update',
          description: 'Work item #1234 was updated',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          workItemId: 1234
        },
        {
          id: 'activity2', 
          type: 'work-item-assigned',
          description: 'Work item #5678 was assigned to you',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          workItemId: 5678
        }
      ];
    } catch (error) {
      logger.error('Error fetching recent activity:', error.message);
      throw new Error(`Failed to fetch recent activity: ${error.message}`);
    }
  }
}

// Export singleton instance
const adoService = new ADOService();
module.exports = adoService;
