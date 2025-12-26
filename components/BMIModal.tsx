import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BMIModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function BMIModal({ visible, onClose }: BMIModalProps) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBMI] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('#10B981');

  // Animasi
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animasi
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      slideAnim.setValue(50);
      backdropAnim.setValue(0);
      resultAnim.setValue(0);
      
      // Animasikan masuk
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(fadeAnim, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animasikan keluar
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        resetForm();
      });
    }
  }, [visible]);

  const resetForm = () => {
    setWeight('');
    setHeight('');
    setBMI(null);
    setCategory('');
    setColor('#10B981');
    resultAnim.setValue(0);
  };

  const calculateBMI = () => {
    // Validasi
    const w = parseFloat(weight.replace(',', '.'));
    const h = parseFloat(height.replace(',', '.'));

    if (!w || w <= 0) {
      Alert.alert('⚠️ Perhatian', 'Masukkan berat badan yang valid');
      return;
    }
    
    if (!h || h <= 0) {
      Alert.alert('⚠️ Perhatian', 'Masukkan tinggi badan yang valid');
      return;
    }

    // Hitung BMI
    const heightInMeters = h / 100;
    const bmiValue = w / (heightInMeters * heightInMeters);
    const roundedBMI = Math.round(bmiValue * 10) / 10;
    
    setBMI(roundedBMI);

    // Tentukan kategori
    let cat = '';
    let col = '#10B981';

    if (bmiValue < 18.5) {
      cat = 'Kurus';
      col = '#3B82F6';
    } else if (bmiValue < 23) {
      cat = 'Normal';
      col = '#10B981';
    } else if (bmiValue < 27.5) {
      cat = 'Gemuk';
      col = '#F59E0B';
    } else {
      cat = 'Obesitas';
      col = '#EF4444';
    }

    setCategory(cat);
    setColor(col);

    // Animasi hasil
    resultAnim.setValue(0);
    Animated.spring(resultAnim, {
      toValue: 1,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const renderBlurBackground = (children: React.ReactNode) => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView intensity={30} tint="light" style={styles.blurBackground}>
          {children}
        </BlurView>
      );
    }
    // Android fallback dengan semi-transparent
    return (
      <View style={[styles.blurBackground, styles.androidBlur]}>
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
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop dengan animasi */}
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: backdropAnim }
        ]}
      >
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* Modal Content dengan Animasi */}
      <View style={styles.modalWrapper}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ],
            },
          ]}
        >
          {/* Header dengan Blur */}
          {renderBlurBackground(
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="calculator" size={24} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Kalkulator BMI</Text>
                  <Text style={styles.headerSubtitle}>Cek indeks massa tubuh Anda</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Info Card */}
            <Animated.View 
              style={[
                styles.infoBox,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }]
                }
              ]}
            >
              <Ionicons name="information-circle" size={20} color="#10B981" />
              <Text style={styles.infoText}>
                BMI = Berat (kg) ÷ (Tinggi (m) × Tinggi (m))
              </Text>
            </Animated.View>

            {/* Input Berat */}
            <Animated.View 
              style={[
                styles.inputGroup,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0]
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.label}>
                <Ionicons name="body-outline" size={18} color="#10B981" /> Berat Badan (kg)
              </Text>
              <View style={styles.inputWrapper}>
                {renderBlurBackground(
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: 65"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                    value={weight}
                    onChangeText={setWeight}
                    autoFocus={visible}
                  />
                )}
              </View>
            </Animated.View>

            {/* Input Tinggi */}
            <Animated.View 
              style={[
                styles.inputGroup,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0]
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.label}>
                <Ionicons name="resize-outline" size={18} color="#10B981" /> Tinggi Badan (cm)
              </Text>
              <View style={styles.inputWrapper}>
                {renderBlurBackground(
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: 170"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                    value={height}
                    onChangeText={setHeight}
                  />
                )}
              </View>
            </Animated.View>

            {/* Tombol Hitung */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })
                }]
              }}
            >
              <TouchableOpacity
                style={[
                  styles.calculateBtn,
                  (!weight || !height) && styles.calculateBtnDisabled
                ]}
                onPress={calculateBMI}
                disabled={!weight || !height}
                activeOpacity={0.8}
              >
                <Ionicons name="calculator-outline" size={22} color="white" />
                <Text style={styles.calculateBtnText}>Hitung BMI</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Hasil dengan Animasi */}
            {bmi !== null && (
              <Animated.View 
                style={[
                  styles.resultCard,
                  {
                    opacity: resultAnim,
                    transform: [
                      {
                        translateY: resultAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0]
                        })
                      },
                      {
                        scale: resultAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.9, 1]
                        })
                      }
                    ]
                  }
                ]}
              >
                <Text style={styles.resultTitle}>Hasil Perhitungan</Text>
                
                <View style={styles.bmiResult}>
                  <Text style={styles.bmiValue}>{bmi}</Text>
                  <View style={[styles.categoryTag, { backgroundColor: color }]}>
                    <Text style={styles.categoryText}>{category}</Text>
                  </View>
                </View>

                {/* Kategori BMI */}
                <View style={styles.categories}>
                  <Text style={styles.categoriesTitle}>Kategori BMI:</Text>
                  
                  <View style={styles.categoryRow}>
                    <View style={[styles.colorIndicator, { backgroundColor: '#3B82F6' }]} />
                    <Text style={styles.categoryLabel}>Kurus</Text>
                    <Text style={styles.categoryRange}>&lt; 18.5</Text>
                  </View>
                  
                  <View style={styles.categoryRow}>
                    <View style={[styles.colorIndicator, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.categoryLabel}>Normal</Text>
                    <Text style={styles.categoryRange}>18.5 - 22.9</Text>
                  </View>
                  
                  <View style={styles.categoryRow}>
                    <View style={[styles.colorIndicator, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.categoryLabel}>Gemuk</Text>
                    <Text style={styles.categoryRange}>23 - 27.4</Text>
                  </View>
                  
                  <View style={styles.categoryRow}>
                    <View style={[styles.colorIndicator, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.categoryLabel}>Obesitas</Text>
                    <Text style={styles.categoryRange}>≥ 27.5</Text>
                  </View>
                </View>

                {/* Tips */}
                <View style={styles.tipsBox}>
                  <View style={styles.tipsHeader}>
                    <Ionicons name="bulb-outline" size={20} color="#059669" />
                    <Text style={styles.tipsTitle}>Tips Sehat</Text>
                  </View>
                  <Text style={styles.tipsText}>
                    • Makan makanan bergizi seimbang{'\n'}
                    • Minum air putih 8 gelas/hari{'\n'}
                    • Olahraga rutin 30 menit/hari{'\n'}
                    • Istirahat cukup 7-8 jam/malam
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* Tombol Reset */}
            <Animated.View
              style={{
                opacity: bmi ? resultAnim : 0,
                transform: [{
                  translateY: resultAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                  })
                }]
              }}
            >
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={resetForm}
                disabled={!bmi}
              >
                {renderBlurBackground(
                  <View style={styles.resetContent}>
                    <Ionicons name="refresh-outline" size={18} color="#6B7280" />
                    <Text style={styles.resetBtnText}>Hitung Ulang</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Spacer */}
            <View style={styles.spacer} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
  },
  blurBackground: {
    flex: 1,
    overflow: 'hidden',
  },
  androidBlur: {
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
    backdropFilter: Platform.select({ web: 'blur(10px)' }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  closeBtn: {
    padding: 8,
  },
  content: {
    maxHeight: 500,
  },
  scrollContent: {
    padding: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: 18,
    borderRadius: 16,
    marginBottom: 28,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  input: {
    padding: 18,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minHeight: 58,
  },
  calculateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#10B981',
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 28,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  calculateBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#6B7280',
  },
  calculateBtnText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  bmiResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  bmiValue: {
    fontSize: 64,
    fontWeight: '900',
    color: '#111827',
  },
  categoryTag: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
  },
  categories: {
    marginBottom: 28,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  colorIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 14,
  },
  categoryLabel: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  categoryRange: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  tipsBox: {
    backgroundColor: 'rgba(240, 253, 244, 0.8)',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#10B981',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
  },
  tipsText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 22,
  },
  resetBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  resetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
  spacer: {
    height: 20,
  },
});