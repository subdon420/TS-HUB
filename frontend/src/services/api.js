const API_BASE = '/api';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('th_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  return response.json();
};

export const api = {
  // Auth
  async login(email, password, portalRole) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, portalRole }),
    });
    return handleResponse(res);
  },

  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async switchRole(role) {
    const res = await fetch(`${API_BASE}/auth/switch-role`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    });
    return handleResponse(res);
  },

  async getWorkspaceUsers() {
    const res = await fetch(`${API_BASE}/auth/workspace/users`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Projects
  async getProjects() {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getProject(id) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createProject(data) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async archiveProject(id) {
    const res = await fetch(`${API_BASE}/projects/${id}/archive`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getProjectActivities(id, role) {
    const query = role ? `?role=${role}` : '';
    const res = await fetch(`${API_BASE}/projects/${id}/activities${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Bugs
  async getBugs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/bugs${query ? `?${query}` : ''}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getBug(id) {
    const res = await fetch(`${API_BASE}/bugs/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createBug(data) {
    const res = await fetch(`${API_BASE}/bugs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateBugStatus(id, data) {
    const res = await fetch(`${API_BASE}/bugs/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async claimBug(id) {
    const res = await fetch(`${API_BASE}/bugs/${id}/claim`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async addBugComment(id, data) {
    const res = await fetch(`${API_BASE}/bugs/${id}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async uploadBugAttachments(id, formData) {
    const res = await fetch(`${API_BASE}/bugs/${id}/attachments`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },

  // Test Suites & Cases
  async getSuites(projectId) {
    const query = projectId ? `?projectId=${projectId}` : '';
    const res = await fetch(`${API_BASE}/tests/suites${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createSuite(data) {
    const res = await fetch(`${API_BASE}/tests/suites`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async createTestCase(data) {
    const res = await fetch(`${API_BASE}/tests/cases`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Test Runs
  async getRuns(projectId) {
    const query = projectId ? `?projectId=${projectId}` : '';
    const res = await fetch(`${API_BASE}/tests/runs${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getRun(id) {
    const res = await fetch(`${API_BASE}/tests/runs/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getAllActivities(role) {
    const query = role ? `?role=${role}` : '';
    const res = await fetch(`${API_BASE}/projects/activities/feed${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async startRun(data) {
    const res = await fetch(`${API_BASE}/tests/runs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async recordCaseResult(runId, data) {
    const res = await fetch(`${API_BASE}/tests/runs/${runId}/record`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // AI Polish
  async polishReport(data) {
    const res = await fetch(`${API_BASE}/ai/polish-report`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Git Webhook Simulation
  async triggerGitWebhook(data) {
    const res = await fetch(`${API_BASE}/webhooks/git`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },
};

