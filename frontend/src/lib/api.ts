const STORAGE_KEY = 'badger-api-url'

export function getApiUrl(): string {
  return localStorage.getItem(STORAGE_KEY) || ''
}

export function hasApiUrl(): boolean {
  return !!localStorage.getItem(STORAGE_KEY)
}

export function setApiUrl(url: string): void {
  if (url) {
    localStorage.setItem(STORAGE_KEY, url.replace(/\/$/, ''))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function apiUrl(path: string): string {
  const base = getApiUrl()
  if (!base) {
    throw new Error('NO_API_URL')
  }
  return `${base}${path}`
}

export function apiHeaders(): Record<string, string> {
  return {}
}
