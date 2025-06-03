const TOKEN_KEY = '@angu-market:token'

export const tokenStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },

  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch (error) {
      console.error('Error saving token:', error)
    }
  },

  removeToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch (error) {
      console.error('Error removing token:', error)
    }
  },

  hasToken(): boolean {
    return !!this.getToken()
  },
}
