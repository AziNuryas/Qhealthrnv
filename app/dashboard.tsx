// app/index.tsx
import { Ionicons } from '@expo/vector-icons';
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
import AIChatModal from '@/components/AIChatModal';

const { width: screenWidth } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [aiModalVisible, setAiModalVisible] = useState(false);

  // ============================
  // FLOATING AI BUTTON - ENHANCED
  // ============================
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabGlow = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Gentle glow effect only - NO rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabGlow, {
          toValue: 1.12,
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
        Animated.timing(fabGlow, {
          toValue: 1,
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fabGlow]);

  const onPressAI = useCallback(() => {
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.85,
        duration: 100,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        tension: 300,
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

  // Animations untuk entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  // Staggered animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;
  const tipsOpacity = useRef(new Animated.Value(0)).current;
  const quickOpacity = useRef(new Animated.Value(0)).current;

  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const heroTranslateY = useRef(new Animated.Value(30)).current;
  const menuTranslateY = useRef(new Animated.Value(30)).current;
  const tipsTranslateY = useRef(new Animated.Value(30)).current;
  const quickTranslateY = useRef(new Animated.Value(30)).current;

  const menuScales = useRef(Array(4).fill(0).map(() => new Animated.Value(1))).current;
  const tipScales = useRef(Array(3).fill(0).map(() => new Animated.Value(1))).current;
  const quickScales = useRef(Array(3).fill(0).map(() => new Animated.Value(1))).current;

  const animateEntrance = useCallback(() => {
    // Reset
    fadeAnim.setValue(0);
    slideUpAnim.setValue(30);
    headerOpacity.setValue(0);
    heroOpacity.setValue(0);
    menuOpacity.setValue(0);
    tipsOpacity.setValue(0);
    quickOpacity.setValue(0);
    headerTranslateY.setValue(-20);
    heroTranslateY.setValue(30);
    menuTranslateY.setValue(30);
    tipsTranslateY.setValue(30);
    quickTranslateY.setValue(30);

    // Smooth staggered entrance
    Animated.stagger(100, [
      // Header - slide from top
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.spring(headerTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),

      // Hero section
      Animated.parallel([
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.spring(heroTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),

      // Menu grid
      Animated.parallel([
        Animated.timing(menuOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.spring(menuTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),

      // Tips carousel
      Animated.parallel([
        Animated.timing(tipsOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.spring(tipsTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),

      // Quick actions
      Animated.parallel([
        Animated.timing(quickOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.spring(quickTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Main fade
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }).start();
  }, [
    fadeAnim, slideUpAnim,
    headerOpacity, heroOpacity, menuOpacity, tipsOpacity, quickOpacity,
    headerTranslateY, heroTranslateY, menuTranslateY, tipsTranslateY, quickTranslateY
  ]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('☀️ Selamat Pagi');
    else if (hour < 18) setGreeting('🌤️ Selamat Siang');
    else setGreeting('🌙 Selamat Malam');

    const timer = setTimeout(() => {
      animateEntrance();
    }, 200);

    return () => clearTimeout(timer);
  }, [animateEntrance]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      animateEntrance();
    }, 1000);
  }, [animateEntrance]);

  const navigateToScreen = (route: string, scaleValue: Animated.Value) => {
    const callback = () => {
      router.push(route as any);
    };

    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.94,
        duration: 100,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  const menuItems = [
    {
      id: 1,
      title: 'Forum Diskusi',
      icon: 'chatbubbles' as const,
      gradient: ['#10B981', '#059669'] as const,
      description: 'Tanya jawab kesehatan',
      route: '/diskusi',
      stats: '120+ diskusi',
      statsColor: '#EF4444',
    },
    {
      id: 2,
      title: 'Kalkulator BMI',
      icon: 'calculator' as const,
      gradient: ['#34D399', '#10B981'] as const,
      description: 'Cek indeks massa tubuh',
      route: '/bmi',
      stats: 'Cepat & akurat',
      statsColor: '#EF4444',
    },
    {
      id: 3,
      title: 'AI Dokter',
      icon: 'sparkles' as const,
      gradient: ['#059669', '#047857'] as const,
      description: 'Konsultasi AI 24/7',
      action: () => setAiModalVisible(true),
      stats: 'Respon instan',
      statsColor: '#EF4444',
    },
    {
      id: 4,
      title: 'Profil Saya',
      icon: 'person' as const,
      gradient: ['#10B981', '#34D399'] as const,
      description: 'Kelola akun Anda',
      route: '/profil',
      stats: 'Lengkapi profil',
      statsColor: '#EF4444',
    },
  ];

  const healthTips = [
    {
      id: 1,
      title: 'Hidrasi Optimal',
      tip: 'Minum 8-10 gelas air putih setiap hari untuk metabolisme yang lebih baik',
      icon: 'water' as const,
      gradient: ['#10B981', '#059669'] as const,
      category: 'Nutrisi',
      buttonText: 'Selengkapnya',
      buttonColor: '#EF4444',
    },
    {
      id: 2,
      title: 'Tidur Berkualitas',
      tip: 'Tidur 7-9 jam per malam meningkatkan sistem kekebalan tubuh hingga 40%',
      icon: 'moon' as const,
      gradient: ['#34D399', '#10B981'] as const,
      category: 'Istirahat',
      buttonText: 'Selengkapnya',
      buttonColor: '#EF4444',
    },
    {
      id: 3,
      title: 'Aktivitas Fisik',
      tip: 'Olahraga ringan 30 menit sehari membakar 200-300 kalori',
      icon: 'barbell' as const,
      gradient: ['#059669', '#047857'] as const,
      category: 'Olahraga',
      buttonText: 'Selengkapnya',
      buttonColor: '#EF4444',
    },
  ];

  const quickActions = [
    { id: 1, icon: 'calculator' as const, label: 'BMI', gradient: ['#10B981', '#059669'] as const, route: '/bmi' },
    { id: 2, icon: 'sparkles' as const, label: 'AI Dokter', gradient: ['#34D399', '#10B981'] as const, action: () => setAiModalVisible(true) },
    { id: 3, icon: 'chatbubbles' as const, label: 'Forum', gradient: ['#059669', '#047857'] as const, route: '/diskusi' },
  ];

  const aiButtonBottom = Platform.OS === 'ios' 
    ? 100
    : 90;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#F0FDF4', '#D1FAE5', '#A7F3D0']}
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
            />
          }
        >
          {/* Header Area */}
          <Animated.View 
            style={[
              styles.headerArea,
              {
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }]
              }
            ]}
          >
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.logoCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="heart" size={22} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.logoText}>QHealth</Text>
              </View>

              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => navigateToScreen('/notifikasi', menuScales[0])}
                activeOpacity={0.8}
              >
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
                <Ionicons name="notifications-outline" size={24} color="#065F46" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Hero Section */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: heroOpacity,
                transform: [{ translateY: heroTranslateY }]
              }
            ]}
          >
            <LinearGradient
              colors={['#10B981', '#059669', '#047857'] as const}
              style={styles.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroTextContainer}>
                  <Text style={styles.greetingText}>{greeting}</Text>
                  <Text style={styles.userName}>Selamat datang!</Text>

                  <View style={styles.userInfoRow}>
                    <View style={styles.userBadge}>
                      <Ionicons name="person-circle" size={16} color="#FFFFFF" />
                      <Text style={styles.userBadgeText}>Naruto Uzumaki</Text>
                    </View>

                    <View style={styles.dateBadge}>
                      <Ionicons name="calendar" size={14} color="#10B981" />
                      <Text style={styles.dateText}>
                        {new Date().toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short'
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Menu Grid */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: menuOpacity,
                transform: [{ translateY: menuTranslateY }]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>🩺 Layanan Kesehatan</Text>
                <Text style={styles.sectionSubtitle}>Akses cepat ke semua fitur</Text>
              </View>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>Lihat Semua</Text>
                <Ionicons name="chevron-forward" size={16} color="#10B981" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuGrid}>
              <View style={styles.menuRow}>
                {menuItems.slice(0, 2).map((item, index) => (
                  <Animated.View
                    key={item.id}
                    style={{
                      flex: 1,
                      transform: [{ scale: menuScales[index] }]
                    }}
                  >
                    <TouchableOpacity
                      style={styles.menuCard}
                      onPress={() => {
                        if (item.route) {
                          navigateToScreen(item.route, menuScales[index]);
                        } else if (item.action) {
                          const scaleValue = menuScales[index];
                          Animated.sequence([
                            Animated.timing(scaleValue, {
                              toValue: 0.94,
                              duration: 100,
                              easing: Easing.bezier(0.4, 0, 0.2, 1),
                              useNativeDriver: true,
                            }),
                            Animated.spring(scaleValue, {
                              toValue: 1,
                              tension: 300,
                              friction: 10,
                              useNativeDriver: true,
                            }),
                          ]).start(() => item.action?.());
                        }
                      }}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                        style={[styles.menuCardInner, { borderColor: 'rgba(16, 185, 129, 0.15)' }]}
                      >
                        <View style={styles.menuCardContent}>
                          <LinearGradient
                            colors={item.gradient}
                            style={styles.menuIconWrapper}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            <Ionicons name={item.icon} size={22} color="#FFFFFF" />
                          </LinearGradient>
                          
                          <View style={styles.menuTextContainer}>
                            <Text style={styles.menuTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.menuDescription} numberOfLines={2}>{item.description}</Text>
                          </View>
                          
                          <View style={styles.menuFooter}>
                            <Text style={[styles.menuStats, { color: item.statsColor }]}>
                              {item.stats}
                            </Text>
                            <View style={[styles.arrowCircle, { backgroundColor: item.gradient[0] + '20' }]}>
                              <Ionicons name="arrow-forward" size={14} color={item.gradient[0]} />
                            </View>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>

              <View style={[styles.menuRow, { marginTop: 12 }]}>
                {menuItems.slice(2, 4).map((item, index) => (
                  <Animated.View
                    key={item.id}
                    style={{
                      flex: 1,
                      transform: [{ scale: menuScales[index + 2] }]
                    }}
                  >
                    <TouchableOpacity
                      style={styles.menuCard}
                      onPress={() => {
                        if (item.route) {
                          navigateToScreen(item.route, menuScales[index + 2]);
                        } else if (item.action) {
                          const scaleValue = menuScales[index + 2];
                          Animated.sequence([
                            Animated.timing(scaleValue, {
                              toValue: 0.94,
                              duration: 100,
                              easing: Easing.bezier(0.4, 0, 0.2, 1),
                              useNativeDriver: true,
                            }),
                            Animated.spring(scaleValue, {
                              toValue: 1,
                              tension: 300,
                              friction: 10,
                              useNativeDriver: true,
                            }),
                          ]).start(() => item.action?.());
                        }
                      }}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                        style={[styles.menuCardInner, { borderColor: 'rgba(16, 185, 129, 0.15)' }]}
                      >
                        <View style={styles.menuCardContent}>
                          <LinearGradient
                            colors={item.gradient}
                            style={styles.menuIconWrapper}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            <Ionicons name={item.icon} size={22} color="#FFFFFF" />
                          </LinearGradient>
                          
                          <View style={styles.menuTextContainer}>
                            <Text style={styles.menuTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.menuDescription} numberOfLines={2}>{item.description}</Text>
                          </View>
                          
                          <View style={styles.menuFooter}>
                            <Text style={[styles.menuStats, { color: item.statsColor }]}>
                              {item.stats}
                            </Text>
                            <View style={[styles.arrowCircle, { backgroundColor: item.gradient[0] + '20' }]}>
                              <Ionicons name="arrow-forward" size={14} color={item.gradient[0]} />
                            </View>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Tips Carousel */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: tipsOpacity,
                transform: [{ translateY: tipsTranslateY }]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>💡 Tips Kesehatan</Text>
                <Text style={styles.sectionSubtitle}>Tips harian untuk hidup sehat</Text>
              </View>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => router.push('/tips-detail')}
              >
                <Text style={styles.seeAllText}>Lihat Semua</Text>
                <Ionicons name="chevron-forward" size={16} color="#10B981" />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tipsScroll}
              decelerationRate="fast"
              snapToInterval={screenWidth * 0.8 + 16}
            >
              {healthTips.map((tip, index) => (
                <Animated.View
                  key={tip.id}
                  style={{
                    opacity: fadeAnim,
                    transform: [{ scale: tipScales[index] }],
                    marginRight: 16,
                  }}
                >
                  <TouchableOpacity
                    style={styles.tipCard}
                    onPress={() => router.push(`/tips-detail?id=${tip.id}`)}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={tip.gradient}
                      style={styles.tipGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.tipHeader}>
                        <View style={styles.tipIconBox}>
                          <Ionicons name={tip.icon} size={22} color="#FFFFFF" />
                        </View>
                        <View style={styles.tipBadge}>
                          <Text style={styles.tipCategory}>{tip.category}</Text>
                        </View>
                      </View>
                      <View style={styles.tipContent}>
                        <Text style={styles.tipTitle} numberOfLines={2}>{tip.title}</Text>
                        <Text style={styles.tipText} numberOfLines={3}>{tip.tip}</Text>
                      </View>
                      <View style={styles.tipButton}>
                        <Text style={[styles.tipButtonText, { color: tip.buttonColor }]}>
                          {tip.buttonText}
                        </Text>
                        <Ionicons name="chevron-forward" size={14} color={tip.buttonColor} />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: quickOpacity,
                transform: [{ translateY: quickTranslateY }],
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>⚡ Akses Cepat</Text>
                <Text style={styles.sectionSubtitle}>Fitur yang sering digunakan</Text>
              </View>
            </View>
            
            <View style={styles.quickActions}>
              {quickActions.map((action, index) => (
                <Animated.View
                  key={action.id}
                  style={{
                    flex: 1,
                    transform: [{ scale: quickScales[index] }]
                  }}
                >
                  <TouchableOpacity
                    style={styles.quickActionCard}
                    onPress={() => {
                      if (action.route) {
                        navigateToScreen(action.route, quickScales[index]);
                      } else if (action.action) {
                        const scaleValue = quickScales[index];
                        Animated.sequence([
                          Animated.timing(scaleValue, {
                            toValue: 0.94,
                            duration: 100,
                            easing: Easing.bezier(0.4, 0, 0.2, 1),
                            useNativeDriver: true,
                          }),
                          Animated.spring(scaleValue, {
                            toValue: 1,
                            tension: 300,
                            friction: 10,
                            useNativeDriver: true,
                          }),
                        ]).start(() => action.action?.());
                      }
                    }}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={action.gradient}
                      style={styles.quickActionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name={action.icon} size={26} color="#FFFFFF" />
                      <Text style={styles.quickActionText}>{action.label}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* AI FLOATING BUTTON - ICON ONLY */}
        <Animated.View
          style={[
            styles.aiFabContainer,
            {
              bottom: aiButtonBottom,
              transform: [
                { scale: Animated.multiply(fabScale, fabGlow) }
              ]
            }
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={styles.aiFab}
            onPress={onPressAI}
            activeOpacity={0.85}
          >
            <View style={styles.aiFabGlow} />
            <LinearGradient
              colors={['#10B981', '#059669', '#047857']}
              style={styles.aiFabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="sparkles" size={28} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
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
  container: {
    flex: 1,
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
  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: -0.5,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  heroSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  heroGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
  },
  heroTextContainer: {
    width: '100%',
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.8,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  userBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    width: '100%',
  },
  sectionTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#059669',
    lineHeight: 18,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  menuGrid: {
    width: '100%',
  },
  menuRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  menuCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 140,
  },
  menuCardInner: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  menuCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  menuIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuTextContainer: {
    marginBottom: 12,
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  menuDescription: {
    fontSize: 12,
    color: '#059669',
    lineHeight: 16,
  },
  menuFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  menuStats: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsScroll: {
    paddingRight: 16,
  },
  tipCard: {
    width: screenWidth * 0.8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    minHeight: 160,
  },
  tipGradient: {
    flex: 1,
    padding: 18,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tipCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipContent: {
    flex: 1,
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  tipText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 18,
  },
  tipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tipButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 80,
  },
  quickActionGradient: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // AI FLOATING BUTTON - ICON ONLY WITH SMOOTH ANIMATION
  aiFabContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 9999,
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
    elevation: 8,
  },
  aiFabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
});