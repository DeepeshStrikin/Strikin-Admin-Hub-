const KEY = 'strikin_admin_token'
export const isLoggedIn = () => !!localStorage.getItem(KEY)
export const setToken = (t) => localStorage.setItem(KEY, t)
export const logout = () => localStorage.removeItem(KEY)
