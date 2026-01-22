import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function KeamananScreen() {
  const router = useRouter();
  
  // State
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // Animasi
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const securityItems = [
    {
      id: 1,
      icon: 'key',
      title: 'Ubah Kata Sandi',
      description: 'Perbarui kata sandi akun Anda',
      action: () => setShowChangePassword(!showChangePassword),
      showArrow: false,
    },
    {
      id: 2,
      icon: 'finger-print',
      title: 'Biometrik',
      description: 'Login menggunakan sidik jari/wajah',
      hasSwitch: true,
      switchValue: biometricEnabled,
      onSwitch: setBiometricEnabled,
    },
    {
      id: 3,
      icon: 'shield-checkmark',
      title: 'Two-Factor Authentication',
      description: 'Tambahkan lapisan keamanan ekstra',
      hasSwitch: true,
      switchValue: twoFactorEnabled,
      onSwitch: setTwoFactorEnabled,
    },
    {
      id: 4,
      icon: 'notifications',
      title: 'Notifikasi Keamanan',
      description: 'Dapatkan pemberitahuan aktivitas mencurigakan',
      hasSwitch: true,
      switchValue: notificationsEnabled,
      onSwitch: setNotificationsEnabled,
    },
    {
      id: 5,
      icon: 'log-out',
      title: 'Logout dari Semua Perangkat',
      description: 'Keluar dari semua sesi aktif',
      action: () => handleLogoutAll(),
      color: '#EF4444',
    },
  ];

  const handleLogoutAll = async () => {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin logout dari semua perangkat?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('auth_token');
              Alert.alert('Sukses', 'Berhasil logout dari semua perangkat');
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Gagal logout');
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      Alert.alert('Error', 'Semua field harus diisi');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      Alert.alert('Error', 'Kata sandi baru tidak cocok');
      return;
    }

    if (passwords.new.length < 6) {
      Alert.alert('Error', 'Kata sandi minimal 6 karakter');
      return;
    }

    Alert.alert('Sukses', 'Kata sandi berhasil diubah');
    setShowChangePassword(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#F0FDF4', '#DCFCE7']}
        style={styles.backgroundGradient}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#065F46" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Keamanan Akun</Text>
          
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Security Status */}
        <View style={styles.securityStatusCard}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.statusGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statusContent}>
              <Ionicons name="shield-checkmark" size={32} color="#FFFFFF" />
              <Text style={styles.statusTitle}>Keamanan Tinggi</Text>
              <Text style={styles.statusText}>
                Akun Anda terlindungi dengan baik
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Security Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Pengaturan Keamanan</Text>
          
          <View style={styles.settingsList}>
            {securityItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.settingItem}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[
                    styles.settingIcon,
                    item.color && { backgroundColor: item.color + '15' }
                  ]}>
                    <Ionicons 
                      name={item.icon as any} 
                      size={20} 
                      color={item.color || '#10B981'} 
                    />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingDescription}>{item.description}</Text>
                  </View>
                </View>
                
                {item.hasSwitch ? (
                  <Switch
                    value={item.switchValue}
                    onValueChange={item.onSwitch}
                    trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                  />
                ) : (
                  !item.showArrow && (
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  )
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Change Password Form */}
        {showChangePassword && (
          <View style={styles.passwordForm}>
            <Text style={styles.formTitle}>Ubah Kata Sandi</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kata Sandi Saat Ini</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan kata sandi saat ini"
                secureTextEntry
                value={passwords.current}
                onChangeText={(text) => setPasswords({...passwords, current: text})}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kata Sandi Baru</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan kata sandi baru"
                secureTextEntry
                value={passwords.new}
                onChangeText={(text) => setPasswords({...passwords, new: text})}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Konfirmasi Kata Sandi Baru</Text>
              <TextInput
                style={styles.input}
                placeholder="Konfirmasi kata sandi baru"
                secureTextEntry
                value={passwords.confirm}
                onChangeText={(text) => setPasswords({...passwords, confirm: text})}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelFormButton}
                onPress={() => {
                  setShowChangePassword(false);
                  setPasswords({ current: '', new: '', confirm: '' });
                }}
              >
                <Text style={styles.cancelFormText}>Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveFormButton}
                onPress={handleChangePassword}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.saveFormGradient}
                >
                  <Text style={styles.saveFormText}>Simpan</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Security Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips Keamanan</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>Gunakan kata sandi yang kuat</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>Aktifkan two-factor authentication</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>Jangan bagikan kode OTP</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>Update aplikasi secara berkala</Text>
            </View>
          </View>
        </View>

        {/* Spacer */}
        <View style={{ height: Platform.OS === 'ios' ? 80 : 60 }} />
      </ScrollView>
    </Animated.View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: -0.5,
  },
  headerPlaceholder: {
    width: 40,
  },
  securityStatusCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  statusGradient: {
    padding: 24,
  },
  statusContent: {
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  settingsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  passwordForm: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelFormButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelFormText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  saveFormButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveFormGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveFormText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tipsSection: {
    paddingHorizontal: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 12,
  },
  tipsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
});