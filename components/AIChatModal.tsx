import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AIChatModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  time: string;
}

interface ChatAPIResponse {
  success: boolean;
  reply: string;
  api?: string;
  timestamp?: string;
  message_id?: string;
  error?: string;
}

export default function AIChatModal({ visible, onClose }: AIChatModalProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '👋 **Halo! Saya AI Health Assistant QHealth**\n\nSaya siap membantu Anda dengan berbagai topik kesehatan.\n\n💡 **Mohon pastikan:**\n1. Anda sudah login\n2. Koneksi internet stabil\n3. Server API aktif\n\nTanyakan apapun tentang kesehatan!',
      isUser: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<'connecting' | 'online' | 'offline'>('connecting');
  const [apiLoading, setApiLoading] = useState(false);

  // Center modal animation (BMIModal-style)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const scrollViewRef = useRef<ScrollView>(null);

  // === FIX API BASE ===
  const API_BASE_URL = 'https://nonabstractly-unmoaning-tameka.ngrok-free.dev';

  useEffect(() => {
    if (visible) {
      loadToken();
      testAPIConnection();

      // reset
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.85);
      slideAnim.setValue(40);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(fadeAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
      });
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 40,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const loadToken = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      console.log('TOKEN LOADED:', token);
      setUserToken(token);
    } catch (error) {
      console.error('❌ Token load error:', error);
    }
  };

  const testAPIConnection = async () => {
    try {
      setConnectionStatus('connecting');

      const testResponse = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'X-Mobile-Request': 'true',
        },
        body: JSON.stringify({ message: 'test' }),
      });

      if (testResponse.ok) {
        setConnectionStatus('online');
        console.log('✅ API Connection: ONLINE');
      } else {
        setConnectionStatus('offline');
        console.log('❌ API Connection: OFFLINE');
      }
    } catch (error) {
      setConnectionStatus('offline');
      console.log('❌ API Connection Error:', error);
    }
  };

  const callChatAPI = async (userMessage: string): Promise<ChatAPIResponse> => {
    try {
      setApiLoading(true);

      const headers: any = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'X-Mobile-Request': 'true',
      };

      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: ChatAPIResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'API response not successful');
      }

      return data;
    } catch (error) {
      console.error('❌ API Call failed:', error);
      throw error;
    } finally {
      setApiLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    if (!userToken) {
      Alert.alert('⚠️ Login Required', 'Anda harus login dahulu untuk menggunakan AI Assistant.');
      return;
    }

    if (connectionStatus === 'offline') {
      Alert.alert('⚠️ Connection Error', 'Tidak dapat terhubung ke server.');
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: message,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      const apiResponse = await callChatAPI(userMessage.text);

      const aiResponse: Message = {
        id: Date.now() + 1,
        text: apiResponse.reply,
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiResponse]);
      setConnectionStatus('online');
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: `❌ **API Error**\nGagal menghubungi server.\nDetail: ${error.message}\nCoba beberapa saat lagi.`,
          isUser: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      setConnectionStatus('offline');
      testAPIConnection();
    } finally {
      setIsTyping(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setMessages([
        {
          id: 1,
          text: '👋 **Halo! Saya AI Health Assistant QHealth**\n\nSaya siap membantu Anda.',
          isUser: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setMessage('');
      setIsTyping(false);
      setConnectionStatus('connecting');
    }, 300);
  };

  const renderBlurBackground = (children: React.ReactNode, extraStyle?: any) => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView intensity={28} tint="light" style={[styles.blurBackground, extraStyle]}>
          {children}
        </BlurView>
      );
    }
    return (
      <View style={[styles.blurBackground, styles.androidBlur, extraStyle]}>
        {children}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalWrapper}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          {/* HEADER */}
          {renderBlurBackground(
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View
                  style={[
                    styles.botAvatar,
                    connectionStatus === 'online' && styles.botAvatarOnline,
                    connectionStatus === 'offline' && styles.botAvatarOffline,
                    connectionStatus === 'connecting' && styles.botAvatarConnecting,
                  ]}
                >
                  <Ionicons name="sparkles" size={22} color="#fff" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.headerTitle}>AI Health Assistant</Text>

                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusDot,
                        connectionStatus === 'online' && styles.dotOnline,
                        connectionStatus === 'offline' && styles.dotOffline,
                        connectionStatus === 'connecting' && styles.dotConnecting,
                      ]}
                    />
                    <Text
                      style={[
                        styles.headerSubtitle,
                        connectionStatus === 'online' && styles.statusOnline,
                        connectionStatus === 'offline' && styles.statusOffline,
                        connectionStatus === 'connecting' && styles.statusConnecting,
                      ]}
                      numberOfLines={1}
                    >
                      {connectionStatus === 'online' && 'Terhubung ke API'}
                      {connectionStatus === 'offline' && 'Koneksi terputus'}
                      {connectionStatus === 'connecting' && 'Menghubungkan...'}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity onPress={handleClose} style={styles.closeBtn} hitSlop={10}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}

          {/* MESSAGES */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map(msg => (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  msg.isUser ? styles.userRow : styles.botRow,
                ]}
              >
                {!msg.isUser && (
                  <View style={styles.botAvatarSmall}>
                    <Ionicons name="sparkles" size={14} color="#fff" />
                  </View>
                )}

                <View style={[styles.bubble, msg.isUser ? styles.userBubble : styles.botBubble]}>
                  <Text style={[styles.messageText, msg.isUser ? styles.userText : styles.botText]}>
                    {msg.text}
                  </Text>
                  <Text style={[styles.timeText, msg.isUser && styles.timeTextUser]}>
                    {msg.time}
                  </Text>
                </View>
              </View>
            ))}

            {isTyping && (
              <View style={[styles.messageRow, styles.botRow]}>
                <View style={styles.botAvatarSmall}>
                  <Ionicons name="sparkles" size={14} color="#fff" />
                </View>
                <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
                  <ActivityIndicator size="small" color="#10B981" />
                  {apiLoading && <Text style={styles.typingText}>Memproses...</Text>}
                </View>
              </View>
            )}
          </ScrollView>

          {/* INPUT */}
          {renderBlurBackground(
            <View style={styles.inputArea}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.textInput, connectionStatus !== 'online' && styles.textInputDisabled]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder={
                    connectionStatus === 'online'
                      ? 'Tanyakan tentang kesehatan...'
                      : connectionStatus === 'connecting'
                      ? 'Menghubungkan ke server...'
                      : 'Koneksi terputus'
                  }
                  placeholderTextColor="#9CA3AF"
                  multiline
                />

                <TouchableOpacity
                  onPress={sendMessage}
                  disabled={!message.trim() || isTyping || connectionStatus !== 'online'}
                  style={[
                    styles.sendButton,
                    (!message.trim() || isTyping || connectionStatus !== 'online') &&
                      styles.sendButtonDisabled,
                  ]}
                  activeOpacity={0.85}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputHint} numberOfLines={1}>
                {connectionStatus === 'online'
                  ? `🟢 Terhubung ke ${API_BASE_URL}`
                  : connectionStatus === 'connecting'
                  ? '🟡 Menghubungkan...'
                  : '🔴 Koneksi terputus'}
              </Text>
            </View>,
            styles.inputBlur
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },

  modalContainer: {
    width: Math.min(SCREEN_WIDTH * 0.92, 520),
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.16,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.10)',
  },

  blurBackground: {
    overflow: 'hidden',
  },
  androidBlur: {
    backgroundColor: 'rgba(255,255,255,0.96)',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16,185,129,0.10)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },

  botAvatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botAvatarOnline: { backgroundColor: '#10B981' },
  botAvatarOffline: { backgroundColor: '#EF4444' },
  botAvatarConnecting: { backgroundColor: '#F59E0B' },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  dotOnline: { backgroundColor: '#10B981' },
  dotOffline: { backgroundColor: '#EF4444' },
  dotConnecting: { backgroundColor: '#F59E0B' },

  headerSubtitle: { fontSize: 12, fontWeight: '700' },
  statusOnline: { color: '#059669' },
  statusOffline: { color: '#DC2626' },
  statusConnecting: { color: '#B45309' },

  closeBtn: {
    paddingLeft: 10,
    paddingVertical: 4,
  },

  messagesContainer: {
    flexGrow: 0,
    maxHeight: SCREEN_HEIGHT * 0.55,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    maxWidth: '92%',
  },
  botRow: { alignSelf: 'flex-start' },
  userRow: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },

  botAvatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  bubble: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  botBubble: {
    backgroundColor: '#F8FAFC',
    borderColor: 'rgba(17,24,39,0.06)',
  },
  userBubble: {
    backgroundColor: '#10B981',
    borderColor: 'rgba(16,185,129,0.35)',
  },

  messageText: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  botText: { color: '#111827' },
  userText: { color: '#FFFFFF' },

  timeText: {
    marginTop: 6,
    fontSize: 11,
    opacity: 0.65,
    color: '#6B7280',
    fontWeight: '700',
  },
  timeTextUser: { color: 'rgba(255,255,255,0.85)' },

  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typingText: { fontSize: 12, color: '#6B7280', fontWeight: '700' },

  inputBlur: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(16,185,129,0.10)',
  },
  inputArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(248,250,252,0.9)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(16,185,129,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
    maxHeight: 110,
    paddingTop: 6,
    paddingBottom: 6,
  },
  textInputDisabled: { color: '#9CA3AF' },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  sendButtonDisabled: { backgroundColor: '#D1D5DB', shadowColor: '#9CA3AF' },

  inputHint: {
    marginTop: 8,
    fontSize: 11,
    textAlign: 'center',
    color: '#6B7280',
    fontWeight: '700',
    opacity: 0.8,
  },
});
