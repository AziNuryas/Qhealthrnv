import NewPostModal from '@/components/NewPostModal';
import { Answer, createQuestion, getQuestions, postAnswer, Question } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const LIKE_STORAGE_KEY = '@qhealth_liked_questions';
const LIKE_ANSWERS_KEY = '@qhealth_liked_answers';

const loadLikedQuestions = async (): Promise<number[]> => {
  try {
    const stored = await AsyncStorage.getItem(LIKE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLikedQuestions = async (list: number[]) => {
  await AsyncStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(list));
};

const loadLikedAnswers = async (): Promise<string[]> => {
  try {
    const stored = await AsyncStorage.getItem(LIKE_ANSWERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLikedAnswers = async (list: string[]) => {
  await AsyncStorage.setItem(LIKE_ANSWERS_KEY, JSON.stringify(list));
};

// Floating Notification Badge Component
const NotificationBadge = ({ count }: { count: number }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 8,
      useNativeDriver: true,
    }).start();

    if (count > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [count, scaleAnim, pulseAnim]);

  if (count === 0) return null;

  return (
    <Animated.View
      style={[
        styles.notificationBadge,
        {
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim }
          ]
        }
      ]}
    >
      <LinearGradient
        colors={['#EF4444', '#DC2626']}
        style={styles.badgeGradient}
      >
        <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
      </LinearGradient>
      <Animated.View style={[
        styles.badgeGlow,
        {
          opacity: pulseAnim.interpolate({
            inputRange: [1, 1.2],
            outputRange: [0.3, 0.6]
          })
        }
      ]} />
    </Animated.View>
  );
};

// Mini Filter Tab Component - Lebih kecil dan di pojok kanan
const MiniFilterTab = ({ 
  active, 
  label, 
  icon, 
  onPress 
}: { 
  active: boolean; 
  label: string; 
  icon: string; 
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      tension: 300,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <BlurView
          intensity={active ? 35 : 25}
          tint="light"
          style={[
            styles.miniFilterTab,
            active && styles.miniFilterTabActive
          ]}
        >
          <LinearGradient
            colors={active ? 
              ['rgba(16, 185, 129, 0.9)', 'rgba(5, 150, 105, 0.9)'] :
              ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.5)']
            }
            style={styles.miniFilterTabGradient}
          >
            <Ionicons 
              name={icon as any} 
              size={14} 
              color={active ? '#FFFFFF' : '#10B981'} 
              style={{ marginRight: 4 }}
            />
            <Text style={[
              styles.miniFilterTabText,
              active && styles.miniFilterTabTextActive
            ]}>
              {label}
            </Text>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Small Action Button untuk Like, Jawab, dan Lihat
const BottomActionButton = ({ 
  icon, 
  label, 
  count, 
  active, 
  color,
  onPress 
}: { 
  icon: string; 
  label: string; 
  count?: number; 
  active?: boolean; 
  color: string;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        tension: 300,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={styles.bottomActionButton}>
          <Ionicons 
            name={icon as any} 
            size={16} 
            color={active ? color : color + 'CC'} 
          />
          <View style={styles.bottomActionTextContainer}>
            <Text style={[styles.bottomActionLabel, { color }]}>
              {label}
            </Text>
            {count !== undefined && count > 0 && (
              <Text style={[styles.bottomActionCount, { color }]}>
                {count > 99 ? '99+' : count}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Component untuk menampilkan jawaban dengan animasi fade up
const AnswerItem = ({ 
  answer, 
  questionId, 
  index 
}: { 
  answer: Answer & { user_has_liked?: boolean; likes_count?: number };
  questionId: number;
  index: number;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  
  useEffect(() => {
    // Animate in when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        tension: 250,
        friction: 25,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatTime = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);

      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins} menit lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      return 'Kemarin';
    } catch {
      return 'Waktu tidak valid';
    }
  }, []);

  const getInitials = useCallback((name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }, []);

  return (
    <Animated.View
      style={[
        styles.answerItemContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }]
        }
      ]}
    >
      <BlurView intensity={20} tint="light" style={styles.answerGlass}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.98)']}
          style={styles.answerContent}
        >
          <View style={styles.answerHeader}>
            <LinearGradient
              colors={['#34D399', '#10B981']}
              style={styles.answerAvatar}
            >
              <Text style={styles.answerInitials}>
                {getInitials(answer.user?.name || 'U')}
              </Text>
            </LinearGradient>
            <View style={styles.answerUserInfo}>
              <Text style={styles.answerUserName}>
                {answer.user?.name || 'Pengguna'}
              </Text>
              <Text style={styles.answerTime}>
                {formatTime(answer.created_at)}
              </Text>
            </View>
            <View style={styles.answerStats}>
              <Ionicons 
                name="heart-outline" 
                size={14} 
                color="#9CA3AF" 
              />
              <Text style={styles.answerLikesCount}>
                {answer.likes_count || 0}
              </Text>
            </View>
          </View>
          
          <Text style={styles.answerBody}>
            {answer.body}
          </Text>
          
          <View style={styles.answerActions}>
            <TouchableOpacity style={styles.answerActionButton}>
              <Ionicons name="heart-outline" size={14} color="#9CA3AF" />
              <Text style={styles.answerActionText}>Suka</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.answerActionButton}>
              <Ionicons name="chatbubble-outline" size={14} color="#9CA3AF" />
              <Text style={styles.answerActionText}>Balas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.answerActionButton}>
              <Ionicons name="share-outline" size={14} color="#9CA3AF" />
              <Text style={styles.answerActionText}>Bagikan</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

// Component untuk animasi munculnya section jawaban
const AnswersSection = ({ 
  answers, 
  questionId, 
  isVisible 
}: { 
  answers: (Answer & { user_has_liked?: boolean; likes_count?: number })[];
  questionId: number;
  isVisible: boolean;
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(heightAnim, {
          toValue: 1,
          tension: 200,
          friction: 20,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(heightAnim, {
          toValue: 0,
          tension: 200,
          friction: 20,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setShouldRender(false);
      });
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  const estimatedHeight = answers.length * 120; // Perkiraan tinggi per jawaban

  return (
    <Animated.View
      style={[
        styles.answersSection,
        {
          opacity: fadeAnim,
          height: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, estimatedHeight]
          })
        }
      ]}
    >
      <View style={styles.answersHeader}>
        <Text style={styles.answersTitle}>Jawaban ({answers.length})</Text>
      </View>
      
      {answers.map((answer, idx) => (
        <AnswerItem
          key={answer.id}
          answer={answer}
          questionId={questionId}
          index={idx}
        />
      ))}
    </Animated.View>
  );
};

export default function DiskusiScreen() {
  const [questions, setQuestions] = useState<(Question & { user_has_liked?: boolean; likes_count?: number; answers?: (Answer & { user_has_liked?: boolean; likes_count?: number })[] })[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recent' | 'popular' | 'unanswered'>('recent');
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  
  // Animations
  const headerScale = useRef(new Animated.Value(0.9)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const cardsSlide = useRef(new Animated.Value(50)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0)).current;
  const fabGlow = useRef(new Animated.Value(0)).current;

  const loadQuestions = useCallback(async (token: string | null) => {
    try {
      setLoading(true);
      const data = await getQuestions(token || undefined);
      
      const likedQuestions = await loadLikedQuestions();
      const likedAnswers = await loadLikedAnswers();
      
      const merged = data.map(q => ({
        ...q,
        user_has_liked: likedQuestions.includes(q.id),
        likes_count: (q.likes_count || 0) + (likedQuestions.includes(q.id) ? 1 : 0),
        answers: (q.answers || []).map(a => ({
          ...a,
          user_has_liked: likedAnswers.includes(`${q.id}_${a.id}`),
          likes_count: ((a as any).likes_count || 0) + (likedAnswers.includes(`${q.id}_${a.id}`) ? 1 : 0),
        })),
      }));

      setQuestions(merged);
    } catch (error) {
      console.error('Error loading questions:', error);
      Alert.alert('Error', 'Gagal memuat pertanyaan');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const initializeScreen = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      setUserToken(token);
      await loadQuestions(token);
    } catch (error) {
      console.error('Initialize error:', error);
      setLoading(false);
    }
  }, [loadQuestions]);

  useEffect(() => {
    initializeScreen();
  }, [initializeScreen]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadQuestions(userToken);
  }, [userToken, loadQuestions]);

  const handleNewPost = async (postData: { title: string; content: string; category: string }) => {
    if (!userToken) {
      Alert.alert('Error', 'Anda harus login terlebih dahulu');
      return;
    }

    try {
      const newQuestion = await createQuestion(userToken, {
        title: postData.title,
        body: postData.content,
      });

      setQuestions(prev => [newQuestion, ...prev]);
      setShowNewPost(false);
      
      Alert.alert('✅ Berhasil', 'Pertanyaan berhasil diposting!');
    } catch {
      Alert.alert('Error', 'Gagal memposting pertanyaan');
    }
  };

  const handleLike = async (questionId: number) => {
    try {
      const liked = await loadLikedQuestions();
      const updated = liked.includes(questionId) 
        ? liked.filter(id => id !== questionId)
        : [...liked, questionId];
      
      await saveLikedQuestions(updated);
      
      setQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              user_has_liked: updated.includes(questionId),
              likes_count: (q.likes_count || 0) + (updated.includes(questionId) ? 1 : -1)
            }
          : q
      ));
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleAnswerLike = async (questionId: number, answerId: number) => {
    try {
      const key = `${questionId}_${answerId}`;
      const liked = await loadLikedAnswers();
      const updated = liked.includes(key)
        ? liked.filter(id => id !== key)
        : [...liked, key];
      
      await saveLikedAnswers(updated);
      
      setQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? {
              ...q,
              answers: q.answers?.map(a =>
                a.id === answerId
                  ? {
                      ...a,
                      user_has_liked: updated.includes(key),
                      likes_count: (a.likes_count || 0) + (updated.includes(key) ? 1 : -1)
                    }
                  : a
              )
            }
          : q
      ));
    } catch (error) {
      console.error('Error handling answer like:', error);
    }
  };

  const toggleAnswers = useCallback((questionId: number) => {
    setExpandedQuestion(prev => prev === questionId ? null : questionId);
  }, []);

  const handleAnswerSubmit = async () => {
    if (!selectedQuestion) return;
    if (!answerContent.trim()) {
      Alert.alert('Error', 'Jawaban tidak boleh kosong.');
      return;
    }

    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      Alert.alert('Error', 'Sesi login berakhir. Silakan login kembali.');
      return;
    }

    try {
      setSubmittingAnswer(true);
      await postAnswer(token, selectedQuestion.id, answerContent);
      
      await loadQuestions(token);
      setShowAnswerModal(false);
      setAnswerContent('');
      setSelectedQuestion(null);
      Alert.alert('Sukses', 'Jawaban berhasil dikirim!');
    } catch {
      Alert.alert('Error', 'Gagal mengirim jawaban');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const formatTime = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return 'Waktu tidak valid';
    }
  }, []);

  const getInitials = useCallback((name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }, []);

  const getAvatarColor = useCallback((name: string): [string, string] => {
    const colors: [string, string][] = [
      ['#10B981', '#059669'],
      ['#34D399', '#10B981'],
      ['#059669', '#047857'],
      ['#10B981', '#34D399'],
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  }, []);

  const filteredQuestions = questions.filter(q => {
    if (activeTab === 'popular') return (q.likes_count || 0) > 5;
    if (activeTab === 'unanswered') return (q.answers?.length || 0) === 0;
    return true;
  });

  const handleFabPress = () => {
    Animated.sequence([
      Animated.spring(fabScale, {
        toValue: 0.8,
        tension: 250,
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
      setShowNewPost(true);
    });
  };

  // Animate entrance
  useEffect(() => {
    const entranceAnimation = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(headerScale, {
            toValue: 1,
            tension: 80,
            friction: 12,
            useNativeDriver: true,
          }),
          Animated.timing(headerOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.spring(cardsSlide, {
            toValue: 0,
            tension: 60,
            friction: 12,
            delay: 100,
            useNativeDriver: true,
          }),
          Animated.timing(cardsOpacity, {
            toValue: 1,
            duration: 600,
            delay: 100,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),

        Animated.spring(fabScale, {
          toValue: 1,
          tension: 100,
          friction: 12,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const timer = setTimeout(entranceAnimation, 200);
    return () => clearTimeout(timer);
  }, []);

  // FAB glow animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabGlow, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(fabGlow, {
          toValue: 0.3,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fabGlow]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#F0FDF4', '#D1FAE5', '#A7F3D0']}
          style={styles.background}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Memuat diskusi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
      
      <LinearGradient
        colors={['#F0FDF4', '#D1FAE5', '#A7F3D0']}
        style={styles.background}
      />

      <View style={styles.container}>
        {/* Header */}
        <Animated.View 
          style={[
            styles.headerContainer,
            {
              opacity: headerOpacity,
              transform: [{ scale: headerScale }]
            }
          ]}
        >
          <BlurView intensity={30} tint="light" style={styles.glassHeader}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                  <BlurView intensity={35} tint="light" style={styles.headerLogoContainer}>
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={styles.headerLogo}
                    >
                      <Ionicons name="chatbubbles" size={22} color="#FFF" />
                    </LinearGradient>
                  </BlurView>
                  <View>
                    <Text style={styles.headerTitle}>Forum Diskusi</Text>
                    <Text style={styles.headerSubtitle}>
                      {filteredQuestions.length} topik
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.headerButton}>
                  <Ionicons name="notifications-outline" size={20} color="#065F46" />
                </TouchableOpacity>
              </View>

              {/* Mini Filter Tabs di pojok kanan */}
              <View style={styles.miniFilterContainer}>
                <MiniFilterTab
                  active={activeTab === 'recent'}
                  label="Terbaru"
                  icon="time"
                  onPress={() => setActiveTab('recent')}
                />
                <MiniFilterTab
                  active={activeTab === 'popular'}
                  label="Populer"
                  icon="flame"
                  onPress={() => setActiveTab('popular')}
                />
                <MiniFilterTab
                  active={activeTab === 'unanswered'}
                  label="Belum Dijawab"
                  icon="help-circle"
                  onPress={() => setActiveTab('unanswered')}
                />
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>

        {/* Content */}
        <Animated.ScrollView
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
          <Animated.View
            style={[
              styles.questionsContainer,
              {
                opacity: cardsOpacity,
                transform: [{ translateY: cardsSlide }]
              }
            ]}
          >
            {filteredQuestions.length === 0 ? (
              <View style={styles.emptyState}>
                <BlurView intensity={25} tint="light" style={styles.emptyCard}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.98)']}
                    style={styles.emptyContent}
                  >
                    <Ionicons name="chatbubble-outline" size={48} color="#10B981" />
                    <Text style={styles.emptyTitle}>
                      {activeTab === 'unanswered' ? 'Semua terjawab! 🎉' : 'Belum ada diskusi'}
                    </Text>
                    <Text style={styles.emptyText}>
                      {activeTab === 'unanswered' 
                        ? 'Semua pertanyaan sudah terjawab'
                        : 'Jadilah yang pertama memulai diskusi'
                      }
                    </Text>
                  </LinearGradient>
                </BlurView>
              </View>
            ) : (
              filteredQuestions.map((question, index) => (
                <Animated.View
                  key={question.id}
                  style={[
                    styles.questionCardWrapper,
                    {
                      opacity: cardsOpacity,
                      transform: [{
                        translateY: cardsSlide.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, 20 - (index * 2)]
                        })
                      }]
                    }
                  ]}
                >
                  <BlurView intensity={25} tint="light" style={styles.questionGlass}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.98)']}
                      style={styles.questionContent}
                    >
                      {/* Question Header */}
                      <View style={styles.questionHeader}>
                        <BlurView intensity={30} tint="light" style={styles.avatarContainer}>
                          <LinearGradient
                            colors={getAvatarColor(question.user?.name || 'User')}
                            style={styles.userAvatar}
                          >
                            <Text style={styles.userInitials}>
                              {getInitials(question.user?.name || 'U')}
                            </Text>
                          </LinearGradient>
                        </BlurView>
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>
                            {question.user?.name || 'Pengguna'}
                          </Text>
                          <View style={styles.timeBadge}>
                            <Ionicons name="time-outline" size={10} color="#10B981" />
                            <Text style={styles.timeText}>
                              {formatTime(question.created_at)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Question Content */}
                      <Text style={styles.questionTitle} numberOfLines={2}>
                        {question.title}
                      </Text>
                      {question.body && (
                        <Text style={styles.questionBody} numberOfLines={3}>
                          {question.body}
                        </Text>
                      )}

                      {/* Bottom Action Buttons: Like, Jawab, Lihat */}
                      <View style={styles.bottomActionRow}>
                        <BottomActionButton
                          icon={question.user_has_liked ? "heart" : "heart-outline"}
                          label="Like"
                          count={question.likes_count}
                          active={question.user_has_liked}
                          color="#EF4444"
                          onPress={() => handleLike(question.id)}
                        />
                        
                        <BottomActionButton
                          icon="pencil"
                          label="Jawab"
                          color="#3B82F6"
                          onPress={() => {
                            setSelectedQuestion(question);
                            setShowAnswerModal(true);
                          }}
                        />
                        
                        <BottomActionButton
                          icon={expandedQuestion === question.id ? "chevron-up" : "chevron-down"}
                          label="Lihat"
                          count={question.answers?.length}
                          active={expandedQuestion === question.id}
                          color="#10B981"
                          onPress={() => toggleAnswers(question.id)}
                        />
                      </View>

                      {/* Answers Section - TETAP ADA setelah diklik */}
                      {question.answers && question.answers.length > 0 && (
                        <AnswersSection
                          answers={question.answers}
                          questionId={question.id}
                          isVisible={expandedQuestion === question.id}
                        />
                      )}
                    </LinearGradient>
                  </BlurView>
                </Animated.View>
              ))
            )}
            <View style={{ height: 120 }} />
          </Animated.View>
        </Animated.ScrollView>

        {/* Floating Action Button */}
        <Animated.View
          style={[
            styles.fabContainer,
            {
              transform: [
                { scale: fabScale },
                {
                  scale: fabGlow.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.05]
                  })
                }
              ]
            }
          ]}
        >
          <BlurView intensity={40} tint="light" style={styles.fabBlur}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
              style={styles.fabGlass}
            >
              <TouchableOpacity
                style={styles.fabButton}
                onPress={handleFabPress}
                activeOpacity={0.9}
              >
                <View style={styles.fabGlowEffect} />
                <LinearGradient
                  colors={['#10B981', '#059669', '#047857']}
                  style={styles.fabGradient}
                >
                  <Ionicons name="create" size={22} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>
        </Animated.View>

        {/* Modals */}
        <NewPostModal
          visible={showNewPost}
          onClose={() => setShowNewPost(false)}
          onSubmit={handleNewPost}
        />

        {/* Answer Modal */}
        <Modal
          visible={showAnswerModal}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowAnswerModal(false);
            setSelectedQuestion(null);
            setAnswerContent('');
          }}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={40} tint="light" style={styles.modalBlur}>
              <Animated.View 
                style={[
                  styles.modalContainer,
                  {
                    transform: [{
                      translateY: cardsSlide.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, 20]
                      })
                    }]
                  }
                ]}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.98)']}
                  style={styles.modalContent}
                >
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <View style={styles.modalTitleContainer}>
                      <BlurView intensity={30} tint="light" style={styles.modalIconContainer}>
                        <LinearGradient
                          colors={['#10B981', '#059669']}
                          style={styles.modalIcon}
                        >
                          <Ionicons name="chatbubble-ellipses" size={18} color="#FFF" />
                        </LinearGradient>
                      </BlurView>
                      <Text style={styles.modalTitle}>Berikan Jawaban</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setShowAnswerModal(false);
                        setSelectedQuestion(null);
                        setAnswerContent('');
                      }}
                      style={styles.modalCloseButton}
                    >
                      <Ionicons name="close-circle" size={26} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  {/* Question Preview */}
                  {selectedQuestion && (
                    <View style={styles.modalQuestionPreview}>
                      <BlurView intensity={25} tint="light" style={styles.modalQuestionAvatarContainer}>
                        <LinearGradient
                          colors={getAvatarColor(selectedQuestion.user?.name || 'User')}
                          style={styles.modalQuestionAvatar}
                        >
                          <Text style={styles.modalQuestionInitials}>
                            {getInitials(selectedQuestion.user?.name || 'U')}
                          </Text>
                        </LinearGradient>
                      </BlurView>
                      <View style={styles.modalQuestionContent}>
                        <Text style={styles.modalQuestionUserName}>
                          {selectedQuestion.user?.name || 'Pengguna'}
                        </Text>
                        <Text style={styles.modalQuestionTitle} numberOfLines={2}>
                          {selectedQuestion.title}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Answer Input */}
                  <View style={styles.answerInputContainer}>
                    <Text style={styles.answerInputLabel}>Jawaban Anda:</Text>
                    <BlurView intensity={20} tint="light" style={styles.answerInputWrapper}>
                      <TextInput
                        style={styles.answerInput}
                        placeholder="Tulis jawaban yang informatif dan membantu..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                        value={answerContent}
                        onChangeText={setAnswerContent}
                        maxLength={1000}
                      />
                    </BlurView>
                    <Text style={styles.charCounter}>
                      {answerContent.length}/1000 karakter
                    </Text>
                  </View>

                  {/* Modal Actions */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.modalCancelButton}
                      onPress={() => {
                        setShowAnswerModal(false);
                        setSelectedQuestion(null);
                        setAnswerContent('');
                      }}
                    >
                      <Text style={styles.modalCancelText}>Batal</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.modalSubmitButton,
                        (!answerContent.trim() || submittingAnswer) && styles.modalSubmitButtonDisabled
                      ]}
                      onPress={handleAnswerSubmit}
                      disabled={!answerContent.trim() || submittingAnswer}
                    >
                      <LinearGradient
                        colors={(!answerContent.trim() || submittingAnswer) ? 
                          ['#9CA3AF', '#6B7280'] : 
                          ['#10B981', '#059669']
                        }
                        style={styles.modalSubmitGradient}
                      >
                        {submittingAnswer ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <>
                            <Ionicons name="send" size={16} color="#FFF" />
                            <Text style={styles.modalSubmitText}>Kirim Jawaban</Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </Animated.View>
            </BlurView>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#10B981',
    fontWeight: '600',
  },

  // Header
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 12,
    zIndex: 90,
  },
  glassHeader: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  headerGradient: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogoContainer: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  headerLogo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#065F46',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#059669',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },

  // Mini Filter Container di pojok kanan
  miniFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  miniFilterTab: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    minWidth: 90,
  },
  miniFilterTabActive: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  miniFilterTabGradient: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniFilterTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  miniFilterTabTextActive: {
    color: '#FFFFFF',
  },

  // Notification Badge
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    zIndex: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeGradient: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  badgeGlow: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    zIndex: -1,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  questionsContainer: {
    paddingHorizontal: 16,
  },

  // Question Card
  questionCardWrapper: {
    marginBottom: 12,
  },
  questionGlass: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 6,
  },
  questionContent: {
    padding: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  avatarContainer: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#065F46',
    lineHeight: 22,
    marginBottom: 8,
  },
  questionBody: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },

  // Bottom Action Buttons
  bottomActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.3)',
  },
  bottomActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bottomActionTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bottomActionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomActionCount: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Answers Section dengan animasi
  answersSection: {
    marginTop: 16,
    overflow: 'hidden',
  },
  answersHeader: {
    marginBottom: 12,
  },
  answersTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },

  // Answer Item dengan animasi fade up
  answerItemContainer: {
    marginBottom: 10,
  },
  answerGlass: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  answerContent: {
    padding: 16,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  answerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerInitials: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  answerUserInfo: {
    flex: 1,
  },
  answerUserName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
  },
  answerTime: {
    fontSize: 11,
    color: '#059669',
    marginTop: 2,
  },
  answerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  answerLikesCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  answerBody: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  answerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.3)',
    paddingTop: 10,
  },
  answerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  answerActionText: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Empty State
  emptyState: {
    padding: 40,
  },
  emptyCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  emptyContent: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    lineHeight: 20,
  },

  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 90,
    right: 16,
    zIndex: 1000,
  },
  fabBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  fabGlass: {
    padding: 2,
    borderRadius: 24,
  },
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  fabGlowEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#10B981',
    opacity: 0.3,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBlur: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalContainer: {
    maxHeight: screenHeight * 0.8,
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.3)',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalIconContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalQuestionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  modalQuestionAvatarContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalQuestionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalQuestionInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalQuestionContent: {
    flex: 1,
  },
  modalQuestionUserName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  modalQuestionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
    lineHeight: 18,
  },
  answerInputContainer: {
    marginBottom: 20,
  },
  answerInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  answerInputWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  answerInput: {
    padding: 14,
    fontSize: 14,
    color: '#065F46',
    textAlignVertical: 'top',
    minHeight: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  charCounter: {
    textAlign: 'right',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalSubmitButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalSubmitButtonDisabled: {
    opacity: 0.7,
  },
  modalSubmitGradient: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});