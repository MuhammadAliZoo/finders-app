"use client"

import { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "../api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user")
        const token = await AsyncStorage.getItem("token")

        if (storedUser && token) {
          setUser(JSON.parse(storedUser))

          // Verify token is still valid
          try {
            await api.get("/auth/me")
          } catch (error) {
            // Token is invalid, log out
            await logout()
          }
        }
      } catch (error) {
        console.error("Error loading user from storage", error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.post("/auth/register", userData)

      await AsyncStorage.setItem("token", response.data.token)
      await AsyncStorage.setItem("user", JSON.stringify(response.data))

      setUser(response.data)
      return response.data
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.post("/auth/login", { email, password })

      await AsyncStorage.setItem("token", response.data.token)
      await AsyncStorage.setItem("user", JSON.stringify(response.data))

      setUser(response.data)
      return response.data
    } catch (error) {
      setError(error.response?.data?.message || "Login failed")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const adminLogin = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.post("/auth/admin/login", { email, password })

      if (!response.data.isAdmin) {
        throw new Error("Not authorized as admin")
      }

      await AsyncStorage.setItem("token", response.data.token)
      await AsyncStorage.setItem("user", JSON.stringify(response.data))

      setUser(response.data)
      return response.data
    } catch (error) {
      setError(error.response?.data?.message || "Admin login failed")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)

      await AsyncStorage.removeItem("token")
      await AsyncStorage.removeItem("user")

      setUser(null)
    } catch (error) {
      console.error("Error during logout", error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (userData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.put("/auth/profile", userData)

      await AsyncStorage.setItem("user", JSON.stringify(response.data))

      setUser(response.data)
      return response.data
    } catch (error) {
      setError(error.response?.data?.message || "Profile update failed")
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        adminLogin,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext

