// src/hooks/useEncryptionKey.js
// React hook yang menyiapkan data key enkripsi begitu UID tersedia.
// Data key disimpan di React state (memori) saja — TIDAK PERNAH ditulis ke
// localStorage/sessionStorage/disk, supaya kalau device dicuri dalam keadaan
// app tertutup, kuncinya tidak ikut bocor.

import { useEffect, useState } from 'react'
import { getOrCreateDataKey } from '@/utils/keyManager'

export function useEncryptionKey(uid, pin, consentData) {
  const [dataKey, setDataKey] = useState(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!uid || !pin) {
      setReady(false)
      setDataKey(null)
      setError(null)
      return
    }

    let cancelled = false
    setReady(false)
    setError(null)

    getOrCreateDataKey(uid, pin, consentData ?? null)
      .then((key) => {
        if (!cancelled) {
          setDataKey(key)
          setReady(true)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
          setReady(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [uid, pin])

  return { dataKey, ready, error }
}
