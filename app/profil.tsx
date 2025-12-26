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

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // Menu animations
  const menuScales = useRef(Array(6).fill(0).map(() => new Animated.Value(1))).current;

  const animateEntrance = useCallback(() => {
    // Reset semua animasi
    fadeAnim.setValue(0);
    slideAnim.setValue(20);

    // Main entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log('🔄 Fetching profile...');
      const token = await AsyncStorage.getItem('auth_token');
      console.log('🔑 Token exists:', !!token);
      
      if (!token) {
        console.log('❌ No token found');
        setLoading(false);
        Alert.alert('Belum Login', 'Silakan login terlebih dahulu.', [
          { text: 'OK', onPress: () => router.replace('/login') },
        ]);
        return;
      }

      console.log('📡 Calling getProfile API...');
      const profileData = await getProfile(token);
      console.log('✅ Profile API Response:', profileData);

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
        created_at: `Member sejak ${joinDate}`,
      });
    } catch (error: any) {
      console.error('❌ Profil error:', error.message || error);
      console.error('❌ Full error:', error);
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
      animateEntrance();
      fetchProfile();
    }, 1000);
  }, [animateEntrance]);

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
    console.log('🎯 ProfilScreen mounted');
    
    fetchProfile();

    // Start animations with delay
    const timer = setTimeout(() => {
      animateEntrance();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log('👁️ ProfilScreen focused, refreshing...');
      fetchProfile();
    }, [])
  );

  // Statistik user
  const userStats = [
    { 
      label: 'Diskusi', 
      value: '24',
      icon: 'chatbubbles-outline' as const,
      color: '#EF4444'
    },
    { 
      label: 'Jawaban', 
      value: '18',
      icon: 'checkmark-circle-outline' as const,
      color: '#10B981'
    },
    { 
      label: 'Membantu', 
      value: '32',
      icon: 'heart-outline' as const,
      color: '#3B82F6'
    },
  ];

  // Menu items dengan background PUTIH
  const menuItems = [
    { 
      id: 1,
      icon: 'person-outline' as const, 
      label: 'Edit Profil',
      iconColor: '#10B981',
      action: () => router.push('/edit-profil')
    },
    { 
      id: 2,
      icon: 'notifications-outline' as const, 
      label: 'Notifikasi',
      iconColor: '#3B82F6',
      action: () => router.push('/notifikasi')
    },
    { 
      id: 3,
      icon: 'lock-closed-outline' as const, 
      label: 'Privasi & Keamanan',
      iconColor: '#8B5CF6',
      action: () => router.push('/privasi')
    },
    { 
      id: 4,
      icon: 'help-circle-outline' as const, 
      label: 'Bantuan',
      iconColor: '#F59E0B',
      action: () => router.push('/bantuan')
    },
    { 
      id: 5,
      icon: 'information-circle-outline' as const, 
      label: 'Tentang Aplikasi',
      iconColor: '#059669',
      action: () => router.push('/tentang')
    },
    { 
      id: 6,
      icon: 'log-out-outline' as const, 
      label: 'Keluar',
      iconColor: '#EF4444',
      action: () => handleLogout()
    },
  ];

  const handleMenuPress = (index: number, action: () => void) => {
    const scaleValue = menuScales[index];
    
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.98,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 350,
        friction: 8,
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
          <Ionicons name="alert-circle-outline" size={60} color="#6B7280" />
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
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
          />
        }
      >
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            
            {/* Logo dan Title di samping kiri */}
            <View style={styles.headerLeft}>
              <View style={styles.logoCircle}>
                <Ionicons name="person" size={20} color="#10B981" />
              </View>
              <Text style={styles.headerTitle}>Profil Saya</Text>
            </View>
            
            {/* Empty view untuk balance layout */}
            <View style={styles.emptySpace} />
          </View>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View
          style={[
            styles.profileCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.profileGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileContent}>
              {/* Avatar */}
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
                      <Ionicons name="person-outline" size={14} color="rgba(255, 255, 255, 0.9)" />
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
        </Animated.View>

        {/* Stats Section */}
        <Animated.View
          style={[
            styles.statsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.statsTitle}>Aktivitas Saya</Text>
          
          <View style={styles.statsContainer}>
            {userStats.map((stat) => (
              <View key={stat.label} style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                  <Ionicons name={stat.icon} size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Menu Section - BACKGROUND PUTIH */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Pengaturan</Text>
          
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
                    <View style={[styles.menuIcon, { backgroundColor: item.iconColor + '15' }]}>
                      <Ionicons name={item.icon} size={22} color={item.iconColor} />
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

        {/* Spacer untuk menghindari nabrak navbar */}
        <View style={{ height: Platform.OS === 'ios' ? 80 : 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    paddingTop: Platform.OS === 'ios' ? 44 : 30, // Padding untuk notif bar
    paddingBottom: 20, // Padding untuk navbar
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  emptySpace: {
    width: 40, // Space untuk balance layout
  },
  profileCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  profileGradient: {
    padding: 20,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 6,
    fontWeight: '500',
  },
  memberSince: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detailText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  statsSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
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
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30, // Extra padding untuk navbar
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