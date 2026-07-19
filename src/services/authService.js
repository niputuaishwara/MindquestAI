// src/services/authService.js
// Modul autentikasi MindQuest — Mendukung 3 Peran (User, Psychologist, Admin)

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import { generateNickname } from '@/utils/nicknameGenerator'

/**
 * Pendaftaran Pengguna Anonim (Pseudonymous)
 * Username akan ditambahkan domain palsu @mindquest.anon
 */
export async function registerPseudonymous(username, password) {
  const fakeEmail = `${username.toLowerCase()}@mindquest.anon`
  const { user } = await createUserWithEmailAndPassword(auth, fakeEmail, password)
  
  const nickname = generateNickname()
  await setDoc(doc(db, 'users', user.uid), {
    nickname,
    role: 'user',
    pseudonym: username,
    createdAt: serverTimestamp()
  }, { merge: true })

  return user
}

/**
 * Login Pengguna Anonim (Pseudonymous)
 */
export async function loginPseudonymous(username, password) {
  const fakeEmail = `${username.toLowerCase()}@mindquest.anon`
  const { user } = await signInWithEmailAndPassword(auth, fakeEmail, password)
  return user
}

/**
 * Login untuk Psikolog dan Admin (Menggunakan Email Asli)
 */
export async function loginWithEmail(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

/** Ambil profil (nickname, role, dll) dari Firestore. */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

/** Logout. */
export async function signOutUser() {
  return signOut(auth)
}
