/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback, useEffect, useRef } from 'react'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { firestore } from '../lib/firebase'
import { useAuth } from './useAuth'
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

function loadLocalDB() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (!raw) return { ...defaultDB }
    return { ...defaultDB, ...JSON.parse(raw) }
  } catch {
    return { ...defaultDB }
  }
}

function persistLocal(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

export const DataContext = createContext(null)

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [db, setDB] = useState(loadLocalDB)
  const [syncing, setSyncing] = useState(false)
  const userRef = useRef(user)
  // Track pending writes to skip their echo snapshots
  const pendingWrites = useRef(0)
  const migrated = useRef(false)

  // Keep userRef in sync
  useEffect(() => {
    userRef.current = user
  }, [user])

  // Single Firestore effect: subscribe + migrate on first snapshot
  useEffect(() => {
    if (!user) {
      migrated.current = false
      return
    }

    const uid = user.uid
    const userDocRef = doc(firestore, 'users', uid)
    let isFirstSnapshot = true

    const unsubscribe = onSnapshot(userDocRef, async (snapshot) => {
      // Skip echoes from our own writes
      if (pendingWrites.current > 0) {
        pendingWrites.current--
        return
      }

      if (isFirstSnapshot) {
        isFirstSnapshot = false

        if (!snapshot.exists() && !migrated.current) {
          // First sign-in: migrate local data to Firestore
          const localData = loadLocalDB()
          const hasData = Object.keys(localData.checkins).length > 0 || localData.xp > 0
          if (hasData) {
            setSyncing(true)
            try {
              pendingWrites.current++
              await setDoc(userDocRef, localData)
              migrated.current = true
            } catch (err) {
              console.error('Migration error:', err)
              pendingWrites.current = Math.max(0, pendingWrites.current - 1)
            } finally {
              setSyncing(false)
            }
          }
          return
        }
      }

      // Load remote data
      if (snapshot.exists()) {
        const firestoreData = { ...defaultDB, ...snapshot.data() }
        setDB(firestoreData)
        persistLocal(firestoreData)
      }
    }, (err) => {
      console.error('Firestore sync error:', err)
    })

    return unsubscribe
  }, [user])

  const updateDB = useCallback((updater) => {
    setDB(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persistLocal(next)

      // Write to Firestore if authenticated (use ref to avoid stale closure)
      const currentUser = userRef.current
      if (currentUser) {
        pendingWrites.current++
        const userDocRef = doc(firestore, 'users', currentUser.uid)
        setDoc(userDocRef, next).catch(err => {
          console.error('Firestore write error:', err)
          pendingWrites.current = Math.max(0, pendingWrites.current - 1)
        })
      }

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
        xp: Math.max(0, (prev.xp || 0) + xpDelta),
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
    updateDB(prev => ({ ...prev, xp: Math.max(0, (prev.xp || 0) + amount) }))
  }, [updateDB])

  const incrementCounter = useCallback((field, amount = 1) => {
    updateDB(prev => ({ ...prev, [field]: (prev[field] || 0) + amount }))
  }, [updateDB])

  const value = {
    db,
    syncing,
    submitCheckin,
    toggleQuest,
    completeRitual,
    addXP,
    incrementCounter,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
