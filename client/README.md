# Frozen Streak System

## Overview

The frozen streak system implements a hybrid protection mechanism similar to Duolingo's streak freeze feature, designed to help users maintain their productivity streaks even when they miss a day.

## How It Works

### 1. Streak Freezes
- **Earning**: Users earn 1 streak freeze every 4 consecutive days of activity
- **Maximum**: Users can hold up to 3 streak freezes at a time
- **Usage**: Automatically consumed when a user misses a day. One freeze is used per day missed
- **Manual**: Can be manually added/used for testing purposes

### 2. Protection Priority
1. **Streak Freeze**: First and only line of defense (automatic consumption)
2. **Streak Break**: If no protection is available when a day is missed

## Implementation Details

### Data Structure
```javascript
{
  currentStreak: 0,
  lastCompletedDateKey: null,
  completedDays: {},
  weeklyCycleCounts: {},
  streakFreezes: 0,           // Number of available freezes
  lastMissedDateKey: null,    // When user last missed a day
  gracePeriodUsed: false,     // This is no longer in use
}
```

### Key Functions
- `ensureRolloverNow()`: Checks if streak should be maintained or broken, applies protection mechanisms automatically
- `markTodayComplete()`: Marks today as completed, awards streak freezes every 4 days
- `getStreakProtectionStatus()`: Returns current protection status, shows available freezes, indicates if streak is currently protected

### Visual Indicators
- **Streak Overlay**: Blue badge shows the number of available streak freezes
- **Main App**: Header displays current streak and frozen streak count
- **Statistics Section**: Comprehensive view of streak system with test panel

## Testing Scenarios

### Scenario 1: Normal Streak Continuation
- Complete a session today
- Complete a session tomorrow
- Streak continues normally

### Scenario 2: Streak Freeze Usage (1 Day Missed)
- Complete a session today
- Miss tomorrow
- Have at least 1 streak freeze available
- Complete a session on the third day
- Streak continues (1 freeze consumed)

### Scenario 3: Streak Freeze Usage (2 Days Missed)
- Complete a session today
- Miss tomorrow and the day after
- Have at least 2 streak freezes available
- Complete a session on the fourth day
- Streak continues (2 freezes consumed)

### Scenario 4: Streak Break
- Complete a session today
- Miss tomorrow
- No streak freezes available
- Complete a session the day after tomorrow
- Streak resets to 1

### Scenario 5: Streak Break (Consecutive Missed Days)
- Complete a session today
- Miss tomorrow and the day after
- Only have 1 streak freeze available
- Streak is broken on the second day of being missed
- On the fourth day, streak resets to 1 when a session is completed

## Benefits

- **User Retention**: Reduces frustration from losing streaks due to occasional missed days
- **Engagement**: Encourages consistent usage to earn freezes
- **Flexibility**: Provides a protection layer
- **Fairness**: Limits protection to prevent abuse

## Future Enhancements

- **Premium Features**: Additional freezes for premium users
- **Social Features**: Gift freezes to friends
- **Achievements**: Rewards for maintaining long streaks
- **Analytics**: Track protection usage patterns

## Usage in App

- **Automatic**: Protection works automatically in the background
- **Visual Feedback**: Users can see their protection status
- **Testing**: Test panel available in the Statistics section
- **Transparency**: Clear indicators when protection is used
