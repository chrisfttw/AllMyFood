import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButton';


export default function App() {
  return (
    <SafeAreaView className="bg-secondary h-full">
      <ScrollView contentContainerStyle={{ height: '100%'}}>
        <View className="w-full justify-center items-center h-[85vh] px-4">
          <Text className="text-3xl">All My Food</Text>
          <StatusBar style="auto" />
          <Link href="/home" style={{ color: 'blue' }}> go to home </Link>

            <CustomButton 
              title="Welcome!"
              handlePress={() => router.push('signin')}
              containerStyles="w-full mt-7"
            />
        </View>
      </ScrollView>

      <StatusBar backgroundColor='#161622' style='dark'/>
    </SafeAreaView>
  );
}
