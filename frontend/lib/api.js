const API_URL = process.env.NEXT_PUBLIC_API_URL

function logout() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('taskflow_token')
  window.location.href = '/login'
}

async function request(method, path, body) {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('taskflow_token')
      : null

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    logout()
    return
  }

  return res.json()
}

export const api = {
  auth: {
    register: (data) => request('POST', '/auth/register', data),
    login: (data) => request('POST', '/auth/login', data),
    me: () => request('GET', '/auth/me'),
    update: (data) => request('PUT', '/auth/me', data),
    logout: () => request('POST', '/auth/logout'),
  },
  boards: {
    list: () => request('GET', '/boards'),
    create: (data) => request('POST', '/boards', data),
    getById: (id) => request('GET', `/boards/${id}`),
    update: (id, data) => request('PUT', `/boards/${id}`, data),
    delete: (id) => request('DELETE', `/boards/${id}`),
    addMember: (id, data) => request('POST', `/boards/${id}/members`, data),
    removeMember: (id, userId) =>
      request('DELETE', `/boards/${id}/members/${userId}`),
  },
  columns: {
    create: (boardId, data) =>
      request('POST', `/boards/${boardId}/columns`, data),
    update: (boardId, colId, data) =>
      request('PUT', `/boards/${boardId}/columns/${colId}`, data),
    delete: (boardId, colId) =>
      request('DELETE', `/boards/${boardId}/columns/${colId}`),
    reorder: (boardId, data) =>
      request('PUT', `/boards/${boardId}/columns/reorder`, data),
  },
  cards: {
    create: (boardId, data) =>
      request('POST', `/boards/${boardId}/cards`, data),
    getById: (boardId, cardId) =>
      request('GET', `/boards/${boardId}/cards/${cardId}`),
    update: (boardId, cardId, data) =>
      request('PUT', `/boards/${boardId}/cards/${cardId}`, data),
    delete: (boardId, cardId) =>
      request('DELETE', `/boards/${boardId}/cards/${cardId}`),
    move: (boardId, data) =>
      request('PUT', `/boards/${boardId}/cards/move`, data),
  },
  search: {
    cards: (q, boardId) =>
      request('GET', `/search?q=${encodeURIComponent(q)}&boardId=${boardId}`),
  },
  users: {
    findByEmail: (email) =>
      request('GET', `/users/find?email=${encodeURIComponent(email)}`),
  },
  upload: {
    file: async (file) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('taskflow_token') : null
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      return res.json()
    },
  },
}
