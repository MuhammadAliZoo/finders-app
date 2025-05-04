'use client';

import { useState } from 'react';
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
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';

type AdminLoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminLogin'>;

const AdminLoginScreen = () => {
  const navigation = useNavigation<AdminLoginScreenNavigationProp>();
  const { colors } = useTheme();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async () => {
    if (!email || !password || !adminCode) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      // Navigation will be handled by the AuthContext
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
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
          <Text style={[styles.title, { color: colors.text }]}>Admin Login</Text>
          <Text style={[styles.subtitle, { color: colors.secondary }]}>
            Sign in to access admin dashboard
          </Text>

          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Admin Email</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.secondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter admin email"
                placeholderTextColor={colors.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
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
                placeholder="Enter admin password"
                placeholderTextColor={colors.secondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Admin Access Code</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
              <Ionicons
                name="key-outline"
                size={20}
                color={colors.secondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter admin access code"
                placeholderTextColor={colors.secondary}
                secureTextEntry={!showPassword}
                value={adminCode}
                onChangeText={setAdminCode}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.warning }]}
            onPress={handleAdminLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Admin Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.backButton, { borderColor: colors.border }]}
            onPress={navigateToLogin}
          >
            <Ionicons
              name="arrow-back-outline"
              size={20}
              color={colors.secondary}
              style={styles.backIcon}
            />
            <Text style={[styles.backButtonText, { color: colors.secondary }]}>
              Back to User Login
            </Text>
          </TouchableOpacity>

          <View style={styles.securityNote}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={colors.secondary}
              style={styles.securityIcon}
            />
            <Text style={[styles.securityText, { color: colors.secondary }]}>
              This area is restricted to authorized personnel only. Unauthorized access attempts
              will be logged.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    borderColor: '#38383A',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  backIcon: {
    marginRight: 8,
  },
  container: {
    backgroundColor: '#000000',
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  errorText: {
    color: '#FF453A',
    fontSize: 14,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 16,
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
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
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: '#5DADE2',
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
  securityIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  securityNote: {
    alignItems: 'flex-start',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 16,
  },
  securityText: {
    color: '#8E8E93',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  subtitle: {
    color: '#5DADE2',
    fontSize: 16,
    marginBottom: 32,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default AdminLoginScreen;
