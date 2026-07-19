// src/hooks/useAuth.js
// Hook status autentikasi. Berbeda dari versi anonim sebelumnya:
// - Tidak ada auto-login
// - Expose `isNewUser` untuk routing ke onboarding vs app utama
// - Expose `profile` (nickname) untuk ditampilkan di UI

import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { getUserProfile } from '@/services/authService'

export function useAuth() {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        // Ambil nickname dari Firestore setelah login/register
        const prof = await getUserProfile(currentUser.uid)
        setProfile(prof)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { user, profile, loading }
}
