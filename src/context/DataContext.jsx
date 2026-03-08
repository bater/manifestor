/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback } from 'react'
import { todayKey } from '../utils/dateUtils'

const DB_KEY = 'manifestor_db'

const defaultDB = {
  checkins: {},
  quests: {},
  rituals: {},
  xp: 0,
  focusSessions: 0,
  focusMinutes: 0,
  oracleCount: 0,
  gardenVisits: 0,
}

function loadDB() {
  const raw = localStorage.getItem(DB_KEY)
  if (!raw) return { ...defaultDB }
  return { ...defaultDB, ...JSON.parse(raw) }
}

function persistDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

export const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [db, setDB] = useState(loadDB)

  const updateDB = useCallback((updater) => {
    setDB(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persistDB(next)
      return next
    })
  }, [])

  const submitCheckin = useCallback((energy, mood, note) => {
    updateDB(prev => {
      const key = todayKey()
      return {
        ...prev,
        checkins: {
          ...prev.checkins,
          [key]: {
            date: key, energy, mood, note,
            quests: [], rituals: [], timestamp: Date.now(),
          },
        },
        xp: (prev.xp || 0) + 30,
      }
    })
  }, [updateDB])

  const toggleQuest = useCallback((questName, xpAmount) => {
    updateDB(prev => {
      const key = todayKey()
      const todayQuests = prev.quests[key] || []
      const isDone = todayQuests.includes(questName)
      const newQuests = isDone
        ? todayQuests.filter(q => q !== questName)
        : [...todayQuests, questName]
      const xpDelta = isDone ? -xpAmount : xpAmount

      const checkin = prev.checkins[key]
      const updatedCheckins = checkin ? {
        ...prev.checkins,
        [key]: {
          ...checkin,
          quests: isDone
            ? (checkin.quests || []).filter(q => q !== questName)
            : [...new Set([...(checkin.quests || []), questName])],
        },
      } : prev.checkins

      return {
        ...prev,
        quests: { ...prev.quests, [key]: newQuests },
        checkins: updatedCheckins,
        xp: (prev.xp || 0) + xpDelta,
      }
    })
  }, [updateDB])

  const completeRitual = useCallback((ritualName) => {
    updateDB(prev => {
      const key = todayKey()
      const todayRituals = prev.rituals[key] || []
      if (todayRituals.includes(ritualName)) return prev

      const checkin = prev.checkins[key]
      const updatedCheckins = checkin ? {
        ...prev.checkins,
        [key]: {
          ...checkin,
          rituals: [...new Set([...(checkin.rituals || []), ritualName])],
        },
      } : prev.checkins

      return {
        ...prev,
        rituals: { ...prev.rituals, [key]: [...todayRituals, ritualName] },
        checkins: updatedCheckins,
        xp: (prev.xp || 0) + 10,
      }
    })
  }, [updateDB])

  const addXP = useCallback((amount) => {
    updateDB(prev => ({ ...prev, xp: (prev.xp || 0) + amount }))
  }, [updateDB])

  const incrementCounter = useCallback((field, amount = 1) => {
    updateDB(prev => ({ ...prev, [field]: (prev[field] || 0) + amount }))
  }, [updateDB])

  const value = {
    db,
    submitCheckin,
    toggleQuest,
    completeRitual,
    addXP,
    incrementCounter,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
