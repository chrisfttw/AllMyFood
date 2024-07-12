import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../components/CustomButton';
import FormField from '../../components/FormField';
import { Link, useNavigation } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

const SignUp = () => {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const { username, email, password } = form;
      if (username && email && password) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: username });

        await setDoc(doc(db, 'users', user.uid), {
          username: username,
          email: email,
          userId: user.uid,
        });

        navigation.navigate('(pages)');
        Alert.alert('Success', 'User registered successfully!');
      } else {
        Alert.alert('Missing Fields', 'Please fill out all fields');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 100}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="w-full justify-center min-h-[85vh] px-4 my-6">
            <Text className="text-2xl text-white mt-10">Log in to All My Groceries</Text>

            <FormField 
              //title="Username"
              placeholder="Username"
              value={form.username}
              handleChangeText={(value) => handleInputChange('username', value)}
              otherStyles="mt-5"
            />

            <FormField 
              //title="Email"
              placeholder="Email"
              value={form.email}
              handleChangeText={(value) => handleInputChange('email', value)}
              otherStyles="mt-0"
              keyboardType="emailaddress"
            />

            <FormField 
              //title="Password"
              placeholder="Password"
              value={form.password}
              handleChangeText={(value) => handleInputChange('password', value)}
              otherStyles="mt-0"
            />

            <CustomButton 
              title="Sign Up"
              handlePress={submit}
              containerStyles="mt-16"
              isLoading={isSubmitting}
            />

          </View>
          </TouchableWithoutFeedback>
          <View className="justify-center flex-row gap-2 p-5" style={{ position: 'relative', bottom: 50, width: '100%' }}>
            <Text className="text-base text-white">Already have an account?</Text>
            <Link href="/signin" className="text-base text-blue-600">Sign in</Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
};

export default SignUp;
