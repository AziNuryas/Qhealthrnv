import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'online' | 'offline'>('connecting');
  const [apiLoading, setApiLoading] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const scrollViewRef = useRef<ScrollView>(null);

  // API BASE
  const API_BASE_URL = 'https://nonabstractly-unmoaning-tameka.ngrok-free.dev';

  useEffect(() => {
    if (visible) {
      loadToken();
      testAPIConnection();

      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      slideAnim.setValue(30);
      backdropOpacity.setValue(0);

      // Entrance animation
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(fadeAnim, {
          toValue: 1,
          tension: 70,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 70,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 70,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      });
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 30,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const loadToken = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      console.log('✅ Token loaded:', token ? 'Available' : 'Not found');
      setUserToken(token);
    } catch (error) {
      console.error('❌ Token load error:', error);
    }
  };

  const testAPIConnection = async () => {
    try {
      setConnectionStatus('connecting');
      console.log('🔄 Testing API connection...');

      const startTime = Date.now();
      const testResponse = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'X-Mobile-Request': 'true',
        },
        body: JSON.stringify({ message: 'ping' }),
      });

      const responseTime = Date.now() - startTime;
      
      if (testResponse.ok) {
        setConnectionStatus('online');
        console.log(`✅ API Connection: ONLINE (${responseTime}ms)`);
      } else {
        setConnectionStatus('offline');
        console.log(`❌ API Connection: OFFLINE (HTTP ${testResponse.status})`);
      }
    } catch (error) {
      setConnectionStatus('offline');
      console.log('❌ API Connection Error:', error);
    }
  };

  const callChatAPI = async (userMessage: string): Promise<ChatAPIResponse> => {
    try {
      setApiLoading(true);
      console.log('🔄 Sending message to API...');

      const headers: any = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'X-Mobile-Request': 'true',
      };

      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }

      const startTime = Date.now();
      const response = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userMessage }),
      });

      const responseTime = Date.now() - startTime;
      console.log(`📡 API Response time: ${responseTime}ms`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data: ChatAPIResponse = await response.json();
      console.log('✅ API Response received:', { success: data.success, api: data.api });

      if (!data.success) {
        console.error('❌ API Response not successful:', data.error);
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

    const userMessageId = Date.now();
    const userMessage: Message = {
      id: userMessageId,
      text: message,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      const apiResponse = await callChatAPI(message);

      const aiMessage: Message = {
        id: Date.now(),
        text: apiResponse.reply,
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setConnectionStatus('online');
      
      // Scroll to bottom after adding message
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error: any) {
      console.error('❌ Chat error:', error.message);
      
      const errorMessage: Message = {
        id: Date.now(),
        text: `❌ **Gagal terhubung ke server**\n\nSilakan coba beberapa saat lagi. Pastikan koneksi internet Anda stabil.`,
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setConnectionStatus('offline');
      
      // Auto-retry connection
      setTimeout(() => testAPIConnection(), 2000);
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
          text: '👋 **Halo! Saya AI Health Assistant QHealth**\n\nSaya siap membantu Anda dengan berbagai topik kesehatan.\n\n💡 **Mohon pastikan:**\n1. Anda sudah login\n2. Koneksi internet stabil\n3. Server API aktif\n\nTanyakan apapun tentang kesehatan!',
          isUser: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setMessage('');
      setIsTyping(false);
      setConnectionStatus('connecting');
    }, 150);
  };

  const renderBlurBackground = (children: React.ReactNode, extraStyle?: any) => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView intensity={32} tint="light" style={[styles.blurBackground, extraStyle]}>
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
    <Modal 
      visible={visible} 
      transparent 
      animationType="none" 
      statusBarTranslucent
      hardwareAccelerated
    >
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
                  <Ionicons name="sparkles" size={20} color="#fff" />
                </View>

                <View style={styles.headerInfo}>
                  <Text style={styles.headerTitle} numberOfLines={1}>
                    AI Health Assistant
                  </Text>

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
                      {connectionStatus === 'online' && '• Terhubung ke API'}
                      {connectionStatus === 'offline' && '• Koneksi terputus'}
                      {connectionStatus === 'connecting' && '• Menghubungkan...'}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleClose} 
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={26} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}

          {/* MESSAGES */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 50);
            }}
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
                    <Ionicons name="sparkles" size={12} color="#fff" />
                  </View>
                )}

                <View 
                  style={[
                    styles.bubble, 
                    msg.isUser ? styles.userBubble : styles.botBubble,
                  ]}
                >
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
                  <Ionicons name="sparkles" size={12} color="#fff" />
                </View>
                <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
                  <ActivityIndicator size="small" color="#10B981" />
                  <Text style={styles.typingText}>
                    {apiLoading ? 'Memproses permintaan...' : 'Mengetik...'}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* INPUT */}
          {renderBlurBackground(
            <View style={styles.inputArea}>
              <View style={[
                styles.inputWrapper,
                connectionStatus !== 'online' && styles.inputWrapperDisabled
              ]}>
                <TextInput
                  style={[
                    styles.textInput, 
                    connectionStatus !== 'online' && styles.textInputDisabled,
                  ]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder={
                    connectionStatus === 'online'
                      ? 'Tanyakan tentang kesehatan...'
                      : connectionStatus === 'connecting'
                      ? 'Menghubungkan ke server...'
                      : 'Koneksi terputus - periksa internet'
                  }
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={500}
                  textAlignVertical="center"
                  editable={connectionStatus === 'online'}
                  onSubmitEditing={sendMessage}
                  blurOnSubmit={false}
                  returnKeyType="send"
                />

                <TouchableOpacity
                  onPress={sendMessage}
                  disabled={!message.trim() || isTyping || connectionStatus !== 'online'}
                  style={[
                    styles.sendButton,
                    (!message.trim() || isTyping || connectionStatus !== 'online') &&
                      styles.sendButtonDisabled,
                  ]}
                  activeOpacity={0.9}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <Ionicons 
                    name="send" 
                    size={16} 
                    color={
                      (!message.trim() || isTyping || connectionStatus !== 'online') 
                        ? "#9CA3AF" 
                        : "#fff"
                    } 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputFooter}>
                <Text style={styles.inputHint} numberOfLines={1}>
                  {connectionStatus === 'online'
                    ? `🟢 Terhubung • Enter untuk kirim`
                    : connectionStatus === 'connecting'
                    ? '🟡 Menghubungkan...'
                    : '🔴 Periksa koneksi internet'}
                </Text>
                {message.length > 0 && (
                  <Text style={styles.charCount}>
                    {message.length}/500
                  </Text>
                )}
              </View>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: Math.min(SCREEN_WIDTH * 0.9, 500),
    maxHeight: SCREEN_HEIGHT * 0.82,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.15)',
  },
  blurBackground: {
    overflow: 'hidden',
  },
  androidBlur: {
    backgroundColor: 'rgba(255,255,255,0.98)',
  },
  // HEADER
  header: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16,185,129,0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerInfo: {
    flex: 1,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botAvatarOnline: { backgroundColor: '#10B981' },
  botAvatarOffline: { backgroundColor: '#EF4444' },
  botAvatarConnecting: { backgroundColor: '#F59E0B' },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  dotOnline: { backgroundColor: '#10B981' },
  dotOffline: { backgroundColor: '#EF4444' },
  dotConnecting: { backgroundColor: '#F59E0B' },
  headerSubtitle: { 
    fontSize: 11, 
    fontWeight: '600',
  },
  statusOnline: { color: '#059669' },
  statusOffline: { color: '#DC2626' },
  statusConnecting: { color: '#B45309' },
  closeBtn: {
    paddingLeft: 8,
  },
  // MESSAGES
  messagesContainer: {
    flexGrow: 1,
    maxHeight: SCREEN_HEIGHT * 0.6,
    minHeight: 200,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  botRow: { 
    alignSelf: 'flex-start' 
  },
  userRow: { 
    alignSelf: 'flex-end', 
    flexDirection: 'row-reverse' 
  },
  botAvatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    marginRight: 8,
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: '85%',
  },
  botBubble: {
    backgroundColor: '#F8FAFC',
    borderColor: 'rgba(17,24,39,0.08)',
  },
  userBubble: {
    backgroundColor: '#10B981',
    borderColor: 'rgba(16,185,129,0.3)',
  },
  messageText: { 
    fontSize: 14.5, 
    lineHeight: 20, 
    fontWeight: '500',
  },
  botText: { color: '#1F2937' },
  userText: { color: '#FFFFFF' },
  timeText: {
    marginTop: 4,
    fontSize: 10,
    opacity: 0.7,
    color: '#6B7280',
    fontWeight: '600',
    alignSelf: 'flex-end',
  },
  timeTextUser: { color: 'rgba(255,255,255,0.9)' },
  typingBubble: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  typingText: { 
    fontSize: 13, 
    color: '#6B7280', 
    fontWeight: '600',
    marginLeft: 4,
  },
  // INPUT
  inputBlur: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(16,185,129,0.1)',
  },
  inputArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248,250,252,0.95)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
    minHeight: 50,
  },
  inputWrapperDisabled: {
    backgroundColor: 'rgba(248,250,252,0.7)',
    borderColor: 'rgba(156,163,175,0.3)',
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#111827',
    fontWeight: '500',
    maxHeight: 100,
    minHeight: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 6,
    paddingBottom: Platform.OS === 'ios' ? 8 : 6,
    paddingHorizontal: 0,
  },
  textInputDisabled: { 
    color: '#9CA3AF',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: { 
    backgroundColor: 'rgba(209,213,219,0.8)',
    shadowColor: 'transparent',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  inputHint: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    opacity: 0.8,
    flex: 1,
  },
  charCount: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    marginLeft: 8,
  },
});