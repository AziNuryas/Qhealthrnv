// utils/likesStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const LIKED_QUESTIONS_KEY = '@qhealth_liked_questions';
const QUESTION_LIKES_COUNT_KEY = '@qhealth_question_likes';

// ============================================
// SIMPAN LIKE STATUS (like/unlike)
// ============================================
export const saveLikedQuestion = async (questionId: number) => {
  try {
    const liked = await getLikedQuestions();
    const updated = [...new Set([...liked, questionId])]; // Hindari duplikat
    await AsyncStorage.setItem(LIKED_QUESTIONS_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('❌ Error saving like:', error);
    return false;
  }
};

export const removeLikedQuestion = async (questionId: number) => {
  try {
    const liked = await getLikedQuestions();
    const updated = liked.filter(id => id !== questionId);
    await AsyncStorage.setItem(LIKED_QUESTIONS_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('❌ Error removing like:', error);
    return false;
  }
};

export const getLikedQuestions = async (): Promise<number[]> => {
  try {
    const json = await AsyncStorage.getItem(LIKED_QUESTIONS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('❌ Error getting liked questions:', error);
    return [];
  }
};

export const isQuestionLiked = async (questionId: number): Promise<boolean> => {
  const liked = await getLikedQuestions();
  return liked.includes(questionId);
};

// ============================================
// KELOLA LIKE COUNT (simpan di AsyncStorage)
// ============================================
export const updateQuestionLikesCount = async (questionId: number, delta: number) => {
  try {
    const counts = await getQuestionLikesCounts();
    const current = counts[questionId] || 0;
    const newCount = Math.max(0, current + delta); // Tidak boleh minus
    
    await AsyncStorage.setItem(
      QUESTION_LIKES_COUNT_KEY,
      JSON.stringify({
        ...counts,
        [questionId]: newCount
      })
    );
    
    return newCount;
  } catch (error) {
    console.error('❌ Error updating likes count:', error);
    return null;
  }
};

export const getQuestionLikesCount = async (questionId: number): Promise<number> => {
  const counts = await getQuestionLikesCounts();
  return counts[questionId] || 0;
};

export const getQuestionLikesCounts = async (): Promise<Record<number, number>> => {
  try {
    const json = await AsyncStorage.getItem(QUESTION_LIKES_COUNT_KEY);
    return json ? JSON.parse(json) : {};
  } catch (error) {
    console.error('❌ Error getting likes counts:', error);
    return {};
  }
};

// ============================================
// INITIALIZE LIKE COUNTS dari database (saat pertama load)
// ============================================
export const initializeLikesCounts = async (questions: Array<{id: number, likes_count: number}>) => {
  try {
    const counts: Record<number, number> = {};
    questions.forEach(q => {
      counts[q.id] = q.likes_count || 0;
    });
    
    await AsyncStorage.setItem(QUESTION_LIKES_COUNT_KEY, JSON.stringify(counts));
    return true;
  } catch (error) {
    console.error('❌ Error initializing likes counts:', error);
    return false;
  }
};