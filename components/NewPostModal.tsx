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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { height } = Dimensions.get('window');

interface NewPostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; category: string }) => void;
}

export default function NewPostModal({ visible, onClose, onSubmit }: NewPostModalProps) {
  const [postContent, setPostContent] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'umum' | 'diet' | 'olahraga' | 'mental'>('umum');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const categories = [
    { 
      id: 'umum' as const, 
      label: 'Kesehatan Umum', 
      icon: 'medkit-outline' as const, 
      gradient: ['#667eea', '#764ba2'] as const 
    },
    { 
      id: 'diet' as const, 
      label: 'Diet & Nutrisi', 
      icon: 'nutrition-outline' as const, 
      gradient: ['#f093fb', '#f5576c'] as const 
    },
    { 
      id: 'olahraga' as const, 
      label: 'Olahraga', 
      icon: 'fitness-outline' as const, 
      gradient: ['#4facfe', '#00f2fe'] as const 
    },
    { 
      id: 'mental' as const, 
      label: 'Kesehatan Mental', 
      icon: 'happy-outline' as const, 
      gradient: ['#43e97b', '#38f9d7'] as const 
    },
  ];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: -height * 0.05,
          tension: 65,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => resetForm());
    }
  }, [visible, backdropOpacity, slideAnim, scaleAnim, fadeAnim, height]);

  const resetForm = () => {
    setPostTitle('');
    setPostContent('');
    setSelectedCategory('umum');
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    if (!postTitle.trim() || !postContent.trim()) {
      Alert.alert('⚠️ Perhatian', 'Judul dan konten tidak boleh kosong');
      return;
    }
    if (postTitle.length < 10) {
      Alert.alert('⚠️ Perhatian', 'Judul terlalu pendek (minimal 10 karakter)');
      return;
    }
    if (postContent.length < 20) {
      Alert.alert('⚠️ Perhatian', 'Konten terlalu pendek (minimal 20 karakter)');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: postTitle,
        content: postContent,
        category: selectedCategory,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal memposting');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (postTitle || postContent) {
      Alert.alert('❓ Batal Posting?', 'Perubahan yang belum disimpan akan hilang', [
        { text: 'Lanjutkan Edit', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => { resetForm(); onClose(); }},
      ]);
    } else {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={handleClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <Animated.View
            style={[
              styles.container,
              { transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
            ]}
          >

            <LinearGradient colors={['#10B981', '#059669', '#047857'] as const} style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                  <View style={styles.headerIconBox}>
                    <Ionicons name="create-outline" size={28} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>Buat Pertanyaan</Text>
                    <Text style={styles.headerSubtitle}>Bagikan dengan komunitas</Text>
                  </View>
                </View>

                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <BlurView intensity={40} tint="light" style={styles.closeBlur}>
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </BlurView>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

              <Animated.View style={[styles.inputSection, { opacity: fadeAnim }]}>
                <View style={styles.inputHeader}>
                  <Ionicons name="text-outline" size={20} color="#10B981" />
                  <Text style={styles.inputLabel}>Judul Pertanyaan</Text>
                </View>

                <View style={[styles.titleInputWrapper, titleFocused && styles.inputFocused]}>
                  <BlurView intensity={20} tint="light" style={styles.inputBlur}>
                    <TextInput
                      style={styles.titleInput}
                      placeholder="Apa yang ingin Anda tanyakan?"
                      placeholderTextColor="#9CA3AF"
                      value={postTitle}
                      onChangeText={setPostTitle}
                      maxLength={100}
                      onFocus={() => setTitleFocused(true)}
                      onBlur={() => setTitleFocused(false)}
                    />
                  </BlurView>

                  <View style={styles.charCountBox}>
                    <Text style={[styles.charCount, postTitle.length >= 90 && styles.charWarning]}>
                      {postTitle.length}/100
                    </Text>
                  </View>
                </View>
              </Animated.View>

              <Animated.View style={[styles.inputSection, { opacity: fadeAnim }]}>
                <View style={styles.inputHeader}>
                  <Ionicons name="document-text-outline" size={20} color="#10B981" />
                  <Text style={styles.inputLabel}>Detail Pertanyaan</Text>
                </View>

                <View style={[styles.contentInputWrapper, contentFocused && styles.inputFocused]}>
                  <BlurView intensity={20} tint="light" style={styles.inputBlur}>
                    <TextInput
                      style={styles.contentInput}
                      placeholder="Jelaskan pertanyaan Anda secara detail..."
                      placeholderTextColor="#9CA3AF"
                      value={postContent}
                      onChangeText={setPostContent}
                      multiline
                      maxLength={1000}
                      textAlignVertical="top"
                      onFocus={() => setContentFocused(true)}
                      onBlur={() => setContentFocused(false)}
                    />
                  </BlurView>

                  <View style={styles.charCountBox}>
                    <Text style={[styles.charCount, postContent.length >= 900 && styles.charWarning]}>
                      {postContent.length}/1000
                    </Text>
                  </View>
                </View>
              </Animated.View>

              <Animated.View style={[styles.categorySection, { opacity: fadeAnim }]}>
                <View style={styles.inputHeader}>
                  <Ionicons name="apps-outline" size={20} color="#10B981" />
                  <Text style={styles.inputLabel}>Pilih Kategori</Text>
                </View>

                <View style={styles.categoriesGrid}>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryCard, selectedCategory === cat.id && styles.categorySelected]}
                      onPress={() => setSelectedCategory(cat.id)}
                      activeOpacity={0.8}
                    >
                      {selectedCategory === cat.id ? (
                        <LinearGradient colors={cat.gradient} style={styles.categoryGradient}>
                          <View style={styles.categoryIconBox}>
                            <Ionicons name={cat.icon} size={24} color="#FFFFFF" />
                          </View>
                          <Text style={styles.categoryLabelSelected}>{cat.label}</Text>
                          <View style={styles.checkmark}>
                            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                          </View>
                        </LinearGradient>
                      ) : (
                        <BlurView intensity={20} tint="light" style={styles.categoryBlur}>
                          <View style={[styles.categoryIconBox, { backgroundColor: '#F3F4F6' }]}>
                            <Ionicons name={cat.icon} size={24} color="#9CA3AF" />
                          </View>
                          <Text style={styles.categoryLabel}>{cat.label}</Text>
                        </BlurView>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>

              <Animated.View style={[styles.tipsContainer, { opacity: fadeAnim }]}>
                <LinearGradient colors={['#D1FAE5', '#A7F3D0'] as const} style={styles.tipsGradient}>
                  <View style={styles.tipsIcon}>
                    <Ionicons name="bulb-outline" size={24} color="#059669" />
                  </View>
                  <View style={styles.tipsContent}>
                    <Text style={styles.tipsTitle}>💡 Tips Membuat Pertanyaan Baik</Text>
                    <Text style={styles.tipsText}>
                      ✓ Judul jelas dan spesifik{'\n'}
                      ✓ Detail lengkap dan terstruktur{'\n'}
                      ✓ Sertakan konteks yang relevan{'\n'}
                      ✓ Gunakan bahasa sopan dan mudah dipahami
                    </Text>
                  </View>
                </LinearGradient>
              </Animated.View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={isSubmitting}>
                <BlurView intensity={40} tint="light" style={styles.cancelBlur}>
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, (!postTitle.trim() || !postContent.trim() || isSubmitting) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!postTitle.trim() || !postContent.trim() || isSubmitting}
              >
                <LinearGradient
                  colors={
                    !postTitle.trim() || !postContent.trim() || isSubmitting
                      ? ['#9CA3AF', '#6B7280'] as const
                      : ['#10B981', '#059669'] as const
                  }
                  style={styles.submitGradient}
                >
                  {isSubmitting ? (
                    <>
                      <Animated.View
                        style={{
                          transform: [{
                            rotate: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg'],
                            })
                          }]
                        }}
                      >
                        <Ionicons name="sync-outline" size={20} color="#FFFFFF" />
                      </Animated.View>
                      <Text style={styles.submitButtonText}>Mengirim...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="send-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Posting Sekarang</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 40,
    maxHeight: '85%',
    width: '92%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
    overflow: 'hidden',
  },
  header: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  headerIconBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  closeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  closeBlur: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  titleInputWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  contentInputWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minHeight: 180,
  },
  inputFocused: {
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  inputBlur: {
    flex: 1,
  },
  titleInput: {
    padding: 20,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  contentInput: {
    padding: 20,
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    minHeight: 140,
  },
  charCountBox: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  charWarning: {
    color: '#EF4444',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 120,
  },
  categorySelected: {
    shadowColor: '#10B981',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  categoryGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  categoryBlur: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  categoryIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryLabelSelected: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  tipsContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tipsGradient: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  tipsIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
  },
  tipsText: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  cancelBlur: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  submitButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});