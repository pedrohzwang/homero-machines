import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, Text } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { initDatabase } from './src/database/init';
import { AppNavigator } from './src/navigation/AppNavigator';
import { theme } from './src/theme';

export default function App() {
  const [ready, setReady] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
      rotateAnim.setValue(0);
    };
  }, [rotateAnim]);

  useEffect(() => {
    initDatabase();

    // Keeps the loading animation visible long enough to be perceived by the user.
    const timer = setTimeout(() => {
      setReady(true);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialCommunityIcons
            name="cog"
            size={56}
            color={theme.colors.primary}
          />
        </Animated.View>
        <Text
          style={{
            marginTop: theme.spacing.md,
            color: theme.colors.textSecondary,
            fontSize: theme.fontSize.md,
            fontWeight: '600',
          }}
        >
          Carregando
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
