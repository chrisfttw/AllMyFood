import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TextInput, Button, Modal, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Image } from 'react-native';
import { onAuthStateChanged, signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigation } from 'expo-router';
import { Menu, Provider, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import icons from '../../constants/icons';

const Profile = () => {
  const [username, setUsername] = useState('');
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const openChangePasswordModal = () => setChangePasswordVisible(true);
  const closeChangePasswordModal = () => setChangePasswordVisible(false);

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

  const handleChangePassword = async () => {
    const user = auth.currentUser;
    if (user && currentPassword && newPassword) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);

      try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        Alert.alert('Success', 'Password has been changed successfully');
        closeChangePasswordModal();
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  return (
    <Provider>
      <View className="flex-1 bg-white">
        <View className="h-1/6 justify-between flex-row items-center px-6 pt-12">
          <Text className="text-black text-3xl">Hello, {username}</Text>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              <IconButton
                icon={() => <MaterialCommunityIcons name="menu" color="black" size={30} />}
                onPress={openMenu}
              />
            }
            anchorPosition='bottom'
            contentStyle={{ borderRadius: 5, backgroundColor: '#FFFFFF' }}
          >
            <Menu.Item onPress={openChangePasswordModal} title="Change Password" />
            <Menu.Item onPress={handleLogout} title="Logout" />
          </Menu>
        </View>

        <Modal
          visible={changePasswordVisible}
          onRequestClose={closeChangePasswordModal}
          animationType="slide"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 justify-center items-center">
              <Text className="text-primary text-2xl font-bold mb-5">Update Password</Text>
              <View className="border-2 border-gray-200 w-72 h-12 mt-5 p-3 rounded-full flex-row items-center">
                <TextInput
                  placeholder="Current Password"
                  placeholderTextColor="#7b7b8b"
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  className="flex-1"
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <Image source={!showCurrentPassword ? icons.eye : icons.eyeHide}
                    style={{ width: 28, height: 28, opacity: 0.5 }}
                    resizeMode='contain' />
                </TouchableOpacity>
              </View>
              <View className="border-2 border-gray-200 w-72 h-12 mt-2.5 p-3 rounded-full flex-row items-center">
                <TextInput
                  placeholder="New Password"
                  placeholderTextColor="#7b7b8b"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  className="flex-1"
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Image source={!showNewPassword ? icons.eye : icons.eyeHide}
                    style={{ width: 28, height: 28, opacity: 0.5 }}
                    resizeMode='contain' />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleChangePassword} className="bg-primary py-3 rounded-full w-56 h-12 mt-10 mb-2.5">
                <Text className="text-white text-center text-base font-bold">Change Password</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={closeChangePasswordModal} className="bg-slate-200 py-3 rounded-full w-56 h-12 mb-2.5">
                <Text className="text-black text-center text-base font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </Provider>
  );
};

export default Profile;
