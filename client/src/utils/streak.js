// Shared streak tracking utilities using localStorage
// Tracks daily completions in local time and resets at local midnight if a day is skipped

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
      }
    }
    const data = JSON.parse(raw)
    return {
      currentStreak: Number(data.currentStreak) || 0,
      lastCompletedDateKey: data.lastCompletedDateKey || null,
      completedDays: data.completedDays || {},
      weeklyCycleCounts: data.weeklyCycleCounts || {},
    }
  } catch {
    return {
      currentStreak: 0,
      lastCompletedDateKey: null,
      completedDays: {},
      weeklyCycleCounts: {},
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
    })
  )
}

// Ensure that at the current local day start, streak is valid.
// If last completion isn't yesterday or today, reset streak to 0.
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

  // If last completion is neither today nor yesterday, the streak is broken
  if (data.lastCompletedDateKey && data.lastCompletedDateKey !== todayKey) {
    data.currentStreak = 0
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
    data.currentStreak += 1
  } else {
    // gap 0 shouldn't happen due to early return; gap > 1 means new streak
    data.currentStreak = 1
  }

  data.completedDays[todayKey] = true
  data.lastCompletedDateKey = todayKey
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

export const _internal = { toLocalDateKey, parseKeyToDate, daysBetween }


