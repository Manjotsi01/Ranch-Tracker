// client/src/hooks/useDebounce.ts
import { useState, useEffect } from 'react'

/**
 * Debounces a value by the given delay (ms).
 * Use instead of wiring raw search state directly to filters.
 *
 * @example
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebounce(search, 300)
 * // use debouncedSearch for API calls / filtering
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
