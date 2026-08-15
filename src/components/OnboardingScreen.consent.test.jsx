// @vitest-environment jsdom
// src/components/OnboardingScreen.consent.test.jsx
//
// Jalankan: npm run test
// Test ini memverifikasi bahwa tombol "Lanjut & Buat PIN" disabled
// sebelum checkbox consent dicentang, dan enabled setelah dicentang.

import React from 'react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// ── Mock semua dependency eksternal ─────────────────────────────────────────

// Mock authService — OnboardingScreen mengimpor fungsi-fungsi ini tapi tidak
// dipanggil dalam skenario consent step yang kita uji.
vi.mock('@/services/authService', () => ({
  registerPseudonymous: vi.fn(),
  loginPseudonymous: vi.fn(),
  loginWithEmail: vi.fn(),
  signOutUser: vi.fn(),
}))

// Mock firebase config — tidak dibutuhkan di unit test UI ini.
vi.mock('@/config/firebase', () => ({ db: {} }))

// Mock lucide-react — render ikon sebagai <svg> kosong agar test tidak error
// karena SVG tidak butuh resolusi path aset.
vi.mock('lucide-react', () => {
  const Stub = ({ 'data-testid': tid }) => <svg data-testid={tid} />
  return new Proxy({}, {
    get: (_, name) => (props) => <Stub {...props} data-testid={name} />,
  })
})

// ── Import komponen setelah semua mock terpasang ─────────────────────────────
import OnboardingScreen from './OnboardingScreen'

// ── Fixtures ─────────────────────────────────────────────────────────────────

/** Simulasikan currentUser: objek minimal mirip Firebase User */
const mockUser = { uid: 'test-uid-001', displayName: 'rusa_bintang_test' }

const defaultProps = {
  currentUser: mockUser,   // user sudah auth → tampil consent/PIN phase
  isNewUser: true,         // user baru → consent step harus muncul
  onPinSet: vi.fn(),
  onConsentGiven: vi.fn(),
  externalError: null,
  onBack: vi.fn(),
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('OnboardingScreen — Consent Step', () => {
  it('menampilkan layar consent ketika isNewUser=true dan user sudah auth', () => {
    render(<OnboardingScreen {...defaultProps} />)
    // Heading consent harus ada
    expect(screen.getByText('Sebelum Melanjutkan')).toBeInTheDocument()
    // Checkbox harus ada
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    // Tombol CTA harus ada
    expect(screen.getByRole('button', { name: /lanjut.*buat pin/i })).toBeInTheDocument()
  })

  it('tombol "Lanjut & Buat PIN" disabled sebelum checkbox dicentang', () => {
    render(<OnboardingScreen {...defaultProps} />)
    const button = screen.getByRole('button', { name: /lanjut.*buat pin/i })
    // Tombol HARUS disabled sebelum checkbox dicentang
    expect(button).toBeDisabled()
  })

  it('tombol "Lanjut & Buat PIN" enabled setelah checkbox dicentang', () => {
    render(<OnboardingScreen {...defaultProps} />)
    const checkbox = screen.getByRole('checkbox')
    const button = screen.getByRole('button', { name: /lanjut.*buat pin/i })

    // Sebelum centang: disabled
    expect(button).toBeDisabled()

    // Centang checkbox
    fireEvent.click(checkbox)

    // Setelah centang: enabled
    expect(button).toBeEnabled()
  })

  it('memanggil onConsentGiven dengan { given: true, timestamp } ketika proceed diklik', () => {
    const onConsentGiven = vi.fn()
    render(<OnboardingScreen {...defaultProps} onConsentGiven={onConsentGiven} />)

    // Centang dan klik
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /lanjut.*buat pin/i }))

    expect(onConsentGiven).toHaveBeenCalledOnce()
    const arg = onConsentGiven.mock.calls[0][0]
    expect(arg.given).toBe(true)
    expect(typeof arg.timestamp).toBe('string')
    // timestamp harus berformat ISO 8601
    expect(() => new Date(arg.timestamp).toISOString()).not.toThrow()
  })

  it('tidak menampilkan consent step untuk returning user (isNewUser=false)', () => {
    render(
      <OnboardingScreen
        {...defaultProps}
        isNewUser={false}
      />
    )
    // Layar consent tidak boleh muncul
    expect(screen.queryByText('Sebelum Melanjutkan')).not.toBeInTheDocument()
    // Sebaliknya, layar PIN yang muncul
    expect(screen.getByText('Kunci Enkripsi Anda')).toBeInTheDocument()
  })
})
