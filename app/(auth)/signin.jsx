import { View, Text, ScrollView, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton'
import { Link, useNavigation } from 'expo-router'
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import the signInWithEmailAndPassword function from Firebase auth
import { auth } from '../../config/firebase';

const SignIn = () => {
  const navigation = useNavigation();

  const [form, setForm] = useState({
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
        await signInWithEmailAndPassword(auth, email, password);
        navigation.navigate('(pages)'); 
      } else {
        Alert.alert('Missing Fields', 'Please fill out all fields')
      }
    } catch (error) {
      console.error('Error:', error.message); // Log the error to console for debugging
      // Alert.alert('Error', error.message); // Remove this line
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
            //title="Email"
            placeholder="Email"
            value={form.email}
            handleChangeText={(value) => handleInputChange('email', value)}
            otherStyles="mt-5"
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
              Don't have an account?
            </Text> */}
            <Link href="/signup" className="text-lg text-blue-500">Create an account</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn