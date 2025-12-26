import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type NotificationType = 'all' | 'unread' | 'system' | 'forum' | 'health';

interface NotificationItem {
  id: string;
  type: 'system' | 'forum' | 'health' | 'reminder';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  action?: () => void;
}

export default function NotifikasiScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationType>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'health',
      title: 'Waktu Minum Air',
      message: 'Jangan lupa minum air putih yang cukup hari ini!',
      time: 'Baru saja',
      read: false,
      icon: 'water-outline',
      color: '#3B82F6',
    },
    {
      id: '2',
      type: 'forum',
      title: 'Diskusi Baru di Forum',
      message: 'Ada 5 diskusi baru seputar kesehatan jantung',
      time: '10 menit lalu',
      read: false,
      icon: 'chatbubbles-outline',
      color: '#10B981',
      action: () => router.push('/diskusi'),
    },
    {
      id: '3',
      type: 'system',
      title: 'Pembaruan Aplikasi',
      message: 'Versi 1.1.0 tersedia dengan fitur baru',
      time: '1 jam lalu',
      read: true,
      icon: 'cog-outline',
      color: '#8B5CF6',
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Jadwal Olahraga',
      message: 'Waktunya olahraga ringan 30 menit',
      time: '2 jam lalu',
      read: true,
      icon: 'fitness-outline',
      color: '#EF4444',
    },
    {
      id: '5',
      type: 'health',
      title: 'Tips Kesehatan Harian',
      message: 'Tidur cukup 8 jam meningkatkan imunitas 40%',
      time: '5 jam lalu',
      read: true,
      icon: 'bulb-outline',
      color: '#F59E0B',
    },
    {
      id: '6',
      type: 'forum',
      title: 'Jawaban Anda Dihargai',
      message: 'Jawaban Anda di forum mendapat 12 suka',
      time: '1 hari lalu',
      read: true,
      icon: 'thumbs-up-outline',
      color: '#EC4899',
      action: () => router.push('/profil'),
    },
    {
      id: '7',
      type: 'system',
      title: 'Verifikasi Email',
      message: 'Verifikasi email Anda untuk keamanan akun',
      time: '2 hari lalu',
      read: true,
      icon: 'mail-outline',
      color: '#6B7280',
    },
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: true,
    emailNotifications: false,
    forumUpdates: true,
    healthTips: true,
    reminderAlerts: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  const tabs = [
    { id: 'all', label: 'Semua', count: notifications.length },
    { id: 'unread', label: 'Belum Dibaca', count: notifications.filter(n => !n.read).length },
    { id: 'system', label: 'Sistem', count: notifications.filter(n => n.type === 'system').length },
    { id: 'forum', label: 'Forum', count: notifications.filter(n => n.type === 'forum').length },
    { id: 'health', label: 'Kesehatan', count: notifications.filter(n => n.type === 'health' || n.type === 'reminder').length },
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    if (activeTab === 'system') return notification.type === 'system';
    if (activeTab === 'forum') return notification.type === 'forum';
    if (activeTab === 'health') return notification.type === 'health' || notification.type === 'reminder';
    return true;
  });

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Diperbarui', 'Notifikasi telah diperbarui');
    }, 1000);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    Alert.alert(
      'Tandai Semua Dibaca',
      'Tandai semua notifikasi sebagai sudah dibaca?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Tandai',
          onPress: () => {
            setNotifications(prev =>
              prev.map(notif => ({ ...notif, read: true }))
            );
            Alert.alert('Berhasil', 'Semua notifikasi telah ditandai dibaca');
          },
        },
      ]
    );
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Hapus Semua',
      'Hapus semua notifikasi? Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            setNotifications([]);
            Alert.alert('Berhasil', 'Semua notifikasi telah dihapus');
          },
        },
      ]
    );
  };

  const toggleNotificationSetting = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'health': return 'heart-outline';
      case 'forum': return 'chatbubbles-outline';
      case 'system': return 'cog-outline';
      case 'reminder': return 'alarm-outline';
      default: return 'notifications-outline';
    }
  };

  const handleNotificationPress = (notification: NotificationItem) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.action) {
      notification.action();
    } else {
      Alert.alert(notification.title, notification.message, [
        { text: 'OK' }
      ]);
    }
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
        <Text style={styles.headerTitle}>Notifikasi</Text>
        <TouchableOpacity 
          onPress={markAllAsRead}
          style={styles.headerAction}
        >
          <Text style={styles.headerActionText}>Tandai Dibaca</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.tabActive
            ]}
            onPress={() => setActiveTab(tab.id as NotificationType)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.tabTextActive
            ]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[
                styles.tabBadge,
                activeTab === tab.id && styles.tabBadgeActive
              ]}>
                <Text style={styles.tabBadgeText}>{tab.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#4F46E5"
            colors={['#4F46E5']}
          />
        }
      >
        {/* Notification Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="mail-unread-outline" size={24} color="#EF4444" />
            <View style={styles.statTexts}>
              <Text style={styles.statValue}>
                {notifications.filter(n => !n.read).length}
              </Text>
              <Text style={styles.statLabel}>Belum dibaca</Text>
            </View>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Ionicons name="mail-outline" size={24} color="#10B981" />
            <View style={styles.statTexts}>
              <Text style={styles.statValue}>{notifications.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Ionicons name="today-outline" size={24} color="#3B82F6" />
            <View style={styles.statTexts}>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Hari ini</Text>
            </View>
          </View>
        </View>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <View style={styles.notificationsList}>
            {filteredNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.read && styles.notificationCardUnread
                ]}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
              >
                <View style={styles.notificationHeader}>
                  <View style={[styles.notificationIcon, { backgroundColor: `${notification.color}15` }]}>
                    <Ionicons name={notification.icon} size={20} color={notification.color} />
                  </View>
                  
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle} numberOfLines={1}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                  
                  {!notification.read && (
                    <View style={styles.unreadIndicator} />
                  )}
                </View>
                
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
                
                {notification.action && (
                  <TouchableOpacity 
                    style={styles.notificationAction}
                    onPress={notification.action}
                  >
                    <Text style={styles.notificationActionText}>Lihat Detail</Text>
                    <Ionicons name="arrow-forward" size={14} color={notification.color} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Tidak ada notifikasi</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'unread' 
                ? 'Semua notifikasi sudah dibaca' 
                : 'Belum ada notifikasi di kategori ini'}
            </Text>
          </View>
        )}

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>⚙️ Pengaturan Notifikasi</Text>
            <Text style={styles.settingsSubtitle}>Atur preferensi notifikasi Anda</Text>
          </View>
          
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={20} color="#4F46E5" />
                <Text style={styles.settingLabel}>Notifikasi Push</Text>
              </View>
              <Switch
                value={notificationSettings.pushEnabled}
                onValueChange={() => toggleNotificationSetting('pushEnabled')}
                trackColor={{ false: '#D1D5DB', true: '#4F46E5' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="mail-outline" size={20} color="#EF4444" />
                <Text style={styles.settingLabel}>Email Notifikasi</Text>
              </View>
              <Switch
                value={notificationSettings.emailNotifications}
                onValueChange={() => toggleNotificationSetting('emailNotifications')}
                trackColor={{ false: '#D1D5DB', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="chatbubbles-outline" size={20} color="#10B981" />
                <Text style={styles.settingLabel}>Update Forum</Text>
              </View>
              <Switch
                value={notificationSettings.forumUpdates}
                onValueChange={() => toggleNotificationSetting('forumUpdates')}
                trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="heart-outline" size={20} color="#EC4899" />
                <Text style={styles.settingLabel}>Tips Kesehatan</Text>
              </View>
              <Switch
                value={notificationSettings.healthTips}
                onValueChange={() => toggleNotificationSetting('healthTips')}
                trackColor={{ false: '#D1D5DB', true: '#EC4899' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="alarm-outline" size={20} color="#F59E0B" />
                <Text style={styles.settingLabel}>Pengingat</Text>
              </View>
              <Switch
                value={notificationSettings.reminderAlerts}
                onValueChange={() => toggleNotificationSetting('reminderAlerts')}
                trackColor={{ false: '#D1D5DB', true: '#F59E0B' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="volume-high-outline" size={20} color="#3B82F6" />
                <Text style={styles.settingLabel}>Suara</Text>
              </View>
              <Switch
                value={notificationSettings.soundEnabled}
                onValueChange={() => toggleNotificationSetting('soundEnabled')}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="phone-portrait-outline" size={20} color="#8B5CF6" />
                <Text style={styles.settingLabel}>Getar</Text>
              </View>
              <Switch
                value={notificationSettings.vibrationEnabled}
                onValueChange={() => toggleNotificationSetting('vibrationEnabled')}
                trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.clearButton]}
            onPress={clearAllNotifications}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.clearButtonText}>Hapus Semua Notifikasi</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.scheduleButton]}
            onPress={() => Alert.alert('Info', 'Fitur jadwal notifikasi akan segera hadir')}
          >
            <Ionicons name="time-outline" size={20} color="#3B82F6" />
            <Text style={styles.scheduleButtonText}>Atur Jadwal Notifikasi</Text>
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
  headerAction: {
    padding: 8,
  },
  headerActionText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#EF4444',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeActive: {
    backgroundColor: '#FFFFFF',
  },
  tabBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  statTexts: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F1F5F9',
  },
  notificationsList: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationCardUnread: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  notificationActionText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  settingsHeader: {
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
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
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  actionsSection: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  clearButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  clearButtonText: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '600',
  },
  scheduleButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  scheduleButtonText: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '600',
  },
});