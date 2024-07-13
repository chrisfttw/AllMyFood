import React from 'react';
import { AuthProvider } from '../app/authContext';
import { Stack } from 'expo-router';
import useAuth from '../hooks/useAuth.js';

const RootLayout = () => {
  const { user } = useAuth();

  if (user) {
    return (
      <Stack>
        <Stack.Screen name='index' options={{ headerShown: false }} />
        <Stack.Screen name='(auth)' options={{ headerShown: false }} />
        <Stack.Screen name='(pages)' options={{ headerShown: false, gestureEnabled: false }} />
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

const RootLayoutWithAuth = () => (
  <AuthProvider>
    <RootLayout />
  </AuthProvider>
);

export default RootLayoutWithAuth;
