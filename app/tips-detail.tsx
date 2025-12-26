// app/tips-detail.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function TipsDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useColorScheme() === 'dark';

  // Animasi sederhana untuk efek masuk
  const fadeAnim = new Animated.Value(0);
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const tipsData = [
    {
      id: '1',
      title: 'Hidrasi Optimal',
      content: 'Minum 8–10 gelas air putih setiap hari untuk menjaga metabolisme tubuh tetap stabil. Air membantu proses detoksifikasi alami dan menjaga kulit tetap lembab. Hindari minuman manis berlebihan karena dapat meningkatkan risiko diabetes tipe 2.',
      category: 'Nutrisi',
      gradient: ['#667eea', '#764ba2'] as const,
      icon: 'water',
    },
    {
      id: '2',
      title: 'Tidur Berkualitas',
      content: 'Tidur 7–9 jam per malam sangat penting untuk regenerasi sel dan sistem imun. Kurang tidur dapat meningkatkan risiko obesitas, penyakit jantung, dan gangguan mental. Buat rutinitas: hindari layar 1 jam sebelum tidur, jaga kamar gelap dan sejuk.',
      category: 'Istirahat',
      gradient: ['#f093fb', '#f5576c'] as const,
      icon: 'moon',
    },
    {
      id: '3',
      title: 'Aktivitas Fisik Harian',
      content: 'Olahraga ringan seperti jalan kaki, stretching, atau yoga selama 30 menit sehari dapat meningkatkan mood, membakar kalori, dan memperkuat otot. Konsistensi lebih penting daripada intensitas. Mulailah dari hal kecil dan nikmati prosesnya!',
      category: 'Olahraga',
      gradient: ['#4facfe', '#00f2fe'] as const,
      icon: 'fitness',
    },
  ];

  const tip = tipsData.find(t => t.id === id) || tipsData[0];

  // Efek press interaktif (seperti di dashboard)
  const animatePress = (callback: () => void) => {
    const scale = new Animated.Value(1);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start(callback);
    return scale;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <View style={[styles.header, { backgroundColor: 'transparent' }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          style={styles.backButton}
        >
          <BlurView
            intensity={isDark ? 90 : 70}
            tint={isDark ? 'dark' : 'light'}
            style={styles.backBlur}
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? '#E2E8F0' : '#1E293B'} />
          </BlurView>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>Detail Tips</Text>
        <View style={{ width: 44 }} /> {/* spacer seimbang */}
      </View>

      <Animated.View style={{ opacity: fadeAnim }}>
        <ScrollView contentContainerStyle={styles.content}>
          <LinearGradient
            colors={tip.gradient}
            style={styles.gradientCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Badge Kategori dengan Blur */}
            <View style={styles.badgeContainer}>
              <BlurView
                intensity={isDark ? 80 : 60}
                tint={isDark ? 'dark' : 'light'}
                style={styles.badge}
              >
                <Text style={styles.category}>{tip.category}</Text>
              </BlurView>
            </View>

            {/* Ikon Utama */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name={tip.icon as any} size={36} color="#FFFFFF" />
              </View>
            </View>

            {/* Judul & Konten */}
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipContent}>{tip.content}</Text>

            {/* Tombol Aksi — Interaktif seperti di dashboard */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => animatePress(() => {})}
                activeOpacity={1}
              >
                <Ionicons name="share-social" size={20} color="#FFFFFF" />
                <Text style={styles.actionText}>Bagikan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => animatePress(() => {})}
                activeOpacity={1}
              >
                <Ionicons name="bookmark" size={20} color="#FFFFFF" />
                <Text style={styles.actionText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Footer Informasi — background non-transparan */}
          <View style={[styles.footerTip, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <Text style={[styles.footerText, { color: isDark ? '#94A3B8' : '#4B5563' }]}>
              💡 Tips ini bersifat edukatif. Untuk kondisi medis serius, segera konsultasikan ke tenaga kesehatan profesional.
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  backBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  gradientCard: {
    borderRadius: 28,
    padding: 28,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  category: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  tipContent: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 26,
    textAlign: 'justify',
    marginBottom: 28,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerTip: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});