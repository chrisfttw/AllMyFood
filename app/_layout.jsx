import { Stack } from 'expo-router';
import React from 'react';
import useAuth from '../hooks/useAuth';

const RootLayout = () => {
  const { user } = useAuth();

  if (user) {
    return (
      <Stack>
        <Stack.Screen name='index' options={{ headerShown: false }} />
        <Stack.Screen name='(auth)' options={{ headerShown: false }} />
        <Stack.Screen name='(pages)' options={{ headerShown: false,  gestureEnabled: false }} />
      </Stack>
    );
  } else {
    return (
      <Stack>
        <Stack.Screen name='index' options={{ headerShown: false }} />
        <Stack.Screen name='(auth)' options={{ headerShown: false }} />
        <Stack.Screen name='(pages)' options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    );
  }
};

export default RootLayout;
