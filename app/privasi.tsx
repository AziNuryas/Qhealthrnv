import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PrivasiScreen() {
  const router = useRouter();
  
  const [settings, setSettings] = useState({
    twoFactorAuth: true,
    biometricLogin: false,
    dataCollection: true,
    marketingEmails: false,
    activityTracking: true,
    autoBackup: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleExportData = () => {
    Alert.alert(
      'Ekspor Data',
      'Data Anda akan dikirim ke email terdaftar dalam format PDF. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Ekspor', 
          onPress: () => {
            Alert.alert(
              'Berhasil',
              'Data telah dikirim ke email Anda. Silakan cek inbox.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Hapus Akun',
      'Tindakan ini akan menghapus semua data Anda secara permanen dan tidak dapat dibatalkan. Yakin ingin melanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus Akun', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Konfirmasi Password',
              'Masukkan password untuk menghapus akun:',
              [
                { text: 'Batal', style: 'cancel' },
                { 
                  text: 'Hapus', 
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert(
                      'Akun Dihapus',
                      'Akun Anda telah dihapus. Terima kasih telah menggunakan QHealth.',
                      [{ text: 'OK', onPress: () => router.replace('/login') }]
                    );
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const securityItems = [
    {
      id: 1,
      title: 'Autentikasi Dua Faktor',
      description: 'Tambah keamanan dengan kode verifikasi via email',
      icon: 'shield-checkmark' as const,
      value: settings.twoFactorAuth,
      onToggle: () => toggleSetting('twoFactorAuth'),
      color: '#10B981',
    },
    {
      id: 2,
      title: 'Login Biometrik',
      description: 'Gunakan sidik jari atau wajah untuk login',
      icon: 'finger-print' as const,
      value: settings.biometricLogin,
      onToggle: () => toggleSetting('biometricLogin'),
      color: '#3B82F6',
    },
    {
      id: 3,
      title: 'Backup Otomatis',
      description: 'Backup data secara otomatis setiap minggu',
      icon: 'cloud-upload' as const,
      value: settings.autoBackup,
      onToggle: () => toggleSetting('autoBackup'),
      color: '#8B5CF6',
    },
  ];

  const privacyItems = [
    {
      id: 1,
      title: 'Pelacakan Aktivitas',
      description: 'Izinkan aplikasi melacak aktivitas untuk rekomendasi personal',
      icon: 'analytics' as const,
      value: settings.activityTracking,
      onToggle: () => toggleSetting('activityTracking'),
      color: '#F59E0B',
    },
    {
      id: 2,
      title: 'Koleksi Data Anonim',
      description: 'Kirim data anonim untuk pengembangan aplikasi',
      icon: 'bar-chart' as const,
      value: settings.dataCollection,
      onToggle: () => toggleSetting('dataCollection'),
      color: '#EF4444',
    },
    {
      id: 3,
      title: 'Email Marketing',
      description: 'Terima email promosi dan update produk',
      icon: 'mail' as const,
      value: settings.marketingEmails,
      onToggle: () => toggleSetting('marketingEmails'),
      color: '#EC4899',
    },
  ];

  const actions = [
    {
      id: 1,
      title: 'Ganti Password',
      description: 'Perbarui password akun Anda',
      icon: 'key' as const,
      action: () => router.push('/ganti-password'),
      color: '#10B981',
    },
    {
      id: 2,
      title: 'Ekspor Data',
      description: 'Unduh semua data pribadi Anda',
      icon: 'download' as const,
      action: handleExportData,
      color: '#3B82F6',
    },
    {
      id: 3,
      title: 'Sesi Aktif',
      description: 'Kelola perangkat yang terhubung',
      icon: 'desktop' as const,
      action: () => router.push('/sessions'),
      color: '#8B5CF6',
    },
    {
      id: 4,
      title: 'Hapus Akun',
      description: 'Hapus permanen akun dan semua data',
      icon: 'trash' as const,
      action: handleDeleteAccount,
      color: '#EF4444',
    },
  ];

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
        <Text style={styles.headerTitle}>Privasi & Keamanan</Text>
        <TouchableOpacity 
          onPress={() => Alert.alert('Info', 'Bantuan privasi & keamanan')}
          style={styles.helpButton}
        >
          <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Security Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIcon}>
              <Ionicons name="shield" size={24} color="#10B981" />
            </View>
            <View style={styles.statusTexts}>
              <Text style={styles.statusTitle}>Status Keamanan: Tinggi</Text>
              <Text style={styles.statusSubtitle}>Akun Anda terlindungi dengan baik</Text>
            </View>
          </View>
          <View style={styles.statusBar}>
            <View style={[styles.progress, { width: '90%' }]} />
          </View>
          <Text style={styles.statusNote}>
            ✅ Autentikasi dua faktor aktif • 🔐 Enkripsi data aktif
          </Text>
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Keamanan Akun</Text>
          <Text style={styles.sectionSubtitle}>Tingkatkan keamanan akun Anda</Text>
          
          <View style={styles.settingsList}>
            {securityItems.map((item) => (
              <View key={item.id} style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingDescription}>{item.description}</Text>
                  </View>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: '#D1D5DB', true: item.color }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👁️ Privasi Data</Text>
          <Text style={styles.sectionSubtitle}>Kontrol data pribadi Anda</Text>
          
          <View style={styles.settingsList}>
            {privacyItems.map((item) => (
              <View key={item.id} style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingDescription}>{item.description}</Text>
                  </View>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: '#D1D5DB', true: item.color }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Aksi Cepat</Text>
          <Text style={styles.sectionSubtitle}>Kelola akun dan data Anda</Text>
          
          <View style={styles.actionsGrid}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={action.action}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                  <Ionicons name={action.icon} size={22} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Data Info */}
        <View style={styles.dataInfoCard}>
          <View style={styles.dataInfoHeader}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.dataInfoTitle}>Informasi Data</Text>
          </View>
          
          <View style={styles.dataInfoItem}>
            <Text style={styles.dataInfoLabel}>Data Tersimpan:</Text>
            <Text style={styles.dataInfoValue}>128 MB</Text>
          </View>
          
          <View style={styles.dataInfoItem}>
            <Text style={styles.dataInfoLabel}>Terakhir Backup:</Text>
            <Text style={styles.dataInfoValue}>2 hari lalu</Text>
          </View>
          
          <View style={styles.dataInfoItem}>
            <Text style={styles.dataInfoLabel}>Perangkat Terhubung:</Text>
            <Text style={styles.dataInfoValue}>2 perangkat</Text>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips Keamanan</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>Gunakan password yang kuat dan unik</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>Aktifkan autentikasi dua faktor</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>Jangan bagikan kode verifikasi</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>Selalu logout dari perangkat publik</Text>
            </View>
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.legalSection}>
          <TouchableOpacity 
            style={styles.legalLink}
            onPress={() => router.push('/kebijakan-privasi')}
          >
            <Ionicons name="document-text" size={16} color="#6B7280" />
            <Text style={styles.legalLinkText}>Kebijakan Privasi Lengkap</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.legalLink}
            onPress={() => router.push('/persyaratan-layanan')}
          >
            <Ionicons name="document-text" size={16} color="#6B7280" />
            <Text style={styles.legalLinkText}>Persyaratan Layanan</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
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
  },
  helpButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusTexts: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBar: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  statusNote: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
    marginBottom: 16,
  },
  settingsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
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
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  dataInfoCard: {
    backgroundColor: '#F0F9FF',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  dataInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dataInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C4A6E',
    marginLeft: 8,
  },
  dataInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#BAE6FD',
  },
  dataInfoLabel: {
    fontSize: 14,
    color: '#0C4A6E',
  },
  dataInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C4A6E',
  },
  tipsCard: {
    backgroundColor: '#F0FDF4',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 12,
  },
  tipsList: {
    gap: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  legalSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  legalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  legalLinkText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
});