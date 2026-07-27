const NETWORK_ERROR_PATTERN =
  /fetch failed|network request failed|failed to fetch|could not connect|econnrefused|enotfound|etimedout|socket|offline|network error|the internet connection appears to be offline/i

export const isNetworkError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false
  }

  if (error.name === 'AbortError') {
    return false
  }

  const message = error.message.trim()
  if (!message) {
    return error instanceof TypeError
  }

  return NETWORK_ERROR_PATTERN.test(message)
}
