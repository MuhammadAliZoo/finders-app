import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token")
    console.log("Debug - Token from storage:", token ? "Token exists" : "No token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log("Debug - Added Authorization header")
    }
    return config
  },
  (error) => {
    console.error("Debug - Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Here you would typically refresh the token
        // For now, just redirect to login
        await AsyncStorage.removeItem("token")
        await AsyncStorage.removeItem("user")

        // This will be handled by the auth context to redirect to login
        return Promise.reject(error)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default api

