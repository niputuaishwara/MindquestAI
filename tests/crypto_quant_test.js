import crypto from 'crypto';

// Parameter Kriptografi
const ALGORITHM = 'aes-256-gcm';
const HASH_ALGO = 'sha256';
const ITERATIONS = 210000;
const KEY_LEN = 32;
const SALT_LEN = 16;
const IV_LEN = 12;

// Helper: Menghitung Shannon Entropy
function calculateEntropy(buffer) {
    const frequencies = new Array(256).fill(0);
    for (let i = 0; i < buffer.length; i++) {
        frequencies[buffer[i]]++;
    }

    let entropy = 0;
    const len = buffer.length;
    for (let count of frequencies) {
        if (count > 0) {
            const p = count / len;
            entropy -= p * Math.log2(p);
        }
    }
    return entropy;
}

// Helper: Mengukur Latensi
function measureLatency(name, fn, iterations) {
    const times = [];
    for (let i = 0; i < iterations; i++) {
        const start = process.hrtime.bigint();
        fn(i);
        const end = process.hrtime.bigint();
        times.push(Number(end - start) / 1000000); // ms
    }

    times.sort((a, b) => a - b);
    const sum = times.reduce((a, b) => a + b, 0);
    const avg = sum / times.length;
    const min = times[0];
    const max = times[times.length - 1];
    const p95 = times[Math.floor(times.length * 0.95)];

    console.log(`\n--- Latensi: ${name} (n=${iterations}) ---`);
    console.log(`Rerata : ${avg.toFixed(3)} ms`);
    console.log(`Min    : ${min.toFixed(3)} ms`);
    console.log(`Maks   : ${max.toFixed(3)} ms`);
    console.log(`P95    : ${p95.toFixed(3)} ms`);
    
    return { avg, min, max, p95 };
}

// 1. Pengujian Latensi
console.log("=========================================");
console.log("1. PENGUJIAN LATENSI");
console.log("=========================================");

const testPassword = 'my-super-secret-password-123';
const testSalt = crypto.randomBytes(SALT_LEN);
let derivedKey;

measureLatency('Derivasi Kunci PBKDF2', () => {
    derivedKey = crypto.pbkdf2Sync(testPassword, testSalt, ITERATIONS, KEY_LEN, HASH_ALGO);
}, 30);

const testPlaintexts = Array.from({ length: 200 }, (_, i) => 
    Buffer.from(`Ini adalah data jurnal pengguna untuk entri ke-${i}. Berisi informasi yang cukup panjang untuk simulasi.`.repeat(3))
);
const encryptedData = [];

measureLatency('Enkripsi AES-256-GCM', (i) => {
    const iv = crypto.randomBytes(IV_LEN);
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
    let ciphertext = cipher.update(testPlaintexts[i]);
    ciphertext = Buffer.concat([ciphertext, cipher.final()]);
    const tag = cipher.getAuthTag();
    encryptedData.push({ iv, ciphertext, tag });
}, 200);

measureLatency('Dekripsi AES-256-GCM', (i) => {
    const data = encryptedData[i];
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, data.iv);
    decipher.setAuthTag(data.tag);
    let decrypted = decipher.update(data.ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
}, 200);


// 2. Pengujian Entropy
console.log("\n=========================================");
console.log("2. PENGUJIAN ENTROPY (KEACAKAN)");
console.log("=========================================");

// Mengukur entropy pada entri tunggal
const singleEntry = encryptedData[0];
const singleBuffer = Buffer.concat([singleEntry.iv, singleEntry.ciphertext, singleEntry.tag]);
const singleEntropy = calculateEntropy(singleBuffer);
console.log(`Entropy sampel tunggal (${singleBuffer.length} bytes): ${singleEntropy.toFixed(4)} bit/byte`);
console.log(`(Batas teoretis untuk ${singleBuffer.length} byte: ${Math.log2(singleBuffer.length).toFixed(4)} bit/byte)`);

// Mengukur entropy korpus agregat (200 entri)
const allBuffers = encryptedData.map(d => Buffer.concat([d.iv, d.ciphertext, d.tag]));
const aggregateBuffer = Buffer.concat(allBuffers);
const aggregateEntropy = calculateEntropy(aggregateBuffer);
console.log(`Entropy korpus agregat 200 entri (${aggregateBuffer.length} bytes): ${aggregateEntropy.toFixed(4)} bit/byte`);
console.log(`(Mendekati batas teoretis maksimum 8.0 bit/byte)`);


// 3. Pengujian Deteksi Manipulasi (Tamper Detection)
console.log("\n=========================================");
console.log("3. PENGUJIAN DETEKSI MANIPULASI (TAMPER)");
console.log("=========================================");

let totalAttempts = 200;
let detected = 0;
let undetected = 0;
let manipCiphertext = 0;
let manipTag = 0;
let manipIv = 0;

for (let i = 0; i < totalAttempts; i++) {
    const data = encryptedData[i];
    
    // Copy buffer untuk dimanipulasi
    const manipulated = {
        iv: Buffer.from(data.iv),
        ciphertext: Buffer.from(data.ciphertext),
        tag: Buffer.from(data.tag)
    };

    // Pilih secara acak apa yang akan dimanipulasi (0: ciphertext, 1: tag, 2: iv)
    const target = Math.floor(Math.random() * 3);
    
    let targetBuffer;
    if (target === 0) {
        targetBuffer = manipulated.ciphertext;
        manipCiphertext++;
    } else if (target === 1) {
        targetBuffer = manipulated.tag;
        manipTag++;
    } else {
        targetBuffer = manipulated.iv;
        manipIv++;
    }

    // Flip 1 byte secara acak di target buffer
    const randomByteIndex = Math.floor(Math.random() * targetBuffer.length);
    targetBuffer[randomByteIndex] ^= 1; // Membalik bit pada byte yang dipilih

    // Coba Dekripsi
    try {
        const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, manipulated.iv);
        decipher.setAuthTag(manipulated.tag);
        let decrypted = decipher.update(manipulated.ciphertext);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        // Jika sampai sini, manipulasi lolos!
        undetected++;
    } catch (e) {
        // Manipulasi berhasil dideteksi (melempar error 'Unsupported state or unable to authenticate data')
        detected++;
    }
}

console.log(`Total Percobaan    : ${totalAttempts}`);
console.log(`Manipulasi Cipher  : ${manipCiphertext}`);
console.log(`Manipulasi Tag     : ${manipTag}`);
console.log(`Manipulasi IV      : ${manipIv}`);
console.log(`Berhasil Dideteksi : ${detected} (${(detected/totalAttempts*100).toFixed(2)}%)`);
console.log(`Lolos/Gagal Deteksi: ${undetected} (${(undetected/totalAttempts*100).toFixed(2)}%)`);

console.log("\nSelesai.");
