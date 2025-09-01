// Shared streak tracking utilities using localStorage
// Tracks daily completions in local time and resets at local midnight if a day is skipped
// Includes frozen streak functionality with grace period and streak freezes

const STORAGE_KEY = 'promodor_streak_v1'

const toLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseKeyToDate = (key) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const daysBetween = (fromKey, toKey) => {
  if (!fromKey || !toKey) return Infinity
  const from = parseKeyToDate(fromKey)
  const to = parseKeyToDate(toKey)
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor((to - from) / msPerDay)
}

export const loadStreak = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        currentStreak: 0,
        lastCompletedDateKey: null,
        completedDays: {}, // map of YYYY-MM-DD -> true
        weeklyCycleCounts: {}, // map of weekStartKey (YYYY-MM-DD of Sunday) -> number of cycles
        streakFreezes: 0, // number of available streak freezes
        lastMissedDateKey: null, // when the user last missed a day
        gracePeriodUsed: false, // whether grace period was used for current streak
      }
    }
    const data = JSON.parse(raw)
    return {
      currentStreak: Number(data.currentStreak) || 0,
      lastCompletedDateKey: data.lastCompletedDateKey || null,
      completedDays: data.completedDays || {},
      weeklyCycleCounts: data.weeklyCycleCounts || {},
      streakFreezes: Number(data.streakFreezes) || 0,
      lastMissedDateKey: data.lastMissedDateKey || null,
      gracePeriodUsed: Boolean(data.gracePeriodUsed) || false,
    }
  } catch {
    return {
      currentStreak: 0,
      lastCompletedDateKey: null,
      completedDays: {},
      weeklyCycleCounts: {},
      streakFreezes: 0,
      lastMissedDateKey: null,
      gracePeriodUsed: false,
    }
  }
}

const saveStreak = (data) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      currentStreak: data.currentStreak,
      lastCompletedDateKey: data.lastCompletedDateKey,
      completedDays: data.completedDays,
      weeklyCycleCounts: data.weeklyCycleCounts || {},
      streakFreezes: data.streakFreezes,
      lastMissedDateKey: data.lastMissedDateKey,
      gracePeriodUsed: data.gracePeriodUsed,
    })
  )
}

// Check if we can use grace period or streak freeze
const canUseProtection = (data, todayKey) => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = toLocalDateKey(yesterday)
  
  // If last completion was yesterday, no protection needed
  if (data.lastCompletedDateKey === yesterdayKey) {
    return { canUseGrace: false, canUseFreeze: false }
  }
  
  // Check grace period (24 hours from last completion)
  const canUseGrace = !data.gracePeriodUsed && 
    data.lastCompletedDateKey && 
    daysBetween(data.lastCompletedDateKey, todayKey) <= 2 // 2 days = 24-48 hour grace
  
  // Check streak freeze availability
  const canUseFreeze = data.streakFreezes > 0
  
  return { canUseGrace, canUseFreeze }
}

// Ensure that at the current local day start, streak is valid.
// If last completion isn't yesterday or today, check for protection mechanisms.
export const ensureRolloverNow = () => {
  const data = loadStreak()
  const todayKey = toLocalDateKey()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = toLocalDateKey(yesterday)

  // If already completed today, nothing to do
  if (data.completedDays[todayKey]) {
    data.lastCompletedDateKey = todayKey
    saveStreak(data)
    return data
  }

  // If last completion is yesterday, keep current streak but do not change
  if (data.lastCompletedDateKey === yesterdayKey) {
    saveStreak(data)
    return data
  }

  // Check if we can use protection mechanisms
  const { canUseGrace, canUseFreeze } = canUseProtection(data, todayKey)
  
  if (canUseGrace) {
    // Use grace period
    data.gracePeriodUsed = true
    data.lastMissedDateKey = yesterdayKey
    saveStreak(data)
    return data
  } else if (canUseFreeze) {
    // Use streak freeze
    data.streakFreezes -= 1
    data.lastMissedDateKey = yesterdayKey
    saveStreak(data)
    return data
  } else {
    // No protection available, break the streak
    data.currentStreak = 0
    data.gracePeriodUsed = false
    data.lastMissedDateKey = yesterdayKey
    saveStreak(data)
  }
  return data
}

// Mark today as completed and update the current streak accordingly
export const markTodayComplete = () => {
  const data = loadStreak()
  const todayKey = toLocalDateKey()

  if (data.completedDays[todayKey]) {
    // Already counted today
    return data
  }

  const gap = daysBetween(data.lastCompletedDateKey, todayKey)
  
  if (gap === 1) {
    // Normal continuation
    data.currentStreak += 1
    data.gracePeriodUsed = false // Reset grace period usage
  } else if (gap === 0) {
    // Same day completion (shouldn't happen due to early return)
    return data
  } else {
    // Gap > 1, check if protection was used
    if (data.lastMissedDateKey && daysBetween(data.lastMissedDateKey, todayKey) <= 2) {
      // Protection was used, continue streak
      data.currentStreak += 1
      data.gracePeriodUsed = false
    } else {
      // New streak
      data.currentStreak = 1
      data.gracePeriodUsed = false
    }
  }

  data.completedDays[todayKey] = true
  data.lastCompletedDateKey = todayKey
  
  // Award streak freeze for consistent usage
  if (data.currentStreak % 7 === 0) { // Every 7 days
    data.streakFreezes = Math.min(data.streakFreezes + 1, 2) // Max 2 freezes
  }
  
  saveStreak(data)
  return data
}

// Get completion info for the current local week (Sunday-Saturday)
export const getCurrentWeekInfo = () => {
  const data = ensureRolloverNow()
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday

  const days = []
  let completedCount = 0
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    const key = toLocalDateKey(d)
    const completed = !!data.completedDays[key]
    if (completed) completedCount += 1
    days.push({ key, completed, isToday: toLocalDateKey(today) === key })
  }

  return { days, completedCount, weekStartKey: toLocalDateKey(startOfWeek) }
}

// Run a callback at local midnight repeatedly; returns a cancel function
export const onLocalMidnight = (callback) => {
  const schedule = () => {
    const now = new Date()
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0)
    const delay = next.getTime() - now.getTime()
    const timeoutId = setTimeout(() => {
      try {
        callback()
      } finally {
        cancelId.id = schedule()
      }
    }, delay)
    return timeoutId
  }
  const cancelId = { id: schedule() }
  return () => clearTimeout(cancelId.id)
}

export const getCurrentStreak = () => ensureRolloverNow().currentStreak

export const getStreakFreezes = () => ensureRolloverNow().streakFreezes

export const resetAllStreakData = () => {
  localStorage.removeItem(STORAGE_KEY)
}

// Week helpers for counting cycles towards weekly goal
export const getCurrentWeekStartKey = () => {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  return toLocalDateKey(startOfWeek)
}

export const getWeeklyCycleCount = () => {
  const data = ensureRolloverNow()
  const weekKey = getCurrentWeekStartKey()
  return data.weeklyCycleCounts?.[weekKey] || 0
}

export const incrementWeeklyCycleCount = () => {
  const data = loadStreak()
  const weekKey = getCurrentWeekStartKey()
  if (!data.weeklyCycleCounts) data.weeklyCycleCounts = {}
  data.weeklyCycleCounts[weekKey] = (data.weeklyCycleCounts[weekKey] || 0) + 1
  saveStreak(data)
  return data.weeklyCycleCounts[weekKey]
}

// Composite helper: mark daily completion and increment weekly cycle count
export const completeFocusCycleToday = () => {
  const result = markTodayComplete()
  incrementWeeklyCycleCount()
  return result
}

// Manual streak freeze management
export const addStreakFreeze = (count = 1) => {
  const data = loadStreak()
  data.streakFreezes = Math.min(data.streakFreezes + count, 2) // Max 2 freezes
  saveStreak(data)
  return data.streakFreezes
}

export const consumeStreakFreeze = () => {
  const data = loadStreak()
  if (data.streakFreezes > 0) {
    data.streakFreezes -= 1
    saveStreak(data)
    return true
  }
  return false
}

// Get streak protection status
export const getStreakProtectionStatus = () => {
  const data = ensureRolloverNow()
  const todayKey = toLocalDateKey()
  const { canUseGrace, canUseFreeze } = canUseProtection(data, todayKey)
  
  return {
    hasGracePeriod: canUseGrace,
    hasStreakFreeze: canUseFreeze,
    streakFreezes: data.streakFreezes,
    gracePeriodUsed: data.gracePeriodUsed,
    isProtected: canUseGrace || canUseFreeze
  }
}

export const _internal = { toLocalDateKey, parseKeyToDate, daysBetween }


