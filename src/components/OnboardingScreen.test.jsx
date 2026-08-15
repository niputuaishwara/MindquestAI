/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import OnboardingScreen from './OnboardingScreen'

// Mock dependencies
vi.mock('@/services/authService', () => ({
  registerPseudonymous: vi.fn(),
  loginPseudonymous: vi.fn(),
  loginWithEmail: vi.fn(),
  signOutUser: vi.fn(),
}))

describe('OnboardingScreen Consent Flow', () => {
  it('disables the proceed button until consent checkbox is checked', () => {
    // Render as a new returning user who needs to give consent (Phase 2.5)
    render(
      <OnboardingScreen
        currentUser={{ uid: 'test-user' }}
        isNewUser={true}
        onPinSet={vi.fn()}
        onConsentGiven={vi.fn()}
        externalError={null}
      />
    )

    // The consent step should be visible
    expect(screen.getByText(/Sebelum Melanjutkan/i)).toBeDefined()

    // Find the checkbox and the button
    const checkbox = screen.getByLabelText(/Saya mengerti dan setuju dengan ketentuan privasi/i)
    const proceedButton = screen.getByRole('button', { name: /Lanjut & Buat PIN/i })

    // Button should be disabled initially
    expect(proceedButton.disabled).toBe(true)

    // Click the checkbox
    fireEvent.click(checkbox)

    // Button should be enabled now
    expect(proceedButton.disabled).toBe(false)
  })
})
