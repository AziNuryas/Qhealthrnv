import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function BantuanScreen() {
  const router = useRouter();
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const faqItems = [
    {
      id: 1,
      question: 'Bagaimana cara mengubah profil saya?',
      answer: 'Anda bisa mengubah profil dengan cara:\n1. Buka menu "Profil Saya"\n2. Pilih "Edit Profil"\n3. Ubah data yang diperlukan\n4. Tekan "Simpan"'
    },
    {
      id: 2,
      question: 'Bagaimana cara menggunakan Kalkulator BMI?',
      answer: 'Untuk menggunakan Kalkulator BMI:\n1. Masukkan berat badan (kg)\n2. Masukkan tinggi badan (cm)\n3. Tekan "Hitung BMI"\n4. Lihat hasil dan kategori BMI Anda'
    },
    {
      id: 3,
      question: 'Apa itu AI Dokter dan bagaimana cara kerjanya?',
      answer: 'AI Dokter adalah asisten kesehatan berbasis kecerdasan buatan yang dapat:\n• Menjawab pertanyaan kesehatan umum\n• Memberikan saran berdasarkan gejala\n• Rekomendasi gaya hidup sehat\n\nCara kerja: Tulis pertanyaan Anda dan AI akan memberikan jawaban instan.'
    },
    {
      id: 4,
      question: 'Bagaimana cara bergabung dengan forum diskusi?',
      answer: 'Untuk bergabung dengan forum:\n1. Buka menu "Forum Diskusi"\n2. Baca diskusi yang tersedia\n3. Untuk berpartisipasi, tekan ikon "+" untuk membuat diskusi baru\n4. Atau tekan diskusi yang ada untuk melihat dan berkomentar'
    },
    {
      id: 5,
      question: 'Bagaimana cara menghapus akun saya?',
      answer: 'Untuk menghapus akun:\n1. Buka "Profil Saya"\n2. Pilih "Privasi & Keamanan"\n3. Pilih "Hapus Akun"\n4. Ikuti petunjuk konfirmasi\n\n⚠️ Perhatian: Tindakan ini tidak dapat dibatalkan.'
    },
    {
      id: 6,
      question: 'Aplikasi mengalami crash/error, apa yang harus dilakukan?',
      answer: 'Jika aplikasi mengalami masalah:\n1. Coba tutup dan buka kembali aplikasi\n2. Pastikan koneksi internet stabil\n3. Perbarui aplikasi ke versi terbaru\n4. Jika masalah berlanjut, hubungi tim support melalui fitur "Hubungi Kami"'
    }
  ];

  const contactMethods = [
    {
      id: 1,
      title: 'Email Support',
      description: 'Kirim email ke tim support kami',
      icon: 'mail-outline' as const,
      action: () => Linking.openURL('mailto:support@qhealth.com'),
      color: '#4F46E5'
    },
    {
      id: 2,
      title: 'WhatsApp',
      description: 'Chat langsung via WhatsApp',
      icon: 'logo-whatsapp' as const,
      action: () => Linking.openURL('https://wa.me/6281234567890'),
      color: '#25D366'
    },
    {
      id: 3,
      title: 'Telepon',
      description: 'Hubungi customer service',
      icon: 'call-outline' as const,
      action: () => Linking.openURL('tel:+6281234567890'),
      color: '#10B981'
    },
    {
      id: 4,
      title: 'Website',
      description: 'Kunjungi website resmi',
      icon: 'globe-outline' as const,
      action: () => Linking.openURL('https://qhealth.com'),
      color: '#3B82F6'
    }
  ];

  const handleSendMessage = () => {
    if (message.trim() === '') {
      Alert.alert('Peringatan', 'Silakan tulis pesan Anda');
      return;
    }
    
    Alert.alert(
      'Pesan Terkirim',
      'Terima kasih atas pesan Anda. Tim support akan menghubungi Anda dalam 1x24 jam.',
      [
        {
          text: 'OK',
          onPress: () => {
            setMessage('');
            Alert.alert('Info', 'Pesan simulasi terkirim ke: support@qhealth.com');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pusat Bantuan</Text>
        <TouchableOpacity 
          onPress={() => Alert.alert('Info', 'Fitur pencarian FAQ akan segera hadir')}
          style={styles.searchButton}
        >
          <Ionicons name="search-outline" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="help-circle" size={40} color="#4F46E5" />
          </View>
          <Text style={styles.heroTitle}>Ada yang bisa kami bantu?</Text>
          <Text style={styles.heroSubtitle}>
            Temukan jawaban untuk pertanyaan umum atau hubungi tim support kami
          </Text>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>❓ Pertanyaan Umum (FAQ)</Text>
            <Text style={styles.sectionSubtitle}>Cari jawaban cepat di sini</Text>
          </View>

          <View style={styles.faqContainer}>
            {faqItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.faqItem,
                  activeFAQ === item.id && styles.faqItemActive
                ]}
                onPress={() => setActiveFAQ(activeFAQ === item.id ? null : item.id)}
                activeOpacity={0.8}
              >
                <View style={styles.faqQuestion}>
                  <Text style={styles.faqQuestionText}>{item.question}</Text>
                  <Ionicons 
                    name={activeFAQ === item.id ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </View>
                
                {activeFAQ === item.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📞 Hubungi Kami</Text>
            <Text style={styles.sectionSubtitle}>Pilih cara menghubungi support</Text>
          </View>

          <View style={styles.contactGrid}>
            {contactMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.contactCard}
                onPress={method.action}
                activeOpacity={0.8}
              >
                <View style={[styles.contactIcon, { backgroundColor: `${method.color}15` }]}>
                  <Ionicons name={method.icon} size={24} color={method.color} />
                </View>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactDescription}>{method.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Send Message Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✉️ Kirim Pesan</Text>
            <Text style={styles.sectionSubtitle}>Tulis pesan untuk tim support</Text>
          </View>

          <View style={styles.messageCard}>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Tulis pesan atau masalah Anda di sini..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.messageInfo}>
              <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
              <Text style={styles.messageInfoText}>
                Tim support biasanya membalas dalam 1-2 jam kerja
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!message.trim()}
            >
              <Ionicons name="send" size={18} color="#FFFFFF" />
              <Text style={styles.sendButtonText}>Kirim Pesan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.appVersionCard}>
            <Ionicons name="phone-portrait" size={24} color="#6B7280" />
            <View style={styles.versionInfo}>
              <Text style={styles.versionText}>QHealth Mobile</Text>
              <Text style={styles.versionNumber}>v1.0.0</Text>
            </View>
          </View>
          
          <Text style={styles.copyright}>
            © 2024 QHealth Team. Semua hak dilindungi.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  searchButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  heroCard: {
    backgroundColor: '#EEF2FF',
    margin: 20,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  faqContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  faqItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  faqItemActive: {
    backgroundColor: '#F8FAFC',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginRight: 12,
  },
  faqAnswer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    whiteSpace: 'pre-line',
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  messageInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 100,
    marginBottom: 12,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  messageInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
  },
  sendButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  appVersionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
    width: '100%',
  },
  versionInfo: {
    marginLeft: 12,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  versionNumber: {
    fontSize: 12,
    color: '#6B7280',
  },
  copyright: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});