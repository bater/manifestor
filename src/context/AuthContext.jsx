/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '../lib/firebase'

export const AuthContext = createContext(null)

const googleProvider = new GoogleAuthProvider()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading, null = not signed in
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    }, (err) => {
      console.error('Auth state error:', err)
      setError(err.message)
      setUser(null)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      setError(null)
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <AuthContext.Provider value={{ user, error, signInWithGoogle, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  )
}
