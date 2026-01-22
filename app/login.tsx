import { loginUser } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const { height, width } = Dimensions.get('window');

type ButtonProps = {
  onPress?: () => void;
  onClick?: () => void;
  role?: 'button' | 'link' | 'none';
  tabIndex?: number;
  onKeyPress?: (e: any) => void;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'link' | 'none';
  disabled?: boolean;
  activeOpacity?: number;
  style?: any;
  hitSlop?: any;
  children?: React.ReactNode;
};

export default function LoginScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // Handler untuk web & mobile
  const getButtonProps = (callback: () => void): ButtonProps => {
    if (Platform.OS === 'web') {
      return {
        onClick: callback,
        onPress: undefined,
        role: 'button' as const,
        tabIndex: 0,
        onKeyPress: (e: any) => {
          if (e.key === 'Enter' || e.key === ' ') {
            callback();
          }
        },
      };
    }
    return {
      onPress: callback,
    };
  };

  const handleLoginPress = () => {
    console.log('🎯 Login button pressed');
    handleLogin();
  };

  const handleLogin = async () => {
    console.log('🚀 Starting login process...');
    
    // Validation
    if (!formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Error', 'Harap isi email dan password');
      return;
    }
    
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      Alert.alert('Error', 'Format email tidak valid');
      return;
    }

    setLoading(true);
    console.log('📡 Sending login request...');
    
    try {
      const data = await loginUser({
        email: formData.email.trim(),
        password: formData.password.trim(),
      });

      console.log('✅ Login response:', data);

      if (data.success && data.token) {
        console.log('🔐 Token received, saving...');
        await AsyncStorage.setItem('auth_token', data.token);
        
        // Delay kecil untuk visual feedback
        setTimeout(() => {
          console.log('🔄 Navigating to dashboard...');
          router.replace('/dashboard');
        }, 500);
        
      } else {
        const errorMsg = data.error || data.message || 'Login gagal';
        console.log('❌ Login failed:', errorMsg);
        Alert.alert('Error', errorMsg);
      }
    } catch (error: any) {
      console.error('🔥 Login error:', error);
      Alert.alert('Error', error.message || 'Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Lupa Password',
      'Fitur reset password sedang dalam pengembangan. Silakan hubungi admin untuk bantuan.',
      [{ text: 'OK' }]
    );
  };

  const focusPassword = () => {
    passwordInputRef.current?.focus();
  };

  const handleEmailSubmit = () => {
    focusPassword();
  };

  const handlePasswordSubmit = () => {
    if (!loading) {
      handleLogin();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#F0FDF4', '#D1FAE5', '#A7F3D0']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Floating Orbs */}
      <View style={styles.orbContainer}>
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
        <View style={[styles.orb, styles.orb3]} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.mainContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
                {...(Platform.OS === 'web' ? {
                  onClick: () => router.back(),
                  role: 'button' as const,
                  tabIndex: 0,
                } : {})}
              >
                <Ionicons name="chevron-back" size={24} color="#065F46" />
              </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.contentArea}>
              {/* Welcome Section */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>
                  Selamat Datang Kembali
                </Text>
                <Text style={styles.welcomeSubtitle}>
                  Masuk untuk melanjutkan perjalanan kesehatan Anda
                </Text>
              </View>

              {/* Login Form Card */}
              <View style={styles.formCardContainer}>
                {/* Blur/Glass Effect */}
                <View style={styles.formBlur} />
                
                <View style={styles.formCard}>
                  <View style={styles.formContent}>
                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Email</Text>
                      <TouchableOpacity 
                        style={[
                          styles.inputContainer,
                          emailFocused && styles.inputFocused,
                        ]}
                        activeOpacity={1}
                        onPress={() => emailInputRef.current?.focus()}
                        {...(Platform.OS === 'web' ? {
                          onClick: () => emailInputRef.current?.focus(),
                          role: 'button' as const,
                          tabIndex: 0,
                        } : {})}
                      >
                        <Ionicons
                          name="mail-outline"
                          size={22}
                          color={emailFocused ? '#10B981' : '#059669'}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          ref={emailInputRef}
                          style={styles.input}
                          placeholder="email@contoh.com"
                          placeholderTextColor="#94A3B8"
                          value={formData.email}
                          onChangeText={(text) =>
                            setFormData({ ...formData, email: text })
                          }
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          onFocus={() => setEmailFocused(true)}
                          onBlur={() => setEmailFocused(false)}
                          editable={!loading}
                          returnKeyType="next"
                          blurOnSubmit={false}
                          onSubmitEditing={handleEmailSubmit}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Password</Text>
                      <TouchableOpacity 
                        style={[
                          styles.inputContainer,
                          passwordFocused && styles.inputFocused,
                        ]}
                        activeOpacity={1}
                        onPress={() => passwordInputRef.current?.focus()}
                        {...(Platform.OS === 'web' ? {
                          onClick: () => passwordInputRef.current?.focus(),
                          role: 'button' as const,
                          tabIndex: 0,
                        } : {})}
                      >
                        <Ionicons
                          name="lock-closed-outline"
                          size={22}
                          color={passwordFocused ? '#10B981' : '#059669'}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          ref={passwordInputRef}
                          style={styles.input}
                          placeholder="Masukkan password"
                          placeholderTextColor="#94A3B8"
                          value={formData.password}
                          onChangeText={(text) =>
                            setFormData({ ...formData, password: text })
                          }
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => setPasswordFocused(false)}
                          editable={!loading}
                          onSubmitEditing={handlePasswordSubmit}
                          returnKeyType="done"
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          disabled={loading}
                          style={styles.eyeButton}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          {...(Platform.OS === 'web' ? {
                            onClick: () => setShowPassword(!showPassword),
                            role: 'button' as const,
                            tabIndex: 0,
                          } : {})}
                        >
                          <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={22}
                            color="#059669"
                          />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </View>

                    {/* Forgot Password */}
                    <TouchableOpacity 
                      style={styles.forgotButton} 
                      disabled={loading}
                      onPress={handleForgotPassword}
                      {...(Platform.OS === 'web' ? {
                        onClick: handleForgotPassword,
                        role: 'button' as const,
                        tabIndex: 0,
                      } : {})}
                    >
                      <Text style={styles.forgotText}>Lupa password?</Text>
                    </TouchableOpacity>

                    {/* Login Button - FIXED FOR WEB */}
                    <TouchableOpacity
                      style={[styles.loginButton, loading && styles.buttonDisabled]}
                      disabled={loading}
                      activeOpacity={0.8}
                      onPress={handleLoginPress}
                      {...(Platform.OS === 'web' ? {
                        onClick: handleLoginPress,
                        role: 'button' as const,
                        tabIndex: 0,
                      } : {})}
                    >
                      <LinearGradient
                        colors={['#10B981', '#059669', '#047857']}
                        style={styles.loginButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Ionicons name="log-in" size={20} color="#FFFFFF" />
                        )}
                        <Text style={styles.loginButtonText}>
                          {loading ? 'Memproses...' : 'Masuk'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Register Link */}
                    <View style={styles.registerRow}>
                      <Text style={styles.registerText}>Belum punya akun? </Text>
                      <TouchableOpacity
                        disabled={loading}
                        onPress={() => router.push('/register')}
                        {...(Platform.OS === 'web' ? {
                          onClick: () => router.push('/register'),
                          role: 'button' as const,
                          tabIndex: 0,
                        } : {})}
                      >
                        <Text style={styles.registerLink}>Daftar Sekarang</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  orbContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.05,
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: '#10B981',
    top: '20%',
    left: -100,
  },
  orb2: {
    width: 250,
    height: 250,
    backgroundColor: '#059669',
    bottom: '30%',
    right: -80,
  },
  orb3: {
    width: 200,
    height: 200,
    backgroundColor: '#34D399',
    top: '60%',
    left: '60%',
    opacity: 0.04,
  },
  keyboardView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    height: 80,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#059669',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formCardContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },
  formBlur: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    ...(Platform.OS === 'web' ? {
      // @ts-ignore - Web-only property
      backdropFilter: 'blur(10px)',
    } : {}),
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 24,
  },
  formContent: {
    // Konten form
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: '#10B981',
    backgroundColor: '#FFFFFF',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#065F46',
    fontWeight: '500',
    paddingVertical: 0,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#059669',
    fontSize: 14,
  },
  registerLink: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '700',
  },
});