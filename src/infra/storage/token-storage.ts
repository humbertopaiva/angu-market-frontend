class TokenStorage {
  private readonly TOKEN_KEY = 'auth_token'

  setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token)
    } catch (error) {
      console.error('Error saving token:', error)
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY)
    } catch (error) {
      console.error('Error getting token:', error)
      return null
    }
  }

  removeToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY)
    } catch (error) {
      console.error('Error removing token:', error)
    }
  }

  hasToken(): boolean {
    return !!this.getToken()
  }
}

export const tokenStorage = new TokenStorage()
