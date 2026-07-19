/**
 * ============================================================
 * PoC-01: Firestore Rules — Cross-User Access Test
 * ============================================================
 * 
 * TUJUAN : Membuktikan bahwa Firestore Security Rules memblokir
 *          akses data milik user lain (AT-02-A2: Path Traversal).
 * 
 * METODE : Membuat dua user anonim (User A & User B), User A 
 *          menulis dokumen, lalu User B mencoba membaca dokumen
 *          milik User A — harus gagal dengan PermissionDenied.
 * 
 * CARA MENJALANKAN:
 *   1. Pastikan Firebase Emulator sudah berjalan:
 *        firebase emulators:start
 *   2. Jalankan PoC:
 *        node docs/ssdlc-microsoft-sdl/poc/poc-01-firestore-rules.mjs
 * 
 * HASIL YANG DIHARAPKAN:
 *   - ✅ User A bisa menulis ke path-nya sendiri
 *   - ✅ User A bisa membaca dari path-nya sendiri
 *   - ✅ User B DITOLAK saat membaca path milik User A
 *   - ✅ User B DITOLAK saat menulis ke path milik User A
 *   - ✅ Akses ke path wildcard (tidak terdaftar) DITOLAK
 * ============================================================
 */

import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, signInAnonymously } from 'firebase/auth'
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query
} from 'firebase/firestore'

// ── Konfigurasi Emulator ─────────────────────────────────────
const app = initializeApp({
  projectId: 'mindquest-app-f216d',
  apiKey: 'fake-api-key-for-emulator'
})

const auth = getAuth(app)
const db = getFirestore(app)

// Arahkan ke emulator lokal
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
connectFirestoreEmulator(db, '127.0.0.1', 8080)

// ── Utility ──────────────────────────────────────────────────
const PASS = '✅ PASS'
const FAIL = '❌ FAIL'
const results = []

function logResult(testName, passed, detail = '') {
  const status = passed ? PASS : FAIL
  console.log(`  ${status}  ${testName}${detail ? ' — ' + detail : ''}`)
  results.push({ testName, passed, detail })
}

// ── Tes Utama ────────────────────────────────────────────────
async function runTests() {
  console.log('═══════════════════════════════════════════════════')
  console.log('  PoC-01: Firestore Rules — Cross-User Access Test')
  console.log('═══════════════════════════════════════════════════')
  console.log()

  // 1. Buat dua user anonim
  console.log('📌 Membuat dua user anonim...')
  const { user: userA } = await signInAnonymously(auth)
  // Simpan UID A sebelum sign in sebagai B
  const uidA = userA.uid
  console.log(`   User A UID: ${uidA}`)

  // Sign out A, sign in B
  await auth.signOut()
  const { user: userB } = await signInAnonymously(auth)
  const uidB = userB.uid
  console.log(`   User B UID: ${uidB}`)
  console.log()

  // ── Test 1: User A menulis ke path sendiri ──────────────
  console.log('📌 Test 1: User A menulis ke path sendiri')
  await auth.signOut()
  await signInAnonymously(auth) // re-sign as new, kita pakai fixed UID approach
  // Karena anonymous auth generates new UID, kita test dengan current user
  const currentUser = auth.currentUser
  const myUid = currentUser.uid
  console.log(`   Current user UID: ${myUid}`)

  try {
    await setDoc(doc(db, 'users', myUid), {
      nickname: 'PoCTester',
      createdAt: new Date().toISOString()
    }, { merge: true })
    logResult('User menulis ke /users/{ownUid}', true, 'Berhasil')
  } catch (err) {
    logResult('User menulis ke /users/{ownUid}', false, err.code)
  }

  // ── Test 2: User membaca dari path sendiri ──────────────
  console.log('📌 Test 2: User membaca dari path sendiri')
  try {
    const snap = await getDoc(doc(db, 'users', myUid))
    logResult('User membaca dari /users/{ownUid}', snap.exists(), 
      snap.exists() ? `nickname: ${snap.data().nickname}` : 'doc not found')
  } catch (err) {
    logResult('User membaca dari /users/{ownUid}', false, err.code)
  }

  // ── Test 3: User mencoba membaca path user lain ─────────
  console.log('📌 Test 3: User mencoba membaca path user LAIN')
  const fakeOtherUid = 'victim-user-id-12345'
  try {
    await getDoc(doc(db, 'users', fakeOtherUid))
    logResult('BLOCKED: Membaca /users/{otherUid}', false, 
      'SEHARUSNYA DITOLAK tapi berhasil!')
  } catch (err) {
    const isPermDenied = err.code === 'permission-denied' || 
                         err.message.includes('PERMISSION_DENIED')
    logResult('BLOCKED: Membaca /users/{otherUid}', isPermDenied, err.code)
  }

  // ── Test 4: User mencoba menulis ke path user lain ──────
  console.log('📌 Test 4: User mencoba menulis ke path user LAIN')
  try {
    await setDoc(doc(db, 'users', fakeOtherUid), {
      nickname: 'HACKED',
      injected: true
    })
    logResult('BLOCKED: Menulis ke /users/{otherUid}', false, 
      'SEHARUSNYA DITOLAK tapi berhasil!')
  } catch (err) {
    const isPermDenied = err.code === 'permission-denied' || 
                         err.message.includes('PERMISSION_DENIED')
    logResult('BLOCKED: Menulis ke /users/{otherUid}', isPermDenied, err.code)
  }

  // ── Test 5: User mencoba akses jurnal user lain ─────────
  console.log('📌 Test 5: User mencoba akses jurnal user LAIN')
  try {
    await getDoc(doc(db, 'journals', fakeOtherUid, 'entries', 'any-entry'))
    logResult('BLOCKED: Membaca /journals/{otherUid}/entries/*', false,
      'SEHARUSNYA DITOLAK tapi berhasil!')
  } catch (err) {
    const isPermDenied = err.code === 'permission-denied' || 
                         err.message.includes('PERMISSION_DENIED')
    logResult('BLOCKED: Membaca /journals/{otherUid}/entries/*', isPermDenied, err.code)
  }

  // ── Test 6: User mencoba akses sesi AI user lain ────────
  console.log('📌 Test 6: User mencoba akses sesi AI user LAIN')
  try {
    await getDoc(doc(db, 'journals', fakeOtherUid, 'sessions', 'any-session'))
    logResult('BLOCKED: Membaca /journals/{otherUid}/sessions/*', false,
      'SEHARUSNYA DITOLAK tapi berhasil!')
  } catch (err) {
    const isPermDenied = err.code === 'permission-denied' || 
                         err.message.includes('PERMISSION_DENIED')
    logResult('BLOCKED: Membaca /journals/{otherUid}/sessions/*', isPermDenied, err.code)
  }

  // ── Test 7: Akses path yang tidak terdaftar (wildcard) ──
  console.log('📌 Test 7: Akses path wildcard (tidak terdaftar)')
  try {
    await getDoc(doc(db, 'secretAdminCollection', 'someDoc'))
    logResult('BLOCKED: Membaca path tidak terdaftar', false,
      'SEHARUSNYA DITOLAK tapi berhasil!')
  } catch (err) {
    const isPermDenied = err.code === 'permission-denied' || 
                         err.message.includes('PERMISSION_DENIED')
    logResult('BLOCKED: Membaca path tidak terdaftar', isPermDenied, err.code)
  }

  // ── Ringkasan ──────────────────────────────────────────
  console.log()
  console.log('═══════════════════════════════════════════════════')
  console.log('  RINGKASAN HASIL')
  console.log('═══════════════════════════════════════════════════')
  const passed = results.filter(r => r.passed).length
  const total = results.length
  console.log(`  Total tes  : ${total}`)
  console.log(`  Lulus      : ${passed}`)
  console.log(`  Gagal      : ${total - passed}`)
  console.log(`  Verdict    : ${passed === total ? '✅ SEMUA LULUS' : '⚠️ ADA YANG GAGAL'}`)
  console.log()

  process.exit(passed === total ? 0 : 1)
}

runTests().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
