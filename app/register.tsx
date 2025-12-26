import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { height, width } = Dimensions.get('window');

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    const { name, email, password, password_confirmation } = formData;

    if (!name || !email || !password || !password_confirmation) {
      Alert.alert('Error', 'Harap isi semua field');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Format email tidak valid');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }

    if (password !== password_confirmation) {
      Alert.alert('Error', 'Password dan konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://nonabstractly-unmoaning-tameka.ngrok-free.dev/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Berhasil', 'Akun berhasil dibuat!');
        router.replace('/login');
      } else {
        Alert.alert('Error', data.message || data.error || 'Registrasi gagal');
      }
    } catch {
      Alert.alert('Error', 'Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => Keyboard.dismiss();

  const focusEmail = () => emailInputRef.current?.focus();
  const focusPassword = () => passwordInputRef.current?.focus();
  const focusConfirmPassword = () => confirmPasswordInputRef.current?.focus();

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

      {/* Main Content */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.mainContainer}>
            {/* Header back button saja */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={24} color="#065F46" />
              </TouchableOpacity>
            </View>

            {/* CONTENT AREA - TENGAH */}
            <View style={styles.contentArea}>
              {/* Welcome Section - UKURAN LEBIH KECIL */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>
                  Bergabung dengan QHealth
                </Text>
                <Text style={styles.welcomeSubtitle}>
                  Buat akun untuk mulai perjalanan kesehatan Anda
                </Text>
              </View>

              {/* Register Form Card - UKURAN LEBIH KECIL */}
              <View style={styles.formCardContainer}>
                {/* Blur Overlay */}
                <BlurView
                  intensity={Platform.OS === 'ios' ? 80 : 60}
                  tint="light"
                  style={styles.formBlur}
                />
                
                {/* Glass Card Content - PADDING LEBIH KECIL */}
                <View style={styles.formCard}>
                  <View style={styles.formContent}>
                    {/* Name Input - MARGIN LEBIH KECIL */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Nama Lengkap</Text>
                      <TouchableOpacity 
                        style={[
                          styles.inputContainer,
                          nameFocused && styles.inputFocused,
                        ]}
                        activeOpacity={1}
                        onPress={() => nameInputRef.current?.focus()}
                      >
                        <Ionicons
                          name="person-outline"
                          size={20} // UKURAN LEBIH KECIL
                          color={nameFocused ? '#10B981' : '#059669'}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          ref={nameInputRef}
                          style={styles.input}
                          placeholder="Masukkan nama lengkap"
                          placeholderTextColor="#94A3B8"
                          value={formData.name}
                          onChangeText={(text) =>
                            setFormData({ ...formData, name: text })
                          }
                          autoCapitalize="words"
                          autoCorrect={false}
                          onFocus={() => setNameFocused(true)}
                          onBlur={() => setNameFocused(false)}
                          editable={!loading}
                          returnKeyType="next"
                          blurOnSubmit={false}
                          onSubmitEditing={focusEmail}
                        />
                      </TouchableOpacity>
                    </View>

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
                      >
                        <Ionicons
                          name="mail-outline"
                          size={20}
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
                          onSubmitEditing={focusPassword}
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
                      >
                        <Ionicons
                          name="lock-closed-outline"
                          size={20}
                          color={passwordFocused ? '#10B981' : '#059669'}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          ref={passwordInputRef}
                          style={styles.input}
                          placeholder="Minimal 6 karakter"
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
                          returnKeyType="next"
                          blurOnSubmit={false}
                          onSubmitEditing={focusConfirmPassword}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          disabled={loading}
                          style={styles.eyeButton}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="#059669"
                          />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Konfirmasi Password</Text>
                      <TouchableOpacity 
                        style={[
                          styles.inputContainer,
                          confirmPasswordFocused && styles.inputFocused,
                        ]}
                        activeOpacity={1}
                        onPress={() => confirmPasswordInputRef.current?.focus()}
                      >
                        <Ionicons
                          name="lock-closed-outline"
                          size={20}
                          color={confirmPasswordFocused ? '#10B981' : '#059669'}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          ref={confirmPasswordInputRef}
                          style={styles.input}
                          placeholder="Ulangi password"
                          placeholderTextColor="#94A3B8"
                          value={formData.password_confirmation}
                          onChangeText={(text) =>
                            setFormData({ ...formData, password_confirmation: text })
                          }
                          secureTextEntry={!showConfirmPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          onFocus={() => setConfirmPasswordFocused(true)}
                          onBlur={() => setConfirmPasswordFocused(false)}
                          editable={!loading}
                          returnKeyType="done"
                          onSubmitEditing={handleRegister}
                        />
                        <TouchableOpacity
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={loading}
                          style={styles.eyeButton}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="#059669"
                          />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                      style={[styles.registerButton, loading && styles.buttonDisabled]}
                      onPress={handleRegister}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#10B981', '#059669', '#047857']}
                        style={styles.registerButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        {loading ? (
                          <Ionicons name="refresh" size={18} color="#FFFFFF" />
                        ) : (
                          <Ionicons name="person-add" size={18} color="#FFFFFF" />
                        )}
                        <Text style={styles.registerButtonText}>
                          {loading ? 'Memproses...' : 'Daftar Sekarang'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.loginRow}>
                      <Text style={styles.loginText}>Sudah punya akun? </Text>
                      <TouchableOpacity
                        onPress={() => router.push('/login')}
                        disabled={loading}
                      >
                        <Text style={styles.loginLink}>Masuk</Text>
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
    ...StyleSheet.absoluteFillObject,
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
    width: 250,
    height: 250,
    backgroundColor: '#10B981',
    top: '10%',
    left: -80,
  },
  orb2: {
    width: 200,
    height: 200,
    backgroundColor: '#059669',
    bottom: '20%',
    right: -60,
  },
  orb3: {
    width: 180,
    height: 180,
    backgroundColor: '#34D399',
    top: '70%',
    left: '65%',
    opacity: 0.04,
  },
  keyboardView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 40 : 25,
    paddingHorizontal: 20,
    height: 70,
    justifyContent: 'center',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // AREA UTAMA YANG PASTI DI TENGAH
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10, // KURANGI PADDING ATAS
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 28, // KURANGI MARGIN
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 26, // LEBIH KECIL
    fontWeight: '800', // KURANGI KETEBALAN
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 6, // KURANGI MARGIN
  },
  welcomeSubtitle: {
    fontSize: 14, // LEBIH KECIL
    fontWeight: '400',
    color: '#059669',
    textAlign: 'center',
    lineHeight: 20, // KURANGI LINE HEIGHT
    paddingHorizontal: 24,
  },
  // CONTAINER CARD LEBIH KECIL
  formCardContainer: {
    width: '100%',
    maxWidth: 380, // LEBIH KECIL
    borderRadius: 20, // LEBIH KECIL
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  formBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  formCard: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.85)',
    padding: 20, // PADDING LEBIH KECIL
  },
  formContent: {
    // Konten form
  },
  inputGroup: {
    marginBottom: 16, // KURANGI MARGIN
  },
  label: {
    fontSize: 14, // LEBIH KECIL
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 6, // KURANGI MARGIN
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 12, // LEBIH KECIL
    height: 50, // LEBIH PENDEK
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: '#10B981',
    backgroundColor: '#FFFFFF',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15, // LEBIH KECIL
    color: '#065F46',
    fontWeight: '500',
    paddingVertical: 0,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 6,
  },
  registerButton: {
    borderRadius: 12, // LEBIH KECIL
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 4,
    marginBottom: 20,
  },
  registerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14, // LEBIH PENDEK
    paddingHorizontal: 22,
    gap: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16, // LEBIH KECIL
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#059669',
    fontSize: 13, // LEBIH KECIL
  },
  loginLink: {
    color: '#10B981',
    fontSize: 13, // LEBIH KECIL
    fontWeight: '700',
  },
});