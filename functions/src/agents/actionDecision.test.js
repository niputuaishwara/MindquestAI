import { describe, it, expect } from 'vitest'
import { decideAction } from './actionDecision.js'

describe('Action Decision Agent', () => {
  it('should trigger TRIGGER_CRISIS_PROTOCOL when phase is distress', () => {
    const aiResponse = {
      phase: 'distress',
      isComplete: true,
      result: { emotionType: 'distress', emotionLabel: 'Distres Akut' }
    }
    const result = decideAction(aiResponse)
    
    expect(result.actions).toBeDefined()
    expect(result.actions.length).toBeGreaterThan(0)
    
    const crisisAction = result.actions.find(a => a.type === 'TRIGGER_CRISIS_PROTOCOL')
    expect(crisisAction).toBeDefined()
    expect(crisisAction.payload.alert).toBe('Peringatan Medis Darurat')
  })


  it('should NOT trigger SAVE_SESSION_AND_RECOMMEND_QUEST during distress', () => {
    const aiResponse = {
      phase: 'distress',
      isComplete: true,
      result: { emotionType: 'distress', emotionLabel: 'Distres Akut' }
    }
    const result = decideAction(aiResponse)
    
    const recommendQuestAction = result.actions.find(a => a.type === 'SAVE_SESSION_AND_RECOMMEND_QUEST')
    expect(recommendQuestAction).toBeUndefined()
  })

  it('should trigger SUGGEST_TREND_CHECKIN when consecutiveNegativeDays >= 3 and not distress', () => {
    const aiResponse = {
      phase: 'scoring',
      isComplete: true,
      result: { emotionType: 'negative', emotionLabel: 'Sedih' }
    }
    const result = decideAction(aiResponse, 3) // 3 consecutive negative days
    
    const trendAction = result.actions.find(a => a.type === 'SUGGEST_TREND_CHECKIN')
    expect(trendAction).toBeDefined()
    expect(trendAction.payload.consecutiveNegativeDays).toBe(3)
    expect(trendAction.payload.message).toContain('3 hari berturut-turut')
  })

  it('should trigger SAVE_SESSION_AND_RECOMMEND_QUEST when conversation is complete and not distress', () => {
    const aiResponse = {
      phase: 'scoring',
      isComplete: true,
      result: { emotionType: 'positive', emotionLabel: 'Bahagia', score: 8, plutchikCategory: 'Senang' }
    }
    const result = decideAction(aiResponse)
    
    const recommendAction = result.actions.find(a => a.type === 'SAVE_SESSION_AND_RECOMMEND_QUEST')
    expect(recommendAction).toBeDefined()
    expect(recommendAction.payload.emotionLabel).toBe('Bahagia')
  })

  it('should trigger SUGGEST_BREATHING_EXERCISE for high negative score (>= 8) but not distress', () => {
    const aiResponse = {
      phase: 'scoring',
      isComplete: true,
      result: { emotionType: 'negative', emotionLabel: 'Marah', score: 9 }
    }
    const result = decideAction(aiResponse)
    
    const breathAction = result.actions.find(a => a.type === 'SUGGEST_BREATHING_EXERCISE')
    expect(breathAction).toBeDefined()
    
    const crisisAction = result.actions.find(a => a.type === 'TRIGGER_CRISIS_PROTOCOL')
    expect(crisisAction).toBeUndefined() // Ensure it's not treated as crisis
  })
})
