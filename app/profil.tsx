import { getProfile, logoutUser } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function ProfilScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    gender?: string | null;
    phone?: string | null;
    created_at: string;
  } | null>(null);

  // Animasi sederhana
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Animasi untuk menu items (tanpa bergerak berlebihan)
  const menuScales = useRef(Array(5).fill(0).map(() => new Animated.Value(1))).current;

  const animateEntrance = useCallback(() => {
    // Reset animasi
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.95);

    // Animasi masuk sederhana
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      
      if (!token) {
        setLoading(false);
        Alert.alert('Belum Login', 'Silakan login terlebih dahulu.', [
          { text: 'OK', onPress: () => router.replace('/login') },
        ]);
        return;
      }

      const profileData = await getProfile(token);

      // Format tanggal join
      const joinDate = new Date(profileData.created_at).toLocaleDateString('id-ID', {
        month: 'short',
        year: 'numeric',
      });

      setUser({
        name: profileData.name || 'User',
        email: profileData.email || '',
        gender: profileData.gender,
        phone: profileData.phone,
        created_at: `Bergabung ${joinDate}`,
      });
    } catch (error: any) {
      console.error('❌ Profil error:', error.message || error);
      Alert.alert('Error', 'Gagal memuat profil. Silakan login ulang.');
      await AsyncStorage.removeItem('auth_token');
      router.replace('/login');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      fetchProfile();
    }, 1000);
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('auth_token');
              if (token) {
                await logoutUser(token);
              }
              await AsyncStorage.removeItem('auth_token');
              router.replace('/login');
            } catch (error) {
              console.error('Logout gagal:', error);
              Alert.alert('Error', 'Gagal logout. Coba lagi.');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchProfile();
    const timer = setTimeout(() => {
      animateEntrance();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  // Data statistik user
  const userStats = [
    { 
      label: 'Diskusi', 
      value: '12',
      icon: 'chatbubbles' as const,
      color: '#10B981',
      bgColor: '#D1FAE5'
    },
    { 
      label: 'Jawaban', 
      value: '8',
      icon: 'checkmark-circle' as const,
      color: '#3B82F6',
      bgColor: '#DBEAFE'
    },
    { 
      label: 'Aktif', 
      value: '24',
      icon: 'time' as const,
      color: '#8B5CF6',
      bgColor: '#EDE9FE'
    },
  ];

  // Menu items
  const menuItems = [
    { 
      id: 1,
      icon: 'person' as const, 
      label: 'Edit Profil',
      color: '#10B981',
      bgColor: '#D1FAE5',
      action: () => router.push('/edit-profil')
    },
    { 
      id: 2,
      icon: 'lock-closed' as const, 
      label: 'Keamanan',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      action: () => router.push('/keamanan')
    },
    { 
      id: 3,
      icon: 'help-circle' as const, 
      label: 'Bantuan',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      action: () => router.push('/bantuan')
    },
    { 
      id: 4,
      icon: 'information-circle' as const, 
      label: 'Tentang',
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
      action: () => router.push('/tentang')
    },
    { 
      id: 5,
      icon: 'log-out' as const, 
      label: 'Keluar',
      color: '#EF4444',
      bgColor: '#FEE2E2',
      action: () => handleLogout()
    },
  ];

  const handleMenuPress = (index: number, action: () => void) => {
    const scaleValue = menuScales[index];
    
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 200,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start(() => {
      action();
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Memuat profil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#6B7280" />
          <Text style={styles.errorText}>Tidak dapat memuat profil</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchProfile}
          >
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#F0FDF4', '#DCFCE7', '#BBF7D0']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
            progressBackgroundColor="rgba(255, 255, 255, 0.8)"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#065F46" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Profil Saya</Text>
          
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/pengaturan')}
          >
            <Ionicons name="settings-outline" size={24} color="#065F46" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.profileGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileContent}>
              {/* Avatar - TIDAK BERGERAK */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={36} color="#10B981" />
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                </View>
              </View>
              
              {/* User Info */}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.memberSince}>{user.created_at}</Text>
                
                {/* User Details */}
                <View style={styles.detailsRow}>
                  {user.phone && (
                    <View style={styles.detailItem}>
                      <Ionicons name="call-outline" size={14} color="rgba(255, 255, 255, 0.9)" />
                      <Text style={styles.detailText}>{user.phone}</Text>
                    </View>
                  )}
                  {user.gender && (
                    <View style={styles.detailItem}>
                      <Ionicons 
                        name={user.gender === 'male' ? 'male' : 'female'} 
                        size={14} 
                        color="rgba(255, 255, 255, 0.9)" 
                      />
                      <Text style={styles.detailText}>
                        {user.gender === 'male' ? 'Laki-laki' : 
                         user.gender === 'female' ? 'Perempuan' : 'Lainnya'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Aktivitas Saya Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aktivitas Saya</Text>
          </View>

          <View style={styles.statsContainer}>
            {userStats.map((stat) => (
              <View key={stat.label} style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
                  <Ionicons name={stat.icon} size={22} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Menu</Text>
          </View>

          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <Animated.View
                key={item.id}
                style={{
                  transform: [{ scale: menuScales[index] }]
                }}
              >
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(index, item.action)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemContent}>
                    <View style={[styles.menuIcon, { backgroundColor: item.bgColor }]}>
                      <Ionicons name={item.icon} size={20} color={item.color} />
                    </View>
                    <Text style={styles.menuItemText}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.appLogo}>
            <Ionicons name="heart" size={24} color="#10B981" />
          </View>
          <Text style={styles.appName}>QHealth</Text>
          <Text style={styles.appVersion}>Versi 1.0.0</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: '#374151',
    fontWeight: '500'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#10B981',
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Profile Card
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  profileGradient: {
    padding: 24,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 6,
    fontWeight: '500',
  },
  memberSince: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 16,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  detailText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },

  // Section Common
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: -0.4,
  },

  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },

  // Menu Section
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },

  // App Info
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  appLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#6B7280',
  },
});