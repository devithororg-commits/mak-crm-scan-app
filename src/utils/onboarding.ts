const ONBOARDING_KEY = 'csp_onboarding_v1'
const TIPS_KEY = 'csp_tips_dismissed'

export function hasSeenOnboarding() {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1'
  } catch {
    return false
  }
}

export function markOnboardingSeen() {
  try {
    localStorage.setItem(ONBOARDING_KEY, '1')
  } catch {
    /* ignore */
  }
}

export function areTipsDismissed() {
  try {
    return localStorage.getItem(TIPS_KEY) === '1'
  } catch {
    return false
  }
}

export function dismissTips() {
  try {
    localStorage.setItem(TIPS_KEY, '1')
  } catch {
    /* ignore */
  }
}
