const API_BASE = '/api/v1'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const msg = data?.detail || 'حدث خطأ غير متوقع'
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }

  return data
}

export const api = {
  auth: {
    login: (username, password) => {
      const body = new URLSearchParams({ username, password })
      return fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      }).then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'فشل تسجيل الدخول')
        return data
      })
    },
    register: (data) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },

  users: {
    me: () => request('/users/me'),
    updateMe: (data) => request('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
  },

  lostReports: {
    list: (skip = 0, limit = 100) => request(`/lost-reports/?skip=${skip}&limit=${limit}`),
    get: (id) => request(`/lost-reports/${id}`),
    create: (data) => request('/lost-reports/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/lost-reports/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    markFound: (id) => request(`/lost-reports/${id}/found`, { method: 'POST' }),
    close: (id) => request(`/lost-reports/${id}/close`, { method: 'POST' }),
  },

  foundAnnouncements: {
    list: (skip = 0, limit = 100) => request(`/found-announcements/?skip=${skip}&limit=${limit}`),
    get: (id) => request(`/found-announcements/${id}`),
    create: (data) => request('/found-announcements/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/found-announcements/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deliver: (id) => request(`/found-announcements/${id}/deliver`, { method: 'POST' }),
    close: (id) => request(`/found-announcements/${id}/close`, { method: 'POST' }),
  },

  history: {
    list: (skip = 0, limit = 100, contentType = '') => {
      let url = `/history/?skip=${skip}&limit=${limit}`
      if (contentType) url += `&content_type=${contentType}`
      return request(url)
    },
  },

  admin: {
    dashboard: () => request('/admin/dashboard'),
    lostReports: (skip = 0, limit = 100) => request(`/admin/lost-reports?skip=${skip}&limit=${limit}`),
    foundAnnouncements: (skip = 0, limit = 100) => request(`/admin/found-announcements?skip=${skip}&limit=${limit}`),
    deleteLost: (id) => request(`/admin/lost-reports/${id}`, { method: 'DELETE' }),
    deleteFound: (id) => request(`/admin/found-announcements/${id}`, { method: 'DELETE' }),
  },
}
