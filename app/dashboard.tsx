import AIChatModal from '@/components/AIChatModal';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // ============================
  // FLOATING AI BUTTON - SMOOTH GLOW (NO ROTATION)
  // ============================
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabGlow = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Gentle glow effect ONLY - NO ROTATION
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabGlow, {
          toValue: 1,
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
        Animated.timing(fabGlow, {
          toValue: 0.8,
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fabGlow]);

  const onPressAI = useCallback(() => {
    // Smooth press animation - NO ROTATION
    Animated.sequence([
      Animated.spring(fabScale, {
        toValue: 0.85,
        tension: 200,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        tension: 150,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAiModalVisible(true);
    });
  }, [fabScale]);

  const closeAIModal = useCallback(() => {
    setAiModalVisible(false);
  }, []);

  // Animations untuk staggered entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Staggered animations untuk tiap section
  const sectionsAnim = useRef({
    header: { opacity: new Animated.Value(0), translateY: new Animated.Value(-30) },
    hero: { opacity: new Animated.Value(0), translateY: new Animated.Value(40) },
    menu: { opacity: new Animated.Value(0), translateY: new Animated.Value(40) },
    tips: { opacity: new Animated.Value(0), translateY: new Animated.Value(40) },
    quick: { opacity: new Animated.Value(0), translateY: new Animated.Value(40) },
  }).current;

  const animateEntrance = useCallback(() => {
    // Reset semua animasi
    fadeAnim.setValue(0);
    Object.values(sectionsAnim).forEach(section => {
      section.opacity.setValue(0);
      section.translateY.setValue(40);
    });

    // Main fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();

    // Staggered sections entrance
    Animated.stagger(120, [
      // Header
      Animated.parallel([
        Animated.timing(sectionsAnim.header.opacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(sectionsAnim.header.translateY, {
          toValue: 0,
          tension: 60,
          friction: 12,
          useNativeDriver: true,
        }),
      ]),
      // Hero
      Animated.parallel([
        Animated.timing(sectionsAnim.hero.opacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(sectionsAnim.hero.translateY, {
          toValue: 0,
          tension: 60,
          friction: 12,
          useNativeDriver: true,
        }),
      ]),
      // Menu
      Animated.parallel([
        Animated.timing(sectionsAnim.menu.opacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(sectionsAnim.menu.translateY, {
          toValue: 0,
          tension: 60,
          friction: 12,
          useNativeDriver: true,
        }),
      ]),
      // Tips
      Animated.parallel([
        Animated.timing(sectionsAnim.tips.opacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(sectionsAnim.tips.translateY, {
          toValue: 0,
          tension: 60,
          friction: 12,
          useNativeDriver: true,
        }),
      ]),
      // Quick Actions
      Animated.parallel([
        Animated.timing(sectionsAnim.quick.opacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(sectionsAnim.quick.translateY, {
          toValue: 0,
          tension: 60,
          friction: 12,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeAnim, sectionsAnim]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('☀️ Selamat Pagi');
    else if (hour < 18) setGreeting('🌤️ Selamat Siang');
    else setGreeting('🌙 Selamat Malam');

    const timer = setTimeout(() => {
      animateEntrance();
    }, 300);

    return () => clearTimeout(timer);
  }, [animateEntrance]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      animateEntrance();
    }, 1200);
  }, [animateEntrance]);

  // Auto rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % healthTips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const navigateToScreen = (route: string) => {
    router.push(route as any);
  };

  const menuItems = [
    {
      id: 1,
      title: 'Forum Diskusi',
      icon: 'chatbubbles' as const,
      gradient: ['#10B981', '#059669'] as const,
      description: 'Tanya jawab seputar kesehatan',
      route: '/diskusi',
      stats: '120+ diskusi aktif',
    },
    {
      id: 2,
      title: 'Kalkulator BMI',
      icon: 'calculator' as const,
      gradient: ['#34D399', '#10B981'] as const,
      description: 'Cek indeks massa tubuh',
      route: '/bmi',
      stats: 'Analisis akurat',
    },
    {
      id: 3,
      title: 'AI Chatbot',
      icon: 'chatbubble-ellipses' as const,
      gradient: ['#059669', '#047857'] as const,
      description: 'Chat dengan AI 24/7',
      action: () => setAiModalVisible(true),
      stats: 'Respon instan',
    },
    {
      id: 4,
      title: 'Profil Saya',
      icon: 'person' as const,
      gradient: ['#10B981', '#34D399'] as const,
      description: 'Kelola data kesehatan',
      route: '/profil',
      stats: 'Profil lengkap',
    },
  ];

  const healthTips = [
    {
      id: 1,
      title: 'Hidrasi Optimal',
      tip: 'Minum 8-10 gelas air putih setiap hari untuk metabolisme yang lebih baik',
      icon: 'water' as const,
      gradient: ['rgba(16, 185, 129, 0.9)', 'rgba(5, 150, 105, 0.9)'] as const,
      category: 'Nutrisi',
    },
    {
      id: 2,
      title: 'Tidur Berkualitas',
      tip: 'Tidur 7-9 jam per malam meningkatkan sistem imun tubuh',
      icon: 'moon' as const,
      gradient: ['rgba(52, 211, 153, 0.9)', 'rgba(16, 185, 129, 0.9)'] as const,
      category: 'Istirahat',
    },
    {
      id: 3,
      title: 'Aktivitas Fisik',
      tip: 'Olahraga ringan 30 menit sehari membakar 200-300 kalori',
      icon: 'barbell' as const,
      gradient: ['rgba(5, 150, 105, 0.9)', 'rgba(4, 120, 87, 0.9)'] as const,
      category: 'Olahraga',
    },
  ];

  const quickActions = [
    { id: 1, icon: 'calculator' as const, label: 'BMI', gradient: ['#10B981', '#059669'] as const, route: '/bmi' },
    { id: 2, icon: 'chatbubble-ellipses' as const, label: 'AI Chat', gradient: ['#34D399', '#10B981'] as const, action: () => setAiModalVisible(true) },
    { id: 3, icon: 'chatbubbles' as const, label: 'Forum', gradient: ['#059669', '#047857'] as const, route: '/diskusi' },
    { id: 4, icon: 'person' as const, label: 'Profil', gradient: ['#10B981', '#34D399'] as const, route: '/profil' },
  ];

  // AI BUTTON POSITION - DIATAS DOCK
  const aiButtonBottom = Platform.OS === 'ios' 
    ? 140  // Lebih tinggi dari dock (dock ~100)
    : 130; // Lebih tinggi dari dock (dock ~90)

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
      
      {/* Glass Background */}
      <LinearGradient
        colors={['rgba(240, 253, 244, 0.95)', 'rgba(209, 250, 229, 0.9)', 'rgba(167, 243, 208, 0.85)']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
          }
        ]}
      >
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
          {/* Header dengan Glass Effect */}
          <Animated.View 
            style={[
              styles.headerArea,
              {
                opacity: sectionsAnim.header.opacity,
                transform: [{ translateY: sectionsAnim.header.translateY }]
              }
            ]}
          >
            <BlurView
              intensity={20}
              tint="light"
              style={styles.glassHeader}
            >
              <View style={styles.headerContent}>
                <View style={styles.logoContainer}>
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.logoCircle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="heart" size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <View>
                    <Text style={styles.logoText}>QHealth</Text>
                    <Text style={styles.logoSubtext}>Your Health Partner</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.notificationButton}
                  onPress={() => navigateToScreen('/notifikasi')}
                  activeOpacity={0.8}
                >
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>3</Text>
                  </View>
                  <Ionicons name="notifications-outline" size={24} color="#065F46" />
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>

          {/* Hero Section dengan Liquid Glass Effect */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: sectionsAnim.hero.opacity,
                transform: [{ translateY: sectionsAnim.hero.translateY }]
              }
            ]}
          >
            <BlurView
              intensity={25}
              tint="light"
              style={styles.glassHero}
            >
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.9)', 'rgba(5, 150, 105, 0.85)']}
                style={styles.heroGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.heroContent}>
                  <View style={styles.heroTextContainer}>
                    <Text style={styles.greetingText}>{greeting}</Text>
                    <Text style={styles.userName}>Selamat datang!</Text>
                    
                    <View style={styles.heroStats}>
                      <View style={styles.statItem}>
                        <Ionicons name="fitness" size={16} color="#FFFFFF" />
                        <Text style={styles.statText}>Aktif</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                        <Text style={styles.statText}>Sehat</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.profileImage}>
                    <LinearGradient
                      colors={['#FFFFFF', '#F0FDF4']}
                      style={styles.profileCircle}
                    >
                      <Ionicons name="person" size={32} color="#10B981" />
                    </LinearGradient>
                  </View>
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>

          {/* Menu Grid dengan Glass Effect */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: sectionsAnim.menu.opacity,
                transform: [{ translateY: sectionsAnim.menu.translateY }]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🩺 Layanan Kesehatan</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>Semua</Text>
                <Ionicons name="chevron-forward" size={14} color="#10B981" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuGrid}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuCardWrapper}
                  onPress={() => item.route ? navigateToScreen(item.route) : item.action?.()}
                  activeOpacity={0.9}
                >
                  <BlurView
                    intensity={20}
                    tint="light"
                    style={styles.glassMenuCard}
                  >
                    <LinearGradient
                      colors={item.gradient}
                      style={styles.menuCardGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.menuCardContent}>
                        <LinearGradient
                          colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                          style={styles.menuIconWrapper}
                        >
                          <Ionicons name={item.icon} size={24} color="#FFFFFF" />
                        </LinearGradient>
                        
                        <View style={styles.menuTextContainer}>
                          <Text style={styles.menuTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={styles.menuDescription} numberOfLines={2}>
                            {item.description}
                          </Text>
                        </View>
                        
                        <View style={styles.menuFooter}>
                          <Text style={styles.menuStats}>{item.stats}</Text>
                          <Ionicons name="arrow-forward-circle" size={20} color="rgba(255, 255, 255, 0.8)" />
                        </View>
                      </View>
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Tips Carousel dengan Auto Rotate */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: sectionsAnim.tips.opacity,
                transform: [{ translateY: sectionsAnim.tips.translateY }]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💡 Tips Kesehatan</Text>
              <View style={styles.tipsIndicator}>
                {healthTips.map((_, index) => (
                  <View 
                    key={index}
                    style={[
                      styles.indicatorDot,
                      index === currentTipIndex && styles.activeIndicatorDot
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.tipCardContainer}>
              <BlurView
                intensity={25}
                tint="light"
                style={styles.glassTipCard}
              >
                <LinearGradient
                  colors={healthTips[currentTipIndex].gradient}
                  style={styles.tipCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.tipCardContent}>
                    <View style={styles.tipHeader}>
                      <View style={styles.tipIconContainer}>
                        <Ionicons 
                          name={healthTips[currentTipIndex].icon} 
                          size={28} 
                          color="#FFFFFF" 
                        />
                      </View>
                      <View style={styles.tipCategory}>
                        <Text style={styles.tipCategoryText}>
                          {healthTips[currentTipIndex].category}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.tipTitle} numberOfLines={2}>
                      {healthTips[currentTipIndex].title}
                    </Text>
                    
                    <Text style={styles.tipText} numberOfLines={3}>
                      {healthTips[currentTipIndex].tip}
                    </Text>
                    
                    <TouchableOpacity 
                      style={styles.tipActionButton}
                      onPress={() => router.push(`/tips-detail?id=${healthTips[currentTipIndex].id}`)}
                    >
                      <Text style={styles.tipActionText}>Pelajari Lebih Lanjut</Text>
                      <Ionicons name="arrow-forward" size={16} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </BlurView>
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: sectionsAnim.quick.opacity,
                transform: [{ translateY: sectionsAnim.quick.translateY }],
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⚡ Akses Cepat</Text>
            </View>
            
            <View style={styles.quickActions}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickActionWrapper}
                  onPress={() => action.route ? navigateToScreen(action.route) : action.action?.()}
                  activeOpacity={0.9}
                >
                  <BlurView
                    intensity={15}
                    tint="light"
                    style={styles.glassQuickAction}
                  >
                    <LinearGradient
                      colors={action.gradient}
                      style={styles.quickActionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name={action.icon} size={24} color="#FFFFFF" />
                      <Text style={styles.quickActionText}>{action.label}</Text>
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          <View style={{ height: 150 }} /> {/* Extra space untuk FAB */}
        </ScrollView>

        {/* AI FLOATING BUTTON - NO ROTATION, POSITION ABOVE DOCK */}
        <Animated.View
          style={[
            styles.aiFabContainer,
            {
              bottom: aiButtonBottom,
              transform: [
                { scale: Animated.multiply(fabScale, fabGlow) },
              ],
            }
          ]}
          pointerEvents="box-none"
        >
          <BlurView
            intensity={30}
            tint="light"
            style={styles.aiFabBlur}
          >
            <TouchableOpacity
              style={styles.aiFab}
              onPress={onPressAI}
              activeOpacity={0.85}
            >
              <View style={styles.aiFabGlow} />
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.9)', 'rgba(5, 150, 105, 0.85)', 'rgba(4, 120, 87, 0.8)']}
                style={styles.aiFabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="chatbubble-ellipses" size={28} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      </Animated.View>

      {/* AI CHAT MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={aiModalVisible}
        onRequestClose={closeAIModal}
      >
        {aiModalVisible && (
          <AIChatModal
            visible={aiModalVisible}
            onClose={closeAIModal}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Header Styles
  headerArea: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  glassHeader: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: -0.5,
  },
  logoSubtext: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Hero Section
  heroSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  glassHero: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  heroGradient: {
    padding: 24,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.8,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileImage: {
    marginLeft: 16,
  },
  profileCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Section Common
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: -0.4,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },

  // Menu Section
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuCardWrapper: {
    width: (screenWidth - 52) / 2,
    marginBottom: 12,
  },
  glassMenuCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  menuCardGradient: {
    padding: 16,
  },
  menuCardContent: {
    height: 140,
    justifyContent: 'space-between',
  },
  menuIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTextContainer: {
    flex: 1,
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 14,
  },
  menuFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuStats: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Tips Section
  tipsIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  activeIndicatorDot: {
    backgroundColor: '#10B981',
  },
  tipCardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  glassTipCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tipCardGradient: {
    padding: 20,
  },
  tipCardContent: {
    minHeight: 180,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipCategory: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tipCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  tipText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 20,
    marginBottom: 16,
  },
  tipActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  tipActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionWrapper: {
    flex: 1,
  },
  glassQuickAction: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    gap: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // AI Floating Button - NO ROTATION
  aiFabContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 9999,
  },
  aiFabBlur: {
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  aiFab: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  aiFabGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    opacity: 0.2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  aiFabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});