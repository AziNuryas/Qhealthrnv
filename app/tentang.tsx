import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TentangScreen() {
  const router = useRouter();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const features = [
    {
      id: 1,
      title: 'Forum Diskusi',
      description: 'Komunitas tanya jawab seputar kesehatan',
      icon: 'chatbubbles' as const,
      color: '#10B981',
    },
    {
      id: 2,
      title: 'Kalkulator BMI',
      description: 'Hitung indeks massa tubuh dengan akurat',
      icon: 'calculator' as const,
      color: '#34D399',
    },
    {
      id: 3,
      title: 'AI Dokter',
      description: 'Konsultasi kesehatan dengan kecerdasan buatan',
      icon: 'sparkles' as const,
      color: '#059669',
    },
    {
      id: 4,
      title: 'Profil Kesehatan',
      description: 'Kelola data kesehatan pribadi',
      icon: 'person' as const,
      color: '#047857',
    },
  ];

  const teamMembers = [
    {
      id: 1,
      name: 'Dr. Sarah Wijaya',
      role: 'Dokter Umum',
      expertise: 'Kesehatan Keluarga',
      icon: 'medical-outline' as const,
    },
    {
      id: 2,
      name: 'Prof. Budi Santoso',
      role: 'Ahli Gizi',
      expertise: 'Nutrisi & Diet',
      icon: 'restaurant-outline' as const,
    },
    {
      id: 3,
      name: 'Lisa Permata',
      role: 'Developer AI',
      expertise: 'Kecerdasan Buatan',
      icon: 'code-outline' as const,
    },
    {
      id: 4,
      name: 'Ahmad Fauzi',
      role: 'UI/UX Designer',
      expertise: 'Pengalaman Pengguna',
      icon: 'brush-outline' as const,
    },
  ];

  const appInfo = {
    version: '1.0.0',
    build: '2024.12.01',
    releaseDate: '1 Desember 2024',
    minOS: 'iOS 13 / Android 8+',
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => 
      console.error('Failed to open URL:', err)
    );
  };

  const handleTermsPress = (type: 'privacy' | 'terms' | 'license') => {
    Alert.alert(
      'Informasi',
      `Halaman ${type === 'privacy' ? 'Kebijakan Privasi' : type === 'terms' ? 'Syarat & Ketentuan' : 'Lisensi'} akan tersedia segera.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Layout lebih rapi */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <View style={styles.headerLogo}>
              <Ionicons name="information-circle" size={24} color="#10B981" />
            </View>
            <Text style={styles.headerTitle}>Tentang Aplikasi</Text>
          </View>
          
          {/* Empty space untuk alignment */}
          <View style={styles.emptySpace} />
        </Animated.View>

        {/* Hero Section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.heroLogoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="heart" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>QHealth</Text>
            <Text style={styles.appTagline}>Kesehatan dalam Genggaman</Text>
          </View>
          
          <Text style={styles.heroDescription}>
            Aplikasi kesehatan terpadu yang membantu Anda menjaga kesehatan 
            dengan fitur lengkap dan akses mudah 24/7.
          </Text>
        </Animated.View>

        {/* App Info Card */}
        <Animated.View
          style={[
            styles.infoCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
              <Ionicons name="cube-outline" size={20} color="#6B7280" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Versi</Text>
              <Text style={styles.infoValue}>{appInfo.version}</Text>
            </View>
            
            <View style={styles.infoColumn}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Rilis</Text>
              <Text style={styles.infoValue}>{appInfo.releaseDate}</Text>
            </View>
            
            <View style={styles.infoColumn}>
              <Ionicons name="phone-portrait-outline" size={20} color="#6B7280" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Minimum OS</Text>
              <Text style={styles.infoValue}>{appInfo.minOS}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Features Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✨ Fitur Unggulan</Text>
            <Text style={styles.sectionSubtitle}>Semua yang Anda butuhkan untuk kesehatan</Text>
          </View>
          
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Animated.View
                key={feature.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{
                    translateX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [index % 2 === 0 ? -15 : 15, 0]
                    })
                  }]
                }}
              >
                <View style={styles.featureCard}>
                  <View style={[styles.featureIconContainer, { backgroundColor: `${feature.color}15` }]}>
                    <Ionicons name={feature.icon} size={22} color={feature.color} />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Team Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👥 Tim Kami</Text>
            <Text style={styles.sectionSubtitle}>Profesional di bidang kesehatan & teknologi</Text>
          </View>
          
          <View style={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <Animated.View
                key={member.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{
                    translateX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [index % 2 === 0 ? -15 : 15, 0]
                    })
                  }]
                }}
              >
                <View style={styles.teamCard}>
                  <View style={styles.memberIconContainer}>
                    <Ionicons name={member.icon} size={24} color="#10B981" />
                  </View>
                  <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
                  <Text style={styles.memberRole} numberOfLines={1}>{member.role}</Text>
                  <Text style={styles.memberExpertise} numberOfLines={1}>{member.expertise}</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌐 Kontak & Tautan</Text>
          </View>
          
          <View style={styles.linksCard}>
            <TouchableOpacity 
              style={styles.linkItem}
              onPress={() => openLink('https://qhealth.com')}
              activeOpacity={0.7}
            >
              <View style={styles.linkIconContainer}>
                <Ionicons name="globe-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.linkText}>Website Resmi</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
            
            <View style={styles.linkDivider} />
            
            <TouchableOpacity 
              style={styles.linkItem}
              onPress={() => openLink('mailto:hello@qhealth.com')}
              activeOpacity={0.7}
            >
              <View style={styles.linkIconContainer}>
                <Ionicons name="mail-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.linkText}>Email</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
            
            <View style={styles.linkDivider} />
            
            <TouchableOpacity 
              style={styles.linkItem}
              onPress={() => openLink('https://instagram.com/qhealth')}
              activeOpacity={0.7}
            >
              <View style={styles.linkIconContainer}>
                <Ionicons name="logo-instagram" size={20} color="#10B981" />
              </View>
              <Text style={styles.linkText}>Instagram</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
            
            <View style={styles.linkDivider} />
            
            <TouchableOpacity 
              style={styles.linkItem}
              onPress={() => openLink('https://twitter.com/qhealth')}
              activeOpacity={0.7}
            >
              <View style={styles.linkIconContainer}>
                <Ionicons name="logo-twitter" size={20} color="#10B981" />
              </View>
              <Text style={styles.linkText}>Twitter</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📄 Informasi Lainnya</Text>
          </View>
          
          <View style={styles.termsCard}>
            <TouchableOpacity 
              style={styles.termsItem}
              onPress={() => handleTermsPress('privacy')}
              activeOpacity={0.7}
            >
              <View style={styles.termsIconContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.termsText}>Kebijakan Privasi</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
            
            <View style={styles.termsDivider} />
            
            <TouchableOpacity 
              style={styles.termsItem}
              onPress={() => handleTermsPress('terms')}
              activeOpacity={0.7}
            >
              <View style={styles.termsIconContainer}>
                <Ionicons name="document-text-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.termsText}>Syarat & Ketentuan</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
            
            <View style={styles.termsDivider} />
            
            <TouchableOpacity 
              style={styles.termsItem}
              onPress={() => handleTermsPress('license')}
              activeOpacity={0.7}
            >
              <View style={styles.termsIconContainer}>
                <Ionicons name="book-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.termsText}>Lisensi</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLogo}>
            <Ionicons name="heart" size={20} color="#10B981" />
          </View>
          <Text style={styles.copyright}>© 2024 QHealth Team</Text>
          <Text style={styles.footerText}>Dibuat dengan ❤️ untuk kesehatan Indonesia</Text>
          <Text style={styles.footerVersion}>Build {appInfo.build}</Text>
        </View>

        {/* Spacer untuk menghindari nabrak navbar */}
        <View style={{ height: Platform.OS === 'ios' ? 40 : 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 44 : 30,
    paddingBottom: 20,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  emptySpace: {
    width: 40,
  },
  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  heroLogoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  heroDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Info Card
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoColumn: {
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Features
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
  },
  // Team
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  teamCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  memberIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#D1FAE5',
  },
  memberName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'center',
    maxWidth: '100%',
  },
  memberRole: {
    fontSize: 11,
    color: '#10B981',
    marginBottom: 2,
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: '100%',
  },
  memberExpertise: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: '100%',
  },
  // Links
  linksCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  linkIconContainer: {
    width: 32,
    alignItems: 'center',
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  linkDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  // Terms
  termsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  termsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  termsIconContainer: {
    width: 32,
    alignItems: 'center',
  },
  termsText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  termsDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
  },
  footerLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  copyright: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
    textAlign: 'center',
  },
  footerVersion: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
});