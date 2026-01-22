import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useSegments } from 'expo-router';
import React, {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface DockItem {
  id: number;
  icon: IoniconName;
  key: string;
  route?: string;
  action?: () => void;
}

interface DockNavigationProps {
  onShowBMI: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DOCK_PADDING = 16;
const DOCK_WIDTH = SCREEN_WIDTH - DOCK_PADDING * 2;
const TILE_WIDTH = 70;
const TILE_HEIGHT = 52;
const ICON_SIZE = 28;

export default function DockNavigation({ onShowBMI }: DockNavigationProps) {
  const router = useRouter();
  const segments = useSegments();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const activeKey = segments[0] ?? 'dashboard';

  /* ================= ANIM ================= */
  const slideUp = useRef(new Animated.Value(100)).current;
  const tileX = useRef(new Animated.Value(0)).current;
  const tileScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  
  const iconScales = useRef(
    [...Array(4)].map(() => new Animated.Value(1))
  ).current;
  const iconPressAnim = useRef(
    [...Array(4)].map(() => new Animated.Value(0))
  ).current;

  const [iconCenters, setIconCenters] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /* ================= ITEMS ================= */
  const items = useMemo<DockItem[]>(
    () => [
      { id: 1, icon: 'home', key: 'dashboard', route: '/dashboard' },
      { id: 2, icon: 'chatbubbles', key: 'diskusi', route: '/diskusi' },
      { id: 3, icon: 'calculator', key: 'bmi', action: onShowBMI },
      { id: 4, icon: 'person', key: 'profil', route: '/profil' },
    ],
    [onShowBMI]
  );

  const activeIndex = useMemo(() => {
    const idx = items.findIndex(i => i.key === activeKey);
    return idx >= 0 ? idx : 0;
  }, [activeKey, items]);

  /* ================= TILE MOVE ================= */
  useEffect(() => {
    const center = iconCenters[activeIndex];
    if (!center) return;

    const targetX = center - TILE_WIDTH / 2;

    Animated.parallel([
      Animated.spring(tileX, {
        toValue: targetX,
        tension: 150,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(tileScale, {
          toValue: 0.9,
          tension: 250,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(tileScale, {
          toValue: 1,
          tension: 150,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [activeIndex, iconCenters]);

  const onItemLayout = useCallback(
    (index: number, e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      const center = x + width / 2;
      setIconCenters(prev => {
        const next = [...prev];
        next[index] = center;
        return next;
      });
    },
    []
  );

  const onPressIn = useCallback((index: number) => {
    Animated.timing(iconPressAnim[index], {
      toValue: 1,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, []);

  const onPressOut = useCallback((index: number) => {
    Animated.timing(iconPressAnim[index], {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, []);

  const onPress = useCallback(
    (item: DockItem, index: number) => {
      // Scale animation saat tap
      Animated.sequence([
        Animated.spring(iconScales[index], {
          toValue: 0.8,
          tension: 300,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(iconScales[index], {
          toValue: 1,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Navigate setelah animasi
      setTimeout(() => {
        if (item.route) router.replace(item.route as any);
        else if (item.action) item.action();
      }, 120);
    },
    [router, iconScales]
  );

  /* ================= GLASS THEME ================= */
  const theme = useMemo(
    () =>
      isDark
        ? {
            // Dark theme
            glass: 'rgba(25, 25, 30, 0.9)',
            glassBorder: 'rgba(255, 255, 255, 0.08)',
            glassShadow: 'rgba(0, 0, 0, 0.4)',
            
            // Icon colors - HANYA WARNA
            iconIdle: 'rgba(200, 200, 210, 0.7)',
            iconActive: '#FFFFFF',
            iconPressed: '#FFFFFF',
            
            // Active tile gradient (HIJAU)
            tileGradient: ['#10B981', '#059669'] as [string, string],
            glow: 'rgba(16, 185, 129, 0.3)',
            
            // Press effect color
            pressColor: 'rgba(16, 185, 129, 0.2)',
          }
        : {
            // Light theme
            glass: 'rgba(255, 255, 255, 0.85)',
            glassBorder: 'rgba(255, 255, 255, 0.25)',
            glassShadow: 'rgba(0, 0, 0, 0.1)',
            
            // Icon colors - HANYA WARNA
            iconIdle: 'rgba(100, 110, 120, 0.8)',
            iconActive: '#059669', // Hijau untuk active
            iconPressed: '#059669',
            
            // Active tile gradient (HIJAU)
            tileGradient: ['#34D399', '#10B981'] as [string, string],
            glow: 'rgba(52, 211, 153, 0.3)',
            
            // Press effect color
            pressColor: 'rgba(52, 211, 153, 0.15)',
          },
    [isDark]
  );

  /* ================= RENDER GLASS DOCK ================= */
  return (
    <Animated.View
      style={[
        styles.container,
        { 
          transform: [{ translateY: slideUp }],
          opacity: glowOpacity,
        },
      ]}
    >
      {/* Outer Glow */}
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: glowOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.5],
            }),
            backgroundColor: theme.glow,
          },
        ]}
      />

      {/* Glass Dock Container */}
      <BlurView
        intensity={25}
        tint={isDark ? "dark" : "light"}
        style={[
          styles.glassContainer,
          {
            backgroundColor: theme.glass,
            borderColor: theme.glassBorder,
            shadowColor: theme.glassShadow,
          },
        ]}
      >
        {/* ACTIVE TILE (hanya untuk icon aktif) */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glassTile,
            {
              width: TILE_WIDTH,
              height: TILE_HEIGHT,
              transform: [
                { translateX: tileX },
                { scale: tileScale },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={theme.tileGradient}
            style={styles.tileFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* ICONS ROW */}
        <View style={styles.row}>
          {items.map((item, index) => {
            const active = index === activeIndex;
            const isPressed = iconPressAnim[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1]
            });
            
            return (
              <Animated.View
                key={item.id}
                onLayout={(e) => onItemLayout(index, e)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: ICON_SIZE + 30,
                }}
              >
                <TouchableOpacity
                  style={styles.iconTouchable}
                  activeOpacity={1}
                  onPressIn={() => onPressIn(index)}
                  onPressOut={() => onPressOut(index)}
                  onPress={() => onPress(item, index)}
                >
                  {/* Background saat ditekan (hanya saat press) */}
                  <Animated.View
                    style={[
                      styles.pressBackground,
                      {
                        backgroundColor: theme.pressColor,
                        opacity: isPressed,
                        transform: [{ scale: isPressed }],
                      },
                    ]}
                  />
                  
                  {/* Icon dengan animasi scale */}
                  <Animated.View
                    style={{
                      transform: [{ scale: iconScales[index] }],
                    }}
                  >
                    <Ionicons
                      name={item.icon}
                      size={ICON_SIZE}
                      color={active ? theme.iconActive : theme.iconIdle}
                      style={{
                        opacity: active ? 1 : 0.8,
                      }}
                    />
                  </Animated.View>
                  
                  {/* Active indicator dot */}
                  {active && (
                    <View style={styles.activeDot} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </BlurView>
    </Animated.View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: DOCK_PADDING,
    right: DOCK_PADDING,
    zIndex: 1000,
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: DOCK_WIDTH - 20,
    height: 70,
    borderRadius: 28,
    bottom: -8,
    zIndex: -1,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  glassContainer: {
    width: DOCK_WIDTH,
    borderRadius: 24,
    paddingVertical: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 15,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  iconTouchable: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pressBackground: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  glassTile: {
    position: 'absolute',
    top: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  tileFill: {
    flex: 1,
    borderRadius: 16,
  },
  activeDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
  },
});