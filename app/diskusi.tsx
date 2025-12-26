import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewPostModal from './../components/NewPostModal';
import { getQuestions, createQuestion, postAnswer, Question } from './../lib/api';

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

interface AnswerItemProps {
  answer: any;
  answerIdx: number;
  questionId: number;
  handleAnswerLike: (questionId: number, answerId: number) => void;
  formatTime: (dateString: string) => string;
  getAvatarColor: (name: string) => readonly [string, string];
  getInitials: (name: string) => string;
}

const AnswerItem: React.FC<AnswerItemProps> = React.memo(({ 
  answer, 
  answerIdx, 
  questionId,
  handleAnswerLike,
  formatTime,
  getAvatarColor,
  getInitials
}) => {
  const answerAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(answerAnim, {
      toValue: 1,
      tension: 60,
      friction: 10,
      delay: answerIdx * 100,
      useNativeDriver: true,
    }).start();
  }, [answerIdx, answerAnim]);

  return (
    <Animated.View
      style={[
        styles.answerItem,
        {
          opacity: answerAnim,
          transform: [{
            translateX: answerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })
          }]
        }
      ]}
    >
      <View style={styles.answerHeader}>
        <LinearGradient
          colors={getAvatarColor(answer.user?.name || 'User')}
          style={styles.answerAvatar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.answerAvatarText}>
            {getInitials(answer.user?.name || 'U')}
          </Text>
        </LinearGradient>
        
        <View style={styles.answerContentWrapper}>
          <View style={styles.answerMeta}>
            <Text style={styles.answerUserName} numberOfLines={1}>
              {answer.user?.name || 'Pengguna'}
            </Text>
            <Text style={styles.answerTime}>· {formatTime(answer.created_at)}</Text>
          </View>
          
          <Text style={styles.answerBody} numberOfLines={4}>
            {answer.body}
          </Text>
          
          <TouchableOpacity 
            style={styles.answerLikeButton}
            onPress={() => handleAnswerLike(questionId, answer.id)}
            activeOpacity={0.7}
            accessibilityLabel="Like answer"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons 
              name={answer.user_has_liked ? "heart" : "heart-outline"} 
              size={14} 
              color={answer.user_has_liked ? "#EF4444" : "#9CA3AF"} 
            />
            {(answer.likes_count || 0) > 0 && (
              <Text style={[
                styles.answerLikeCount,
                answer.user_has_liked && styles.answerLikeCountActive
              ]}>
                {answer.likes_count}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
});

AnswerItem.displayName = 'AnswerItem';

export default function DiskusiScreen() {
  const [questions, setQuestions] = useState<Question[]>([]);
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
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const answerSlideAnim = useRef(new Animated.Value(0)).current;

  const loadQuestions = useCallback(async (token: string | null) => {
    try {
      setLoading(true);
      const data = await getQuestions(token);
      
      const likedQuestions = await loadLikedQuestions();
      const likedAnswers = await loadLikedAnswers();
      
      const merged = data.map(q => {
        const isQuestionLiked = likedQuestions.includes(q.id);
        
        return {
          ...q,
          user_has_liked: isQuestionLiked,
          likes_count: isQuestionLiked ? (q.likes_count || 0) + 1 : (q.likes_count || 0),
          answers: q.answers?.map(a => {
            const key = `${q.id}_${a.id}`;
            const isAnswerLiked = likedAnswers.includes(key);
            
            return {
              ...a,
              user_has_liked: isAnswerLiked,
              likes_count: isAnswerLiked ? (a.likes_count || 0) + 1 : (a.likes_count || 0),
            };
          }) || [],
        };
      });

      setQuestions(merged);
    } catch (error) {
      console.error('❌ Load questions error:', error);
      Alert.alert('Error', 'Gagal memuat pertanyaan');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const animateEntrance = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  const initializeScreen = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      setUserToken(token);
      await loadQuestions(token);
      
      const likedQuestions = await loadLikedQuestions();
      const likedAnswers = await loadLikedAnswers();

      setQuestions(prev =>
        prev.map(q => ({
          ...q,
          user_has_liked: likedQuestions.includes(q.id),
          answers: q.answers?.map(a => ({
            ...a,
            user_has_liked: likedAnswers.includes(`${q.id}_${a.id}`),
          })),
        }))
      );

      animateEntrance();
    } catch (error) {
      console.error('❌ Initialize error:', error);
      setLoading(false);
    }
  }, [loadQuestions, animateEntrance]);

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
      
      let updated: number[];
      let newLikesCount = 0;
      
      if (liked.includes(questionId)) {
        updated = liked.filter(id => id !== questionId);
        newLikesCount = -1;
      } else {
        updated = [...liked, questionId];
        newLikesCount = 1;
      }
      
      await saveLikedQuestions(updated);
      
      setQuestions(prev =>
        prev.map(q => {
          if (q.id === questionId) {
            const currentLikes = q.likes_count || 0;
            return {
              ...q,
              user_has_liked: updated.includes(questionId),
              likes_count: currentLikes + newLikesCount,
            };
          }
          return q;
        })
      );
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleAnswerLike = async (questionId: number, answerId: number) => {
    try {
      const key = `${questionId}_${answerId}`;
      const liked = await loadLikedAnswers();
      
      let updated: string[];
      let newLikesCount = 0;
      
      if (liked.includes(key)) {
        updated = liked.filter(id => id !== key);
        newLikesCount = -1;
      } else {
        updated = [...liked, key];
        newLikesCount = 1;
      }
      
      await saveLikedAnswers(updated);
      
      setQuestions(prev =>
        prev.map(q => {
          if (q.id === questionId) {
            return {
              ...q,
              answers: q.answers?.map(a => {
                if (a.id === answerId) {
                  const currentLikes = a.likes_count || 0;
                  return {
                    ...a,
                    user_has_liked: updated.includes(key),
                    likes_count: currentLikes + newLikesCount,
                  };
                }
                return a;
              }),
            };
          }
          return q;
        })
      );
    } catch (error) {
      console.error('Error handling answer like:', error);
    }
  };

  const toggleAnswers = useCallback((questionId: number) => {
    if (expandedQuestion === questionId) {
      Animated.timing(answerSlideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setExpandedQuestion(null);
      });
    } else {
      setExpandedQuestion(questionId);
      setTimeout(() => {
        Animated.spring(answerSlideAnim, {
          toValue: 1,
          tension: 60,
          friction: 12,
          useNativeDriver: true,
        }).start();
      }, 100);
    }
  }, [expandedQuestion, answerSlideAnim]);

  const openAnswerModal = (question: Question) => {
    setSelectedQuestion(question);
    setShowAnswerModal(true);
  };

  const handleAnswerSubmit = async () => {
    if (!selectedQuestion) {
      Alert.alert('Error', 'Pertanyaan tidak ditemukan.');
      return;
    }

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
      await postAnswer(token, selectedQuestion.id, {
        body: answerContent,
      });

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
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, []);

  const getAvatarColor = useCallback((name: string) => {
    const colors = [
      ['#10B981', '#059669'] as const,
      ['#34D399', '#10B981'] as const,
      ['#059669', '#047857'] as const,
      ['#10B981', '#34D399'] as const,
      ['#34D399', '#059669'] as const,
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  }, []);

  const filteredQuestions = questions.filter(q => {
    if (activeTab === 'popular') return (q.likes_count || 0) > 10;
    if (activeTab === 'unanswered') return (q.answers_count || 0) === 0;
    return true;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Memuat diskusi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="chatbubbles" size={28} color="#10B981" />
            <View>
              <Text style={styles.headerTitle}>Diskusi</Text>
              <Text style={styles.headerSubtitle}>{questions.length} topik</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.newPostButton}
            onPress={() => setShowNewPost(true)}
            activeOpacity={0.7}
            accessibilityLabel="Buat diskusi baru"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add-circle" size={32} color="#10B981" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          {[
            { id: 'recent' as const, label: 'Terbaru' },
            { id: 'popular' as const, label: 'Popular' },
            { id: 'unanswered' as const, label: 'Belum Terjawab' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.tabActive
              ]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

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
        {filteredQuestions.length === 0 ? (
          <Animated.View 
            style={[
              styles.emptyState,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrapper}>
                <Ionicons name="chatbubble-outline" size={48} color="#10B981" />
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === 'unanswered' ? 'Semua terjawab! 🎉' : 'Belum ada diskusi'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'unanswered' 
                  ? 'Luar biasa! Semua pertanyaan sudah terjawab'
                  : 'Jadilah yang pertama memulai diskusi kesehatan'
                }
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => setShowNewPost(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Buat Pertanyaan</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ) : (
          filteredQuestions.map((question, index) => (
            <Animated.View
              key={question.id}
              style={[
                styles.postContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    { 
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 30],
                        outputRange: [0, 6 - (index * 1)]
                      }) 
                    },
                    { scale: scaleAnim }
                  ]
                }
              ]}
            >
              <View style={styles.postCard}>
                <View style={styles.postHeader}>
                  <LinearGradient
                    colors={getAvatarColor(question.user?.name || 'User')}
                    style={styles.postAvatar}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.postAvatarText}>
                      {getInitials(question.user?.name || 'U')}
                    </Text>
                  </LinearGradient>
                  
                  <View style={styles.postHeaderInfo}>
                    <Text style={styles.postUserName} numberOfLines={1}>
                      {question.user?.name || 'Pengguna'}
                    </Text>
                    <Text style={styles.postTime}>{formatTime(question.created_at)}</Text>
                  </View>
                </View>
                
                <View style={styles.postContent}>
                  <Text style={styles.postTitle} numberOfLines={3}>
                    {question.title}
                  </Text>
                  {question.body && (
                    <Text style={styles.postBody} numberOfLines={4}>
                      {question.body}
                    </Text>
                  )}
                </View>
                
                <View style={styles.postActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleLike(question.id)}
                    activeOpacity={0.7}
                    accessibilityLabel="Like post"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons 
                      name={question.user_has_liked ? "heart" : "heart-outline"} 
                      size={20} 
                      color={question.user_has_liked ? "#EF4444" : "#6B7280"} 
                    />
                    {(question.likes_count || 0) > 0 && (
                      <Text style={[
                        styles.actionCount,
                        question.user_has_liked && styles.actionCountActive
                      ]}>
                        {question.likes_count}
                      </Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => toggleAnswers(question.id)}
                    activeOpacity={0.7}
                    accessibilityLabel="View answers"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons 
                      name={expandedQuestion === question.id ? "chatbubbles" : "chatbubble-outline"} 
                      size={20} 
                      color={expandedQuestion === question.id ? "#10B981" : "#6B7280"} 
                    />
                    {(question.answers_count || 0) > 0 && (
                      <Text style={[
                        styles.actionCount,
                        expandedQuestion === question.id && styles.actionCountActiveGreen
                      ]}>
                        {question.answers_count}
                      </Text>
                    )}
                  </TouchableOpacity>
                  
                  <View style={styles.actionSpacer} />
                  
                  <TouchableOpacity 
                    style={styles.actionButtonReply}
                    onPress={() => openAnswerModal(question)}
                    activeOpacity={0.7}
                    accessibilityLabel="Reply to post"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="#10B981" />
                  </TouchableOpacity>
                </View>

                {expandedQuestion === question.id && question.answers && question.answers.length > 0 && (
                  <Animated.View 
                    style={[
                      styles.answersSection,
                      {
                        opacity: answerSlideAnim,
                        transform: [{
                          translateY: answerSlideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0]
                          })
                        }]
                      }
                    ]}
                  >
                    <View style={styles.answersDivider} />
                    
                    {question.answers.map((answer, idx) => (
                      <AnswerItem 
                        key={answer.id} 
                        answer={answer} 
                        answerIdx={idx}
                        questionId={question.id}
                        handleAnswerLike={handleAnswerLike}
                        formatTime={formatTime}
                        getAvatarColor={getAvatarColor}
                        getInitials={getInitials}
                      />
                    ))}
                  </Animated.View>
                )}
              </View>
            </Animated.View>
          ))
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <Animated.View
        style={[
          styles.fabContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [80, 0]
                })
              }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowNewPost(true)}
          activeOpacity={0.9}
          accessibilityLabel="Buat diskusi baru"
        >
          <LinearGradient
            colors={['#10B981', '#059669'] as const}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="create" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <NewPostModal
        visible={showNewPost}
        onClose={() => setShowNewPost(false)}
        onSubmit={handleNewPost}
      />

      <Modal
        visible={showAnswerModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowAnswerModal(false);
          setSelectedQuestion(null);
          setAnswerContent('');
        }}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.modalGradient}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Ionicons name="chatbubble-ellipses" size={24} color="#10B981" />
                  <Text style={styles.modalTitle}>Berikan Jawaban</Text>
                </View>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => {
                    setShowAnswerModal(false);
                    setSelectedQuestion(null);
                    setAnswerContent('');
                  }}
                  activeOpacity={0.8}
                  accessibilityLabel="Close modal"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={28} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              {selectedQuestion && (
                <>
                  <View style={styles.modalQuestionPreview}>
                    <View style={styles.modalQuestionHeader}>
                      <LinearGradient
                        colors={getAvatarColor(selectedQuestion.user?.name || 'User')}
                        style={styles.modalQuestionAvatar}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.modalQuestionAvatarText}>
                          {getInitials(selectedQuestion.user?.name || 'U')}
                        </Text>
                      </LinearGradient>
                      <View style={styles.modalQuestionInfo}>
                        <Text style={styles.modalQuestionName} numberOfLines={1}>
                          {selectedQuestion.user?.name || 'Pengguna'}
                        </Text>
                        <Text style={styles.modalQuestionTime}>
                          {formatTime(selectedQuestion.created_at)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.modalQuestionTitle} numberOfLines={3}>
                      {selectedQuestion.title}
                    </Text>
                    <Text style={styles.modalQuestionContent} numberOfLines={4}>
                      {selectedQuestion.body}
                    </Text>
                  </View>
                  
                  <View style={styles.answerInputContainer}>
                    <Text style={styles.answerInputLabel}>Jawaban Anda:</Text>
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
                    <View style={styles.answerInputCounter}>
                  <Text style={styles.answerInputCounterText}>
                    {answerContent.length}/1000
                  </Text>
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowAnswerModal(false);
                    setSelectedQuestion(null);
                    setAnswerContent('');
                  }}
                  activeOpacity={0.8}
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
                  activeOpacity={0.8}
                >
                  {submittingAnswer ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="send" size={18} color="#FFFFFF" />
                      <Text style={styles.modalSubmitText}>Kirim</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Animated.View>
    </View>
  </Modal>
</SafeAreaView>
);
}
const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#F9FAFB',
},
loadingContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: '#F9FAFB',
},
loadingText: {
marginTop: 12,
fontSize: 15,
color: '#6B7280',
fontWeight: '600',
},
header: {
backgroundColor: '#FFFFFF',
borderBottomWidth: 1,
borderBottomColor: '#E5E7EB',
paddingTop: Platform.OS === 'ios' ? 50 : 40,
paddingBottom: 12,
paddingHorizontal: 16,
},
headerContent: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: 16,
},
headerLeft: {
flexDirection: 'row',
alignItems: 'center',
gap: 12,
},
headerTitle: {
fontSize: 24,
fontWeight: '700',
color: '#111827',
letterSpacing: -0.5,
},
headerSubtitle: {
fontSize: 13,
color: '#6B7280',
marginTop: 2,
},
newPostButton: {
padding: 4,
},
tabsContainer: {
flexDirection: 'row',
gap: 8,
},
tab: {
flex: 1,
paddingVertical: 8,
paddingHorizontal: 12,
borderRadius: 8,
alignItems: 'center',
},
tabActive: {
backgroundColor: '#10B981',
},
tabText: {
fontSize: 13,
fontWeight: '600',
color: '#6B7280',
},
tabTextActive: {
color: '#FFFFFF',
},
scrollView: {
flex: 1,
},
scrollContent: {
paddingTop: 8,
},
postContainer: {
marginBottom: 8,
},
postCard: {
backgroundColor: '#FFFFFF',
borderBottomWidth: 1,
borderBottomColor: '#E5E7EB',
paddingVertical: 12,
paddingHorizontal: 16,
},
postHeader: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 12,
},
postAvatar: {
width: 40,
height: 40,
borderRadius: 20,
justifyContent: 'center',
alignItems: 'center',
},
postAvatarText: {
color: '#FFFFFF',
fontSize: 15,
fontWeight: '700',
},
postHeaderInfo: {
marginLeft: 12,
flex: 1,
},
postUserName: {
fontSize: 15,
fontWeight: '700',
color: '#111827',
},
postTime: {
fontSize: 13,
color: '#6B7280',
marginTop: 2,
},
postContent: {
marginBottom: 12,
},
postTitle: {
fontSize: 16,
fontWeight: '700',
color: '#111827',
lineHeight: 22,
marginBottom: 6,
},
postBody: {
fontSize: 15,
color: '#374151',
lineHeight: 21,
},
postActions: {
flexDirection: 'row',
alignItems: 'center',
gap: 20,
paddingTop: 4,
},
actionButton: {
flexDirection: 'row',
alignItems: 'center',
gap: 6,
},
actionCount: {
fontSize: 14,
fontWeight: '600',
color: '#6B7280',
},
actionCountActive: {
color: '#EF4444',
},
actionCountActiveGreen: {
color: '#10B981',
},
actionSpacer: {
flex: 1,
},
actionButtonReply: {
padding: 4,
},
answersSection: {
marginTop: 12,
},
answersDivider: {
height: 1,
backgroundColor: '#E5E7EB',
marginBottom: 12,
},
answerItem: {
paddingVertical: 12,
paddingLeft: 12,
borderLeftWidth: 2,
borderLeftColor: '#E5E7EB',
marginBottom: 8,
},
answerHeader: {
flexDirection: 'row',
gap: 10,
},
answerAvatar: {
width: 32,
height: 32,
borderRadius: 16,
justifyContent: 'center',
alignItems: 'center',
},
answerAvatarText: {
color: '#FFFFFF',
fontSize: 12,
fontWeight: '700',
},
answerContentWrapper: {
flex: 1,
},
answerMeta: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 6,
gap: 4,
},
answerUserName: {
fontSize: 14,
fontWeight: '600',
color: '#111827',
},
answerTime: {
fontSize: 13,
color: '#6B7280',
},
answerBody: {
fontSize: 14,
color: '#374151',
lineHeight: 20,
marginBottom: 8,
},
answerLikeButton: {
flexDirection: 'row',
alignItems: 'center',
gap: 4,
alignSelf: 'flex-start',
},
answerLikeCount: {
fontSize: 12,
fontWeight: '600',
color: '#9CA3AF',
},
answerLikeCountActive: {
color: '#EF4444',
},
emptyState: {
padding: 40,
alignItems: 'center',
},
emptyCard: {
alignItems: 'center',
},
emptyIconWrapper: {
marginBottom: 16,
},
emptyTitle: {
fontSize: 20,
fontWeight: '700',
color: '#111827',
marginBottom: 8,
textAlign: 'center',
},
emptySubtitle: {
fontSize: 15,
color: '#6B7280',
textAlign: 'center',
lineHeight: 21,
marginBottom: 24,
},
emptyButton: {
flexDirection: 'row',
alignItems: 'center',
gap: 8,
paddingHorizontal: 24,
paddingVertical: 12,
borderRadius: 12,
backgroundColor: '#10B981',
},
emptyButtonText: {
fontSize: 15,
fontWeight: '600',
color: '#FFFFFF',
},
fabContainer: {
position: 'absolute',
bottom: 90,
right: 16,
},
fab: {
borderRadius: 28,
overflow: 'hidden',
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.3,
shadowRadius: 8,
elevation: 8,
},
fabGradient: {
width: 56,
height: 56,
justifyContent: 'center',
alignItems: 'center',
},
modalOverlay: {
flex: 1,
backgroundColor: 'rgba(0, 0, 0, 0.5)',
justifyContent: 'center',
alignItems: 'center',
padding: 16,
},
modalContent: {
width: '100%',
maxWidth: 500,
borderRadius: 16,
backgroundColor: '#FFFFFF',
shadowColor: '#000',
shadowOffset: { width: 0, height: 8 },
shadowOpacity: 0.15,
shadowRadius: 16,
elevation: 10,
},
modalGradient: {
padding: 20,
},
modalHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: 20,
paddingBottom: 16,
borderBottomWidth: 1,
borderBottomColor: '#E5E7EB',
},
modalTitleContainer: {
flexDirection: 'row',
alignItems: 'center',
gap: 10,
},
modalTitle: {
fontSize: 20,
fontWeight: '700',
color: '#111827',
},
modalCloseButton: {
padding: 4,
},
modalQuestionPreview: {
backgroundColor: '#F9FAFB',
borderRadius: 12,
padding: 16,
marginBottom: 20,
borderWidth: 1,
borderColor: '#E5E7EB',
},
modalQuestionHeader: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 12,
},
modalQuestionAvatar: {
width: 36,
height: 36,
borderRadius: 18,
justifyContent: 'center',
alignItems: 'center',
},
modalQuestionAvatarText: {
color: '#FFFFFF',
fontSize: 14,
fontWeight: '700',
},
modalQuestionInfo: {
marginLeft: 10,
flex: 1,
},
modalQuestionName: {
fontSize: 14,
fontWeight: '600',
color: '#111827',
},
modalQuestionTime: {
fontSize: 12,
color: '#6B7280',
marginTop: 2,
},
modalQuestionTitle: {
fontSize: 16,
fontWeight: '700',
color: '#111827',
marginBottom: 8,
lineHeight: 22,
},
modalQuestionContent: {
fontSize: 14,
color: '#374151',
lineHeight: 20,
},
answerInputContainer: {
marginBottom: 24,
},
answerInputLabel: {
fontSize: 15,
fontWeight: '600',
color: '#111827',
marginBottom: 10,
},
answerInput: {
borderWidth: 1,
borderColor: '#D1D5DB',
borderRadius: 12,
padding: 16,
fontSize: 15,
color: '#111827',
textAlignVertical: 'top',
minHeight: 120,
backgroundColor: '#FFFFFF',
},
answerInputCounter: {
marginTop: 6,
alignItems: 'flex-end',
},
answerInputCounterText: {
fontSize: 12,
color: '#9CA3AF',
},
modalActions: {
flexDirection: 'row',
gap: 12,
},
modalCancelButton: {
flex: 1,
paddingVertical: 14,
borderRadius: 12,
borderWidth: 1,
borderColor: '#D1D5DB',
alignItems: 'center',
backgroundColor: '#FFFFFF',
},
modalCancelText: {
fontSize: 15,
fontWeight: '600',
color: '#6B7280',
},
modalSubmitButton: {
flex: 2,
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'center',
gap: 8,
paddingVertical: 14,
borderRadius: 12,
backgroundColor: '#10B981',
},
modalSubmitButtonDisabled: {
backgroundColor: '#9CA3AF',
},
modalSubmitText: {
fontSize: 15,
fontWeight: '600',
color: '#FFFFFF',
},
});