// src/components/ForgotPasswordScreen.jsx
// Layar lupa password — sederhana, satu field email, satu tombol kirim.

import React, { useState } from 'react'
import { resetPassword } from '@/services/authService'

const STYLE = {
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh',
    fontFamily: 'sans-serif', padding: '1.5rem', background: '#FAFAFA'
  },
  card: {
    width: '100%', maxWidth: 380, background: '#fff',
    borderRadius: 16, padding: '2rem', boxShadow: '0 2px 16px rgba(83,74,183,0.10)'
  },
  title: { color: '#534AB7', margin: '0 0 0.5rem', fontSize: 20 },
  desc: { color: '#888', fontSize: 13, margin: '0 0 1.5rem', lineHeight: 1.6 },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14,
    border: '1.5px solid #DDD', outline: 'none', boxSizing: 'border-box',
    marginBottom: '1rem', fontFamily: 'inherit'
  },
  btnPrimary: {
    width: '100%', padding: '11px', background: '#534AB7', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
    cursor: 'pointer'
  },
  btnBack: {
    background: 'none', border: 'none', color: '#888',
    fontSize: 13, cursor: 'pointer', marginTop: '1rem', textDecoration: 'underline'
  },
  success: {
    background: '#F0FFF4', border: '1px solid #B2DFC2', color: '#1A6B3A',
    borderRadius: 8, padding: '10px 12px', fontSize: 13, marginBottom: '1rem'
  },
  error: {
    background: '#FFF0F0', border: '1px solid #F5C6C6', color: '#A32D2D',
    borderRadius: 8, padding: '10px 12px', fontSize: 13, marginBottom: '1rem'
  }
}

export default function ForgotPasswordScreen({ onBack }) {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleSend = async () => {
    setError('')
    if (!email.trim()) { setError('Masukkan email kamu dulu.'); return }

    setLoading(true)
    try {
      await resetPassword(email.trim())
      setSent(true)
    } catch (err) {
      const map = {
        'auth/user-not-found':         'Email tidak terdaftar di MindQuest.',
        'auth/invalid-email':          'Format email tidak valid.',
        'auth/network-request-failed': 'Tidak ada koneksi internet.'
      }
      setError(map[err.code] || 'Gagal mengirim email. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={STYLE.wrap}>
      <div style={STYLE.card}>
        <h2 style={STYLE.title}>Reset Password</h2>
        <p style={STYLE.desc}>
          Masukkan email yang kamu daftarkan. Kami akan kirimkan tautan untuk membuat password baru.
        </p>

        {error && <div style={STYLE.error}>{error}</div>}
        {sent && (
          <div style={STYLE.success}>
            Email berhasil dikirim! Cek kotak masukmu (termasuk folder spam).
          </div>
        )}

        {!sent && (
          <>
            <input
              style={STYLE.input}
              type="email"
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button style={STYLE.btnPrimary} onClick={handleSend} disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim Tautan Reset'}
            </button>
          </>
        )}

        <div style={{ textAlign: 'center' }}>
          <button style={STYLE.btnBack} onClick={onBack}>
            ← Kembali ke halaman masuk
          </button>
        </div>
      </div>
    </div>
  )
}
