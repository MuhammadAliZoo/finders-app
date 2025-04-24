"use client"

import { useState } from "react"
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
import { RootStackParamList } from "../../navigation/types"
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import { User } from "../../types/user"

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

const SignupScreen = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>()
  const { colors } = useTheme()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setError("")
    setLoading(true)

    try {
      // Create user account
      const userCredential = await auth().createUserWithEmailAndPassword(email, password)
      const user = userCredential.user

      // Update user profile
      await user.updateProfile({
        displayName: name
      })

      // Create user document in Firestore
      const userData: User = {
        id: user.uid,
        email,
        displayName: name,
        phoneNumber: phone || null,
        photoURL: null,
        createdAt: new Date(),
        lastSeen: new Date(),
        status: 'online',
      }

      await firestore().collection('users').doc(user.uid).set(userData)

      Alert.alert('Success', 'Account created successfully!')
      navigation.navigate('Home')
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email address is already in use')
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address')
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak')
      } else {
        setError(err.message || "Failed to sign up. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const navigateToLogin = () => {
    navigation.navigate("Auth")
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
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.secondary }]}>
            Sign up to start finding and returning lost items
          </Text>

          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + "20" }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="person-outline" size={20} color={colors.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.secondary}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

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
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Phone (Optional)</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="call-outline" size={20} color={colors.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.secondary}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Create a password"
                placeholderTextColor={colors.secondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Confirm Password</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirm your password"
                placeholderTextColor={colors.secondary}
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.signupButton, { backgroundColor: colors.primary }]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.signupButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.secondary }]}>OR</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card }]}>
              <Ionicons name="logo-google" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card }]}>
              <Ionicons name="logo-apple" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card }]}>
              <Ionicons name="logo-facebook" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.secondary }]}>Already have an account?</Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.termsText, { color: colors.secondary }]}>
            By signing up, you agree to our <Text style={{ color: colors.primary }}>Terms of Service</Text> and{" "}
            <Text style={{ color: colors.primary }}>Privacy Policy</Text>
          </Text>
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
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
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
  signupButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  loginText: {
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  termsText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
})

export default SignupScreen

