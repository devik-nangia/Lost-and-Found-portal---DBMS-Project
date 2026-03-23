const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Users
  getUsers:      ()          => request('/users'),
  getUser:       (id)        => request(`/users/${id}`),
  createUser:    (body)      => request('/users', { method: 'POST', body: JSON.stringify(body) }),

  // Lost Items
  getLostItems:  (params='') => request(`/lost-items${params}`),
  getLostItem:   (id)        => request(`/lost-items/${id}`),
  createLostItem:(body)      => request('/lost-items', { method: 'POST', body: JSON.stringify(body) }),
  patchLostItem: (id, body)  => request(`/lost-items/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Found Items
  getFoundItems: (params='') => request(`/found-items${params}`),
  getFoundItem:  (id)        => request(`/found-items/${id}`),
  createFoundItem:(body)     => request('/found-items', { method: 'POST', body: JSON.stringify(body) }),
  patchFoundItem:(id, body)  => request(`/found-items/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Claims
  getClaims:     (params='') => request(`/claims${params}`),
  createClaim:   (body)      => request('/claims', { method: 'POST', body: JSON.stringify(body) }),
  patchClaimStatus: (id, body) => request(`/claims/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Matches
  getMatches:    ()          => request('/matches'),
  createMatch:   (body)      => request('/matches', { method: 'POST', body: JSON.stringify(body) }),

  // Admin
  getAdmins:     ()          => request('/admin'),
  createAdmin:   (body)      => request('/admin', { method: 'POST', body: JSON.stringify(body) }),
};
