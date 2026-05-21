const TOKEN_KEY = 'auth_token';
const ROLE_KEY = 'user_role';

/** Read auth token from sessionStorage (migrates legacy localStorage token once). */
export function getToken() {
  try {
    let token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      const legacy = localStorage.getItem('token');
      if (legacy) {
        sessionStorage.setItem(TOKEN_KEY, legacy);
        localStorage.removeItem('token');
        token = legacy;
      }
    }
    return token;
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem('token');
  } catch (err) {
    console.error('Failed to store auth token:', err);
  }
}

export function removeToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  } catch {
    // ignore storage errors (private browsing, etc.)
  }
}

export function getRole() {
  try {
    let role = sessionStorage.getItem(ROLE_KEY);
    if (!role) {
      const legacy = localStorage.getItem('role');
      if (legacy) {
        sessionStorage.setItem(ROLE_KEY, legacy);
        localStorage.removeItem('role');
        role = legacy;
      }
    }
    return role;
  } catch {
    return null;
  }
}

export function setRole(role) {
  try {
    sessionStorage.setItem(ROLE_KEY, role);
    localStorage.removeItem('role');
  } catch (err) {
    console.error('Failed to store user role:', err);
  }
}

export function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
