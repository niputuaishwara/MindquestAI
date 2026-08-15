import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, getDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "fake-api-key",
  projectId: "mindquest-app-f216d", // Sesuai dengan emulator project id
};

describe('deleteUserAccount Cloud Function', () => {
  let app, auth, db, functions;
  
  beforeAll(async () => {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    functions = getFunctions(app, 'asia-southeast2');

    // Pastikan Firebase emulator berjalan
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  });

  it('harus menolak request unauthenticated', async () => {
    // Pastikan tidak ada user login
    await auth.signOut();
    const deleteUserAccount = httpsCallable(functions, 'deleteUserAccount');
    
    await expect(deleteUserAccount()).rejects.toThrow(/User harus login/i);
  });

  it('harus menolak request jika mencoba menghapus UID orang lain', async () => {
    const email = `malicious-${Date.now()}@example.com`;
    const password = 'password123';
    await createUserWithEmailAndPassword(auth, email, password);

    const deleteUserAccount = httpsCallable(functions, 'deleteUserAccount');
    
    // Payload dengan target UID berbeda
    await expect(deleteUserAccount({ uid: 'target-uid-orang-lain' })).rejects.toThrow(/Anda tidak diizinkan menghapus akun pengguna lain/i);
  });

  it('harus menghapus dokumen pengguna, subkoleksi, dan auth secara permanen', async () => {
    const email = `testuser-${Date.now()}@example.com`;
    const password = 'password123';
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // 1. Siapkan mock data
    await setDoc(doc(db, 'users', uid), { salt: 'dummy-salt', wrappedKey: 'dummy-key' });
    await setDoc(doc(db, `journals/${uid}`), { created: true });
    
    // Subkoleksi entries
    const entriesRef = collection(db, `journals/${uid}/entries`);
    await addDoc(entriesRef, { text: 'test entry 1' });
    await addDoc(entriesRef, { text: 'test entry 2' });

    // Subkoleksi sessions
    const sessionsRef = collection(db, `journals/${uid}/sessions`);
    await addDoc(sessionsRef, { history: [] });

    // Pastikan data tersimpan
    const userDocSnap = await getDoc(doc(db, 'users', uid));
    expect(userDocSnap.exists()).toBe(true);

    const entriesSnap = await getDocs(entriesRef);
    expect(entriesSnap.empty).toBe(false);

    // 2. Eksekusi Hapus Akun
    const deleteUserAccount = httpsCallable(functions, 'deleteUserAccount');
    const result = await deleteUserAccount();
    
    expect(result.data.success).toBe(true);

    // 3. Verifikasi data telah terhapus
    const userDocAfter = await getDoc(doc(db, 'users', uid));
    expect(userDocAfter.exists()).toBe(false);

    const journalDocAfter = await getDoc(doc(db, `journals/${uid}`));
    expect(journalDocAfter.exists()).toBe(false);
    
    const entriesAfter = await getDocs(entriesRef);
    expect(entriesAfter.empty).toBe(true);

    const sessionsAfter = await getDocs(sessionsRef);
    expect(sessionsAfter.empty).toBe(true);
  });
});
