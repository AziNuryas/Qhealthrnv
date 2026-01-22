import { Stack, usePathname } from 'expo-router';
import { useState } from 'react';
import { StatusBar, View } from 'react-native';
import AIChatModal from '../components/AIChatModal';
import BMIModal from '../components/BMIModal';
import DockNavigation from '../components/DockNavigation';

export default function RootLayout() {
  const [activeModal, setActiveModal] = useState<'bmi' | 'ai' | null>(null);
  const pathname = usePathname();

  // Tentukan screens yang perlu dock
  const showDockScreens = ['/dashboard', '/diskusi', '/profil'];
  const shouldShowDock = showDockScreens.includes(pathname);

  const openModal = (modal: 'bmi' | 'ai') => {
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={{ flex: 1 }}>
        <Stack 
          screenOptions={{ 
            headerShown: false,
            animation: 'fade_from_bottom',
            animationDuration: 300
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="diskusi" />
          <Stack.Screen name="profil" />
          <Stack.Screen name="pengaturan" options={{ headerShown: false }} />
          <Stack.Screen name="keamanan" options={{ headerShown: false }} />
        </Stack>

        {/* Show Dock only on main app screens */}
        {shouldShowDock && (
          <DockNavigation 
            onShowBMI={() => openModal('bmi')}
            onShowAIChat={() => openModal('ai')}
            onShowNewPost={() => {}} // Untuk kompatibilitas
          />
        )}

        {/* Modals */}
        <BMIModal 
          visible={activeModal === 'bmi'} 
          onClose={closeModal} 
        />
        
        <AIChatModal 
          visible={activeModal === 'ai'} 
          onClose={closeModal} 
        />
      </View>
    </>
  );
}