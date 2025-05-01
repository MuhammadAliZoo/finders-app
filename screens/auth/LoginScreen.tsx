'use client';

import React, { useState, useEffect } from 'react';
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
  ImageSourcePropType,
  Button,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { signIn } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showForgotPasswordAlert, setShowForgotPasswordAlert] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  useEffect(() => {
    // Load saved credentials if remember me was enabled
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('rememberedEmail');
      const savedPassword = await AsyncStorage.getItem('rememberedPassword');
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  };

  const validateInput = (): boolean => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signIn(email, password);
      // Optionally navigate to home or main screen
      // navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      // TODO: Implement password reset functionality
      Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      let errorMessage = 'Failed to send password reset email';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      Alert.alert('Error', errorMessage);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate('Signup');
  };

  const navigateToAdminLogin = () => {
    navigation.navigate('AdminLogin');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: colors.secondary }]}>
            Sign in to continue to your account
          </Text>

          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          {showForgotPasswordAlert && (
            <View style={[styles.alertContainer, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.alertText, { color: colors.primary }]}>
                Password reset functionality coming soon!
              </Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.secondary}
                style={styles.inputIcon}
              />
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
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.secondary}
                style={styles.inputIcon}
              />
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
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.rememberMeContainer}>
            <TouchableOpacity
              style={styles.rememberMeCheckbox}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <Ionicons
                name={rememberMe ? 'checkbox' : 'square-outline'}
                size={24}
                color={rememberMe ? colors.primary : colors.secondary}
              />
              <Text style={[styles.rememberMeText, { color: colors.text }]}>Remember me</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
              Forgot Password?
            </Text>
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
            <Text style={[styles.signupText, { color: colors.secondary }]}>
              Don't have an account?
            </Text>
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
  );
};

const styles = StyleSheet.create({
  adminLoginButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
  },
  adminLoginText: {
    fontSize: 14,
  },
  alertContainer: {
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  alertText: {
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  createTestUserButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    marginBottom: 24,
  },
  createTestUserText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  errorText: {
    fontSize: 14,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  inputContainer: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  loginButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logo: {
    height: 100,
    marginBottom: 16,
    width: 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  rememberMeCheckbox: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  rememberMeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  rememberMeText: {
    fontSize: 14,
    marginLeft: 8,
  },
  signupContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  signupText: {
    fontSize: 14,
    marginRight: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default LoginScreen;
