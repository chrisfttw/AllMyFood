import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigation } from 'expo-router';
import { Menu, Provider, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

const Profile = () => {
  const [username, setUsername] = useState('');
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || 'Anonymous');
      } else {
        setUsername('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Success', 'You have been logged out');
      navigation.navigate('index');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <Provider>
      <View className="flex-1">
        <View className="bg-primary h-1/6 justify-between flex-row items-center px-6 pt-12">
          <Text className="text-white text-3xl">Hello, {username}</Text>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              <IconButton
                icon={() => <MaterialCommunityIcons name="menu" color="white" size={30} />}
                onPress={openMenu}
              />
            }
          >
            <Menu.Item onPress={() => {}} title="Profile" />
            <Menu.Item onPress={handleLogout} title="Logout" />
          </Menu>
        </View>
      </View>
    </Provider>
  );
};

export default Profile;
