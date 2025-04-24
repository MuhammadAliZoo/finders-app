"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../theme/ThemeContext"
import { useAuth } from "../../context/AuthContext"
import { RootStackParamList } from "../../navigation/types"
import auth from '@react-native-firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>()
  const { colors } = useTheme()
  const { login } = useAuth()

  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [showForgotPasswordAlert, setShowForgotPasswordAlert] = useState<boolean>(false)
  const [rememberMe, setRememberMe] = useState<boolean>(false)

  useEffect(() => {
    // Load saved credentials if remember me was enabled
    loadSavedCredentials()
  }, [])

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('rememberedEmail')
      const savedPassword = await AsyncStorage.getItem('rememberedPassword')
      if (savedEmail && savedPassword) {
        setEmail(savedEmail)
        setPassword(savedPassword)
        setRememberMe(true)
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error)
    }
  }

  const validateInput = (): boolean => {
    if (!email.trim()) {
      setError('Please enter your email')
      return false
    }
    if (!password.trim()) {
      setError('Please enter your password')
      return false
    }
    return true
  }

  const handleLogin = async () => {
    if (!validateInput()) return

    try {
      setLoading(true)
      setError('')
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        await AsyncStorage.setItem('rememberedEmail', email)
        await AsyncStorage.setItem('rememberedPassword', password)
      } else {
        // Clear saved credentials if remember me is unchecked
        await AsyncStorage.removeItem('rememberedEmail')
        await AsyncStorage.removeItem('rememberedPassword')
      }

      const userCredential = await auth().signInWithEmailAndPassword(email.trim(), password.trim())
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email before logging in. Would you like to resend the verification email?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Resend', 
              onPress: async () => {
                try {
                  await userCredential.user.sendEmailVerification();
                  Alert.alert('Verification email sent', 'Please check your inbox');
                } catch (error) {
                  console.error('Error sending verification email:', error);
                  Alert.alert('Error', 'Failed to send verification email. Please try again.');
                }
              }
            }
          ]
        )
        return
      }

      navigation.navigate('Home')
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password')
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.')
      } else if (error.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support.')
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first')
      return
    }

    try {
      setLoading(true)
      await auth().sendPasswordResetEmail(email.trim())
      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email for instructions to reset your password.'
      )
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address')
      } else {
        setError('Failed to send password reset email. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const navigateToSignup = () => {
    navigation.navigate("Signup")
  }

  const navigateToAdminLogin = () => {
    navigation.navigate("AdminLogin")
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: colors.secondary }]}>Sign in to continue to your account</Text>

          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + "20" }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          {showForgotPasswordAlert && (
            <View style={[styles.alertContainer, { backgroundColor: colors.primary + "20" }]}>
              <Text style={[styles.alertText, { color: colors.primary }]}>
                Password reset functionality coming soon!
              </Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="mail-outline" size={20} color={colors.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your email"
                placeholderTextColor={colors.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your password"
                placeholderTextColor={colors.secondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={loading}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.rememberMeContainer}>
            <TouchableOpacity 
              style={styles.rememberMeCheckbox}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <Ionicons 
                name={rememberMe ? "checkbox" : "square-outline"} 
                size={24} 
                color={rememberMe ? colors.primary : colors.secondary} 
              />
              <Text style={[styles.rememberMeText, { color: colors.text }]}>
                Remember me
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: colors.secondary }]}>Don't have an account?</Text>
            <TouchableOpacity onPress={navigateToSignup} disabled={loading}>
              <Text style={[styles.signupLink, { color: colors.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.adminLoginButton, { borderColor: colors.border }]}
            onPress={navigateToAdminLogin}
            disabled={loading}
          >
            <Text style={[styles.adminLoginText, { color: colors.secondary }]}>Admin Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  createTestUserButton: {
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  createTestUserText: {
    fontSize: 14,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  signupText: {
    fontSize: 14,
    marginRight: 4,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  adminLoginButton: {
    borderWidth: 1,
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  adminLoginText: {
    fontSize: 14,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
  alertContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  alertText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rememberMeCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    marginLeft: 8,
    fontSize: 14,
  },
})

export default LoginScreen

