"use client"

import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { authApi } from "../api/auth"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  profileImage?: string
  isAdmin: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>
  adminLogin: (email: string, password: string, adminCode: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user")
        const token = await AsyncStorage.getItem("token")

        if (userJson && token) {
          setUser(JSON.parse(userJson))
        }
      } catch (error) {
        console.error("Failed to load user from storage", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password)

      await AsyncStorage.setItem("token", response.token)
      await AsyncStorage.setItem("user", JSON.stringify(response.user))

      setUser(response.user)
    } catch (error) {
      console.error("Login failed", error)
      throw error
    }
  }

  const signup = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const response = await authApi.signup(name, email, password, phone)

      await AsyncStorage.setItem("token", response.token)
      await AsyncStorage.setItem("user", JSON.stringify(response.user))

      setUser(response.user)
    } catch (error) {
      console.error("Signup failed", error)
      throw error
    }
  }

  const adminLogin = async (email: string, password: string, adminCode: string) => {
    try {
      const response = await authApi.adminLogin(email, password, adminCode)

      await AsyncStorage.setItem("token", response.token)
      await AsyncStorage.setItem("user", JSON.stringify(response.user))

      setUser(response.user)
    } catch (error) {
      console.error("Admin login failed", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token")
      await AsyncStorage.removeItem("user")
      setUser(null)
    } catch (error) {
      console.error("Logout failed", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.isAdmin || false,
        login,
        signup,
        adminLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

