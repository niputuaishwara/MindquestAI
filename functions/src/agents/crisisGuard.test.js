import { describe, it, expect } from 'vitest'
import { checkCrisisSignal } from './crisisGuard.js'

describe('Crisis Guard Agent', () => {
  describe('checkCrisisSignal', () => {
    it('should return triggered:true for explicit suicide signals', () => {
      const msgs = [
        "aku pengen mati rasanya",
        "ingin mengakhiri hidup ini",
        "capek hidup terus begini",
        "aku mau bunuh diri",
        "udah tidak kuat lagi menanggung ini"
      ]
      
      msgs.forEach(msg => {
        const result = checkCrisisSignal(msg)
        expect(result.triggered).toBe(true)
        expect(result.matchedPattern).toBeDefined()
      })
    })

    it('should return triggered:false for normal or non-crisis negative messages', () => {
      const msgs = [
        "aku sedih banget hari ini karena dimarahi bos",
        "rasanya cemas memikirkan ujian besok",
        "marah karena temanku membatalkan janji",
        "aku kecewa dengan hasil kerjaku",
        "hidup memang kadang susah, tapi ya sudahlah"
      ]
      
      msgs.forEach(msg => {
        const result = checkCrisisSignal(msg)
        expect(result.triggered).toBe(false)
        expect(result.matchedPattern).toBeNull()
      })
    })

    it('should handle edge cases and empty messages gracefully', () => {
      expect(checkCrisisSignal("").triggered).toBe(false)
      expect(checkCrisisSignal("   ").triggered).toBe(false)
      expect(checkCrisisSignal(null).triggered).toBe(false)
      expect(checkCrisisSignal(undefined).triggered).toBe(false)
    })
  })
})
