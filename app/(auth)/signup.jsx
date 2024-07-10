import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../components/CustomButton';
import FormField from '../../components/FormField';
import { Link, useNavigation } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';

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
      const { email, password } = form;
      if (email && password) {
        await createUserWithEmailAndPassword(auth, email, password);
        navigation.navigate('(pages)'); // Navigate to pages screen upon successful signup
        Alert.alert('Success', 'User registered successfully!');
      } else {
        throw new Error('Please fill out all fields.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full"> 
      <ScrollView>
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
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-16"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            {/* <Text className="text-lg text-white">
              Already have an account?
            </Text> */}
            <Link href="/signin" className="text-lg text-blue-500">Already have an account?</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
};

export default SignUp;
