import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
  Dimensions,
  Easing,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Feature {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  gradient: [string, string];
}

interface Page {
  id: number;
  type: 'welcome' | 'features' | 'cta';
}

const HomeScreen = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<Animated.FlatList<Page>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Animasi untuk background orbs
  const orb1Y = useRef(new Animated.Value(0)).current;
  const orb2Y = useRef(new Animated.Value(0)).current;
  const orb3X = useRef(new Animated.Value(0)).current;

  // Refs untuk menyimpan animasi
  const orbAnimations = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();

    // Orb animations hanya saat swipe - dengan pengaturan yang lebih aman
    const orb1Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Y, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orb1Y, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const orb2Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Y, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
          delay: 500,
        }),
        Animated.timing(orb2Y, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const orb3Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(orb3X, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
          delay: 1000,
        }),
        Animated.timing(orb3X, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Simpan animasi ke ref
    orbAnimations.current = [orb1Animation, orb2Animation, orb3Animation];
    
    // Start animasi dengan delay
    setTimeout(() => {
      orb1Animation.start();
      orb2Animation.start();
      orb3Animation.start();
    }, 300);

    // Cleanup function
    return () => {
      orbAnimations.current.forEach(animation => {
        animation.stop();
      });
      orbAnimations.current = [];
    };
  }, []);

  const pages: Page[] = [
    { id: 1, type: 'welcome' },
    { id: 2, type: 'features' },
    { id: 3, type: 'cta' },
  ];

  const features: Feature[] = [
    {
      icon: 'chatbubble-ellipses',
      title: 'Forum Diskusi',
      description: 'Tanya jawab dengan ahli kesehatan dan komunitas',
      gradient: ['#10B981', '#059669'],
    },
    {
      icon: 'body',
      title: 'Kalkulator BMI',
      description: 'Monitor berat badan ideal dan kesehatan tubuh',
      gradient: ['#34D399', '#10B981'],
    },
    {
      icon: 'heart',
      title: 'Kesehatan Jantung',
      description: 'Tips dan monitor kesehatan jantung harian',
      gradient: ['#059669', '#047857'],
    },
    {
      icon: 'stats-chart',
      title: 'Progress Tracker',
      description: 'Lacak perkembangan kesehatan secara real-time',
      gradient: ['#10B981', '#34D399'],
    },
  ];

  const handleRegister = () => router.push('/register');
  const handleLogin = () => router.push('/login');

  const goToNext = () => {
    if (currentPage < pages.length - 1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ 
        index: currentPage + 1, 
        animated: true 
      });
    }
  };

  // Animasi untuk orbs berdasarkan scroll
  const orb1TranslateY = orb1Y.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const orb2TranslateY = orb2Y.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  const orb3TranslateX = orb3X.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  // Animasi iOS/Hyper OS untuk swipe
  const getPageAnimation = (index: number) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.95, 1, 0.95],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp',
    });

    const translateX = scrollX.interpolate({
      inputRange,
      outputRange: [width * 0.05, 0, -width * 0.05],
      extrapolate: 'clamp',
    });

    return { scale, opacity, translateX };
  };

  const renderPage = ({ item, index }: { item: Page; index: number }) => {
    const { scale, opacity, translateX } = getPageAnimation(index);

    return (
      <Animated.View
        style={[
          styles.page,
          { 
            transform: [{ scale }, { translateX }], 
            opacity,
          },
        ]}
      >
        {/* === Slide 1: Welcome === */}
        {item.type === 'welcome' && (
          <View style={styles.welcomePage}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#10B981', '#059669', '#047857']}
                style={styles.logoCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.logoIcon}>
                  <Ionicons name="heart" size={48} color="#FFFFFF" />
                </View>
              </LinearGradient>
              
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeTitle}>
                  Selamat Datang di
                </Text>
                <Text style={styles.welcomeBrand}>
                  QHealth
                </Text>
                <Text style={styles.welcomeSubtitle}>
                  Solusi kesehatan digital untuk hidup lebih berkualitas
                </Text>
              </View>
            </View>

            <View style={styles.welcomeFooter}>
              <TouchableOpacity 
                style={styles.nextButton}
                onPress={goToNext}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10B981', '#059669', '#047857']}
                  style={styles.nextButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.nextButtonText}>Mulai Jelajahi</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
              
              <View style={styles.swipeHintContainer}>
                <Ionicons name="chevron-back" size={16} color="#10B981" />
                <Text style={styles.swipeHint}>
                  Geser untuk melanjutkan
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#10B981" />
              </View>
            </View>
          </View>
        )}

        {/* === Slide 2: Features === */}
        {item.type === 'features' && (
          <View style={styles.featuresPage}>
            <View style={styles.featuresHeader}>
              <Text style={styles.sectionTitle}>
                Fitur Unggulan
              </Text>
              <Text style={styles.sectionSubtitle}>
                Semua yang Anda butuhkan untuk kesehatan optimal
              </Text>
            </View>

            <View style={styles.featuresGrid}>
              {features.map((feature, idx) => {
                const cardInputRange = [
                  (index - 1) * width,
                  index * width,
                  (index + 1) * width
                ];
                
                const cardOpacity = scrollX.interpolate({
                  inputRange: cardInputRange,
                  outputRange: [0, 1, 0],
                  extrapolate: 'clamp',
                });

                const cardTranslateY = scrollX.interpolate({
                  inputRange: cardInputRange,
                  outputRange: [20, 0, 20],
                  extrapolate: 'clamp',
                });

                return (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.featureCardWrapper,
                      { 
                        opacity: cardOpacity,
                        transform: [{ translateY: cardTranslateY }]
                      }
                    ]}
                  >
                    <BlurView
                      intensity={Platform.OS === 'ios' ? 25 : 15}
                      tint="light"
                      style={styles.featureCard}
                    >
                      <LinearGradient
                        colors={feature.gradient}
                        style={styles.featureIconContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Ionicons name={feature.icon} size={24} color="#FFFFFF" />
                      </LinearGradient>
                      
                      <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>
                          {feature.title}
                        </Text>
                        <Text style={styles.featureDesc} numberOfLines={2}>
                          {feature.description}
                        </Text>
                      </View>
                    </BlurView>
                  </Animated.View>
                );
              })}
            </View>

            <View style={styles.featuresFooter}>
              <TouchableOpacity 
                style={styles.nextButton}
                onPress={goToNext}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.nextButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.nextButtonText}>Lanjutkan</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* === Slide 3: CTA === */}
        {item.type === 'cta' && (
          <View style={styles.ctaPage}>
            <View style={styles.ctaHeader}>
              <LinearGradient
                colors={['#10B981', '#059669', '#047857']}
                style={styles.ctaIconCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="rocket" size={42} color="#FFFFFF" />
              </LinearGradient>
              
              <View style={styles.ctaTextContainer}>
                <Text style={styles.ctaTitle}>
                  Siap Mulai?
                </Text>
                <Text style={styles.ctaSubtitle}>
                  Bergabung dengan komunitas sehat dan raih kesehatan optimal
                </Text>
              </View>
            </View>

            <View style={styles.ctaButtons}>
              <TouchableOpacity 
                style={styles.ctaPrimaryButton}
                onPress={handleRegister}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10B981', '#059669', '#047857']}
                  style={styles.ctaButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="person-add" size={20} color="#FFFFFF" />
                  <Text style={styles.ctaPrimaryButtonText}>Daftar Gratis</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.ctaSecondaryButton}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <View style={styles.ctaSecondaryButtonContent}>
                  <Ionicons name="log-in" size={20} color="#10B981" />
                  <Text style={styles.ctaSecondaryButtonText}>Masuk</Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.ctaFooterText}>
                Dengan melanjutkan, Anda menyetujui{' '}
                <Text style={styles.ctaLink}>Syarat & Ketentuan</Text>
              </Text>
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Animated Gradient Background */}
      <Animated.View 
        style={[
          styles.backgroundContainer,
          { opacity: fadeAnim }
        ]}
      >
        <LinearGradient
          colors={['#F0FDF4', '#D1FAE5', '#A7F3D0']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Blurred Green Overlay */}
        <BlurView
          intensity={Platform.OS === 'ios' ? 20 : 10}
          tint="light"
          style={styles.blurOverlay}
        >
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.04)', 'rgba(5, 150, 105, 0.06)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </BlurView>
      </Animated.View>

      {/* Animated Floating Orbs - hanya bergerak perlahan */}
      <View style={styles.orbContainer}>
        <Animated.View
          style={[
            styles.orb,
            styles.orb1,
            {
              transform: [{ translateY: orb1TranslateY }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.orb,
            styles.orb2,
            {
              transform: [{ translateY: orb2TranslateY }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.orb,
            styles.orb3,
            {
              transform: [{ translateX: orb3TranslateX }],
            },
          ]}
        />
      </View>

      {/* Glass Morphism Header */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 20 : 10}
        tint="light"
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLogo}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.headerLogoCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="heart" size={16} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.headerLogoText}>QHealth</Text>
          </View>
          
          {/* Animated Page Indicators - sederhana tanpa interpolasi */}
          <View style={styles.pageIndicators}>
            {pages.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.pageIndicator,
                  currentPage === idx && styles.pageIndicatorActive,
                ]}
              />
            ))}
          </View>
        </View>
      </BlurView>

      {/* Main Content with iOS/Hyper OS Swipe Animation */}
      <Animated.FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderPage}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: true,
            listener: (event: any) => {
              const offsetX = event.nativeEvent.contentOffset.x;
              const pageIndex = Math.round(offsetX / width);
              if (pageIndex !== currentPage) {
                setCurrentPage(pageIndex);
              }
            },
          }
        )}
        scrollEventThrottle={16}
        bounces={false}
        decelerationRate={Platform.OS === 'ios' ? 0.99 : 0.9}
        snapToInterval={width}
        snapToAlignment="center"
        style={[styles.list, { opacity: fadeAnim }]}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundGradient: {
    flex: 1,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
    opacity: 0.08,
  },
  orb1: {
    width: 280,
    height: 280,
    backgroundColor: '#10B981',
    top: -100,
    left: -100,
  },
  orb2: {
    width: 220,
    height: 220,
    backgroundColor: '#059669',
    bottom: -70,
    right: -70,
  },
  orb3: {
    width: 180,
    height: 180,
    backgroundColor: '#34D399',
    top: '40%',
    left: '60%',
    marginTop: -90,
    opacity: 0.06,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(16, 185, 129, 0.08)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
    letterSpacing: -0.5,
  },
  pageIndicators: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  pageIndicator: {
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  pageIndicatorActive: {
    width: 20,
    height: 4,
    backgroundColor: '#10B981',
  },
  list: {
    flex: 1,
  },
  page: {
    width,
    height: '100%',
    paddingTop: 140,
    paddingBottom: 60,
  },

  // Slide 1: Welcome
  welcomePage: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 32,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  logoIcon: {
    transform: [{ rotate: '-10deg' }],
  },
  welcomeTextContainer: {
    alignItems: 'center',
    gap: 8,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065F46',
    letterSpacing: -0.41,
  },
  welcomeBrand: {
    fontSize: 44,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: -1,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#059669',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  welcomeFooter: {
    alignItems: 'center',
    gap: 20,
    width: '100%',
  },
  nextButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.41,
  },
  swipeHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    opacity: 0.7,
  },
  swipeHint: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },

  // Slide 2: Features
  featuresPage: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  featuresHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#059669',
    textAlign: 'center',
    marginTop: 4,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 16,
  },
  featureCardWrapper: {
    width: (width - 52) / 2,
    marginBottom: 12,
  },
  featureCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(16, 185, 129, 0.08)',
    overflow: 'hidden',
  },
  featureIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureContent: {
    gap: 4,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#065F46',
    letterSpacing: -0.24,
  },
  featureDesc: {
    fontSize: 13,
    fontWeight: '400',
    color: '#059669',
    lineHeight: 16,
  },
  featuresFooter: {
    marginTop: 24,
    paddingHorizontal: 20,
  },

  // Slide 3: CTA
  ctaPage: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaHeader: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 20,
  },
  ctaIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaTextContainer: {
    alignItems: 'center',
    gap: 8,
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#059669',
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaButtons: {
    width: '100%',
    gap: 12,
  },
  ctaPrimaryButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  ctaPrimaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.41,
  },
  ctaSecondaryButton: {
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    overflow: 'hidden',
  },
  ctaSecondaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  ctaSecondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#10B981',
    letterSpacing: -0.41,
  },
  ctaFooterText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#059669',
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.8,
  },
  ctaLink: {
    color: '#065F46',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});