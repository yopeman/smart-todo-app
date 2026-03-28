const TOKEN_KEY = 'auth_token';

export const authService = {
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
  isLoggedIn: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};
