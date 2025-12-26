import React, {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useState,
  ComponentProps,
} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
  useColorScheme,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

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

const TILE_WIDTH = 72;
const TILE_HEIGHT = 44;
const ICON_BOX = 52;

export default function DockNavigation({ onShowBMI }: DockNavigationProps) {
  const router = useRouter();
  const segments = useSegments();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const activeKey = segments[0] ?? 'dashboard';

  /* ================= ANIM ================= */
  const slideUp = useRef(new Animated.Value(70)).current;
  const tileX = useRef(new Animated.Value(0)).current;
  const tileStretch = useRef(new Animated.Value(1)).current;
  const iconScales = useRef(
    [...Array(4)].map(() => new Animated.Value(1))
  ).current;

  const [iconCenters, setIconCenters] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    Animated.timing(slideUp, {
      toValue: 0,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [slideUp]);

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
      Animated.timing(tileX, {
        toValue: targetX,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(tileStretch, {
          toValue: 1.08,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(tileStretch, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [activeIndex, iconCenters, tileX, tileStretch]);

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

  const onPress = useCallback(
    (item: DockItem, index: number) => {
      Animated.sequence([
        Animated.timing(iconScales[index], {
          toValue: 0.92,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.spring(iconScales[index], {
          toValue: 1,
          tension: 320,
          friction: 16,
          useNativeDriver: true,
        }),
      ]).start();

      if (item.route) router.replace(item.route as any);
      else if (item.action) item.action();
    },
    [router, iconScales]
  );

  /* ================= THEME ================= */
  const theme = useMemo(
    () =>
      isDark
        ? {
            surface: '#1C1C1E',
            surfaceTop: '#242426',
            iconIdle: '#8E8E93',
            iconActive: '#FFFFFF', // 🔥 PUTIH SAAT AKTIF
            tile: ['#22C55E', '#16A34A'] as const,
          }
        : {
            surface: '#FFFFFF',
            surfaceTop: '#F2F3F5',
            iconIdle: '#9CA3AF',
            iconActive: '#FFFFFF', // 🔥 PUTIH SAAT AKTIF
            tile: ['#34D399', '#22C55E'] as const,
          },
    [isDark]
  );

  /* ================= RENDER ================= */
  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideUp }] },
      ]}
    >
      <View style={[styles.wrapper, { backgroundColor: theme.surface }]}>
        <LinearGradient
          colors={[theme.surfaceTop, theme.surface]}
          style={StyleSheet.absoluteFill}
        />

        {/* ACTIVE TILE */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.tile,
            {
              width: TILE_WIDTH,
              height: TILE_HEIGHT,
              transform: [
                { translateX: tileX },
                { scaleX: tileStretch },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={theme.tile}
            style={styles.tileFill}
          />
        </Animated.View>

        <View style={styles.row}>
          {items.map((item, index) => {
            const active = index === activeIndex;
            return (
              <Animated.View
                key={item.id}
                onLayout={(e) => onItemLayout(index, e)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  transform: [{ scale: iconScales[index] }],
                }}
              >
                <TouchableOpacity
                  style={styles.button}
                  activeOpacity={0.85}
                  onPress={() => onPress(item, index)}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={
                      active
                        ? theme.iconActive
                        : theme.iconIdle
                    }
                  />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 26 : 22,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  wrapper: {
    borderRadius: 24,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  button: {
    width: ICON_BOX,
    height: ICON_BOX,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tile: {
    position: 'absolute',
    top: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  tileFill: {
    flex: 1,
    borderRadius: 14,
  },
});
