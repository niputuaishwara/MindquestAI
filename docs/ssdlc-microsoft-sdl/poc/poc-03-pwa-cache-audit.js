/**
 * ============================================================
 * PoC-03: PWA Cache Exfiltration & Service Worker Threats
 * ============================================================
 * 
 * TUJUAN : Mengaudit konfigurasi Service Worker dan caching strategy
 *          untuk ancaman spesifik PWA (AT-01-C1, AT-01-C2):
 *          (a) Apakah ciphertext bisa dieksfiltrasi dari Cache Storage?
 *          (b) Apakah token auth ter-cache secara tidak sengaja?
 *          (c) Apakah Service Worker memiliki scope yang terlalu luas?
 * 
 * METODE : Analisis statis pada sw.js dan vite.config.js, lalu
 *          audit Cache Storage browser via DevTools Console.
 *
 * CARA MENJALANKAN (di browser DevTools Console):
 *   1. Buka aplikasi MindQuest di browser
 *   2. Buka DevTools → Console
 *   3. Paste dan jalankan kode di bawah ini
 * 
 * HASIL YANG DIHARAPKAN:
 *   - ✅ Token auth TIDAK ada di cache (NetworkOnly)
 *   - ✅ Cloud Function responses TIDAK ada di cache (NetworkOnly)
 *   - ⚠️ Firestore cache mungkin berisi ciphertext (tapi terenkripsi)
 *   - ✅ Cache memiliki expiration limits
 * ============================================================
 */

// ── Jalankan di DevTools Console ─────────────────────────
// Salin semua kode di bawah, paste ke Console, tekan Enter.

(async function auditPWACaches() {
  console.log('═══════════════════════════════════════════════════')
  console.log('  PoC-03: PWA Cache Storage Audit')
  console.log('═══════════════════════════════════════════════════')
  console.log()

  // 1. List semua cache names
  const cacheNames = await caches.keys()
  console.log('📦 Cache Storage yang ditemukan:')
  for (const name of cacheNames) {
    const cache = await caches.open(name)
    const keys = await cache.keys()
    console.log(`   ${name}: ${keys.length} entries`)
    
    // 2. Periksa setiap entry
    for (const request of keys) {
      const url = new URL(request.url)
      
      // 🔴 Cek apakah ada token auth di cache
      if (url.hostname === 'identitytoolkit.googleapis.com' ||
          url.hostname.includes('securetoken')) {
        console.warn(`   ⚠️ TEMUAN: Token auth ditemukan di cache!`)
        console.warn(`      URL: ${request.url}`)
        console.warn(`      Cache: ${name}`)
      }
      
      // 🔴 Cek apakah ada Cloud Function response di cache
      if (url.hostname.includes('cloudfunctions.net')) {
        console.warn(`   ⚠️ TEMUAN: Cloud Function response di cache!`)
        console.warn(`      URL: ${request.url}`)
        console.warn(`      Cache: ${name}`)
      }
      
      // 🟡 Cek apakah ada Firestore data di cache
      if (url.hostname === 'firestore.googleapis.com') {
        console.log(`   ℹ️ Firestore data di cache (terenkripsi): ${url.pathname.slice(0, 80)}...`)
      }
    }
  }

  console.log()

  // 3. Periksa Service Worker registration
  const registrations = await navigator.serviceWorker.getRegistrations()
  console.log('🔧 Service Worker Registrations:')
  for (const reg of registrations) {
    console.log(`   Scope: ${reg.scope}`)
    console.log(`   Active: ${reg.active ? reg.active.scriptURL : 'none'}`)
    console.log(`   State: ${reg.active ? reg.active.state : 'none'}`)
    
    // Cek apakah scope terlalu luas
    if (reg.scope === window.location.origin + '/') {
      console.log(`   ✅ Scope normal (root path)`)
    }
  }

  console.log()

  // 4. Periksa apakah IndexedDB berisi data sensitif
  console.log('💾 IndexedDB Databases:')
  const dbs = await indexedDB.databases()
  for (const db of dbs) {
    console.log(`   ${db.name} (v${db.version})`)
  }

  console.log()

  // 5. Periksa localStorage untuk secrets
  console.log('🔑 localStorage Audit:')
  let secretsFound = false
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    const value = localStorage.getItem(key)
    
    // Cek pola yang mencurigakan
    if (key.toLowerCase().includes('key') || 
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('password')) {
      console.warn(`   ⚠️ Kunci sensitif di localStorage: "${key}"`)
      console.warn(`      Panjang nilai: ${value.length} karakter`)
      secretsFound = true
    }
  }
  if (!secretsFound) {
    console.log('   ✅ Tidak ada kunci sensitif terdeteksi di localStorage')
  }

  console.log()
  console.log('═══════════════════════════════════════════════════')
  console.log('  SELESAI — Review output di atas untuk temuan')
  console.log('═══════════════════════════════════════════════════')
})()
