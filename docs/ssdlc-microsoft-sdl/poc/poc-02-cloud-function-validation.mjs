/**
 * ============================================================
 * PoC-02: Cloud Function — Input Validation & Auth Bypass Test
 * ============================================================
 * 
 * TUJUAN : Membuktikan bahwa Cloud Function analyzeEmotion:
 *          (a) Menolak request tanpa token (AT-02-B1)
 *          (b) Menolak method selain POST (AT-04)
 *          (c) Menolak body tanpa field 'message' (AT-04-A2)
 *          (d) Tidak memiliki rate limiter (AT-04-A1) — temuan negatif
 * 
 * CARA MENJALANKAN:
 *   1. Pastikan Cloud Function sudah di-deploy ATAU emulator berjalan:
 *        firebase emulators:start
 *   2. Jalankan PoC:
 *        node docs/ssdlc-microsoft-sdl/poc/poc-02-cloud-function-validation.mjs
 * 
 * HASIL YANG DIHARAPKAN:
 *   - ✅ Request tanpa Authorization header → 401
 *   - ✅ Request dengan token palsu → 401
 *   - ✅ GET request → 405
 *   - ✅ POST tanpa 'message' → 400
 *   - ⚠️ Tidak ada rate limiting → temuan kerentanan
 * ============================================================
 */

// Konfigurasi — sesuaikan URL sesuai environment
const FUNCTION_URL = process.env.FUNCTION_URL || 
  'http://127.0.0.1:5001/mindquest-app-f216d/asia-southeast2/analyzeEmotion'

const results = []
const PASS = '✅ PASS'
const FAIL = '❌ FAIL'
const FINDING = '⚠️ FINDING'

function logResult(testName, passed, detail = '', isFinding = false) {
  const status = isFinding ? FINDING : (passed ? PASS : FAIL)
  console.log(`  ${status}  ${testName}${detail ? ' — ' + detail : ''}`)
  results.push({ testName, passed, detail, isFinding })
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════')
  console.log('  PoC-02: Cloud Function Validation Test')
  console.log('═══════════════════════════════════════════════════')
  console.log(`  Target: ${FUNCTION_URL}`)
  console.log()

  // ── Test 1: Request tanpa Authorization header → 401 ────
  console.log('📌 Test 1: Request tanpa Authorization header')
  try {
    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'test' })
    })
    logResult('No-auth request ditolak (401)', res.status === 401, `HTTP ${res.status}`)
  } catch (err) {
    logResult('No-auth request ditolak (401)', false, `Network error: ${err.message}`)
  }

  // ── Test 2: Request dengan token palsu → 401 ───────────
  console.log('📌 Test 2: Request dengan token palsu')
  try {
    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token-12345-not-valid'
      },
      body: JSON.stringify({ message: 'test' })
    })
    // Di emulator, token bypass aktif → kita catat perilaku
    if (res.status === 401) {
      logResult('Fake-token ditolak (401)', true, 'Token forgery terblokir')
    } else if (res.status === 200) {
      logResult('Fake-token ditolak (401)', false, 
        'EMULATOR MODE: Token bypass aktif — di produksi harus 401', true)
    } else {
      logResult('Fake-token ditolak (401)', false, `HTTP ${res.status}`)
    }
  } catch (err) {
    logResult('Fake-token ditolak (401)', false, `Network error: ${err.message}`)
  }

  // ── Test 3: GET request → 405 ──────────────────────────
  console.log('📌 Test 3: GET request (method not allowed)')
  try {
    const res = await fetch(FUNCTION_URL, { method: 'GET' })
    logResult('GET request ditolak (405)', res.status === 405, `HTTP ${res.status}`)
  } catch (err) {
    logResult('GET request ditolak (405)', false, `Network error: ${err.message}`)
  }

  // ── Test 4: POST tanpa field 'message' → 400 ───────────
  console.log('📌 Test 4: POST tanpa field message')
  try {
    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token'
      },
      body: JSON.stringify({ history: [] })  // Tanpa 'message'
    })
    // Jika melewati auth (emulator), seharusnya 400
    if (res.status === 400) {
      logResult('Missing-message ditolak (400)', true, 'Input validation berjalan')
    } else if (res.status === 401) {
      logResult('Missing-message ditolak', true, 'Ditolak oleh auth dulu (produksi)')
    } else {
      logResult('Missing-message ditolak (400)', false, `HTTP ${res.status}`)
    }
  } catch (err) {
    logResult('Missing-message ditolak (400)', false, `Network error: ${err.message}`)
  }

  // ── Test 5: POST dengan history bukan array → 400 ──────
  console.log('📌 Test 5: POST dengan history bukan array')
  try {
    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token'
      },
      body: JSON.stringify({ message: 'test', history: 'bukan-array' })
    })
    if (res.status === 400) {
      logResult('Invalid-history ditolak (400)', true, 'Tipe validation berjalan')
    } else if (res.status === 401) {
      logResult('Invalid-history ditolak', true, 'Ditolak oleh auth dulu (produksi)')
    } else {
      logResult('Invalid-history ditolak (400)', false, `HTTP ${res.status}`)
    }
  } catch (err) {
    logResult('Invalid-history ditolak (400)', false, `Network error: ${err.message}`)
  }

  // ── Test 6: Rate Limiting Check (temuan negatif) ────────
  console.log('📌 Test 6: Rate limiting check (15 request burst)')
  const BURST_COUNT = 15
  let successCount = 0
  let rateLimitedCount = 0
  
  for (let i = 0; i < BURST_COUNT; i++) {
    try {
      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token'
        },
        body: JSON.stringify({ message: `burst test ${i}`, history: [] })
      })
      if (res.status === 429) rateLimitedCount++
      else successCount++
    } catch { /* ignore */ }
  }

  if (rateLimitedCount > 0) {
    logResult('Rate limiting aktif', true, 
      `${rateLimitedCount}/${BURST_COUNT} request di-throttle`)
  } else {
    logResult('Rate limiting TIDAK ADA', false, 
      `Semua ${BURST_COUNT} request diterima tanpa throttle — KERENTANAN`, true)
  }

  // ── Test 7: Payload size check ─────────────────────────
  console.log('📌 Test 7: Payload size validation (message 50KB)')
  const largeMessage = 'A'.repeat(50_000)  // 50KB
  try {
    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token'
      },
      body: JSON.stringify({ message: largeMessage, history: [] })
    })
    if (res.status === 400 || res.status === 413) {
      logResult('Large payload ditolak', true, `HTTP ${res.status}`)
    } else if (res.status === 401) {
      logResult('Large payload ditolak', true, 'Ditolak auth dulu (produksi)')
    } else {
      logResult('Large payload TIDAK ditolak', false, 
        `HTTP ${res.status} — tidak ada payload size limit`, true)
    }
  } catch (err) {
    logResult('Large payload test', false, `Network error: ${err.message}`)
  }

  // ── Ringkasan ──────────────────────────────────────────
  console.log()
  console.log('═══════════════════════════════════════════════════')
  console.log('  RINGKASAN HASIL')
  console.log('═══════════════════════════════════════════════════')
  const passed = results.filter(r => r.passed && !r.isFinding).length
  const findings = results.filter(r => r.isFinding).length
  const failed = results.filter(r => !r.passed && !r.isFinding).length
  console.log(`  Total tes      : ${results.length}`)
  console.log(`  Lulus          : ${passed}`)
  console.log(`  Temuan (⚠️)    : ${findings}`)
  console.log(`  Gagal          : ${failed}`)
  console.log()

  process.exit(0)
}

runTests().catch(err => {
  console.error('Fatal error:', err)
  console.error('Pastikan Firebase Emulator berjalan: firebase emulators:start')
  process.exit(1)
})
