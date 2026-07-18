const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("token");
}

async function handleResponse(res) {
  if (!res.ok) {
    let message = "Request failed";
    try {
      const data = await res.json();
      message = data.detail || message;
    } catch (e) {
      
    }
    throw new Error(message);
  }
  return res.json();
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // ---- Auth ----
  async login(email, password) {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    return handleResponse(res);
  },

  async register(payload) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getRoles() {
    const res = await fetch(`${BASE_URL}/roles`);
    return handleResponse(res);
  },

  // ---- Documents ----
  async getDocuments() {
    const res = await fetch(`${BASE_URL}/documents`, {
      headers: { ...authHeaders() },
    });
    return handleResponse(res);
  },

  async uploadDocument(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/documents`, {
      method: "POST",
      headers: { ...authHeaders() },
      body: formData,
    });
    return handleResponse(res);
  },

  async deleteDocument(id) {
    const res = await fetch(`${BASE_URL}/documents/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return handleResponse(res);
  },


  async search(query, topK = 5) {
    const params = new URLSearchParams({ query, top_k: topK });
    const res = await fetch(`${BASE_URL}/search?${params.toString()}`, {
      headers: { ...authHeaders() },
    });
    return handleResponse(res);
  },

  
  async getTasks(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.assigned_to) params.append("assigned_to", filters.assigned_to);

    const res = await fetch(`${BASE_URL}/tasks?${params.toString()}`, {
      headers: { ...authHeaders() },
    });
    return handleResponse(res);
  },

  async createTask(payload) {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateTaskStatus(id, status) {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  
  async getActivityLogs() {
    const res = await fetch(`${BASE_URL}/activity-logs`, {
      headers: { ...authHeaders() },
    });
    return handleResponse(res);
  },

  
  async getAnalytics() {
    const res = await fetch(`${BASE_URL}/analytics`, {
      headers: { ...authHeaders() },
    });
    return handleResponse(res);
  },
};
