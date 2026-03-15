import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { loadUserData, migrateLocalStorage } from './supabaseSync'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const hydrate = useCallback(async () => {
    try {
      await loadUserData()
    } catch (err) {
      console.error('Failed to hydrate from Supabase:', err)
    }
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)

      if (s?.user) {
        // User already authenticated — hydrate stores
        migrateLocalStorage(s.user.id).then(() => hydrate())
      } else {
        // No session — sign in anonymously for zero-friction UX
        supabase.auth.signInAnonymously().then(({ error }) => {
          if (error) {
            console.error('Anonymous sign-in failed:', error)
          }
          // onAuthStateChange will handle the rest
        })
      }

      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s)
        setUser(s?.user ?? null)

        if (s?.user) {
          await migrateLocalStorage(s.user.id)
          await hydrate()
        }

        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [hydrate])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
