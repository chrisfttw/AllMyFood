import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Menu, Provider, Divider, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

const Groceries = () => {
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);

  const [expiringSoon, setExpiringSoon] = useState([
    { name: 'Orange', expiration: '2024-08-01' },
    { name: 'Oreos', expiration: '2024-08-05' },
    { name: 'Apple', expiration: '2024-08-10' },
    { name: 'Ben & Jerrys Ice Cream', expiration: '2024-08-15' },
    { name: 'Takis', expiration: '2024-08-20' },
    { name: 'Hotdog Buns', expiration: '2024-07-15' },
    { name: 'Instant Yeast', expiration: '2024-07-25' },
    { name: 'Modelo', expiration: '2024-08-28' },
    { name: 'Spinach', expiration: '2024-09-14' },
    { name: 'Sumo Orange', expiration: '2024-07-12' },
  ]);

  const [otherGroceries, setOtherGroceries] = useState([
    { name: 'Milk', category: 'Dairy' },
    { name: 'Bread', category: 'Bakery' },
    { name: 'Eggs', category: 'Dairy' },
    { name: 'Chicken', category: 'Meat' },
    { name: 'Apples', category: 'Fruit' },
    { name: 'Carrots', category: 'Vegetable' },
    { name: 'Rice', category: 'Grain' },
    { name: 'Pasta', category: 'Grain' },
    { name: 'Salad Mix', category: 'Vegetable' },
    { name: 'Yogurt', category: 'Dairy' },
  ]);

  useEffect(() => {
    const today = new Date();
    const updatedExpiringSoon = expiringSoon.map(item => {
      const expirationDate = new Date(item.expiration);
      const timeDiff = expirationDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return { ...item, daysUntilExpiration: daysDiff };
    });
    setExpiringSoon(updatedExpiringSoon);
  }, []);

  return (
    <Provider>
      <View className="bg-white flex-1">
        <View className="flex-row justify-between items-center px-4 pt-12 h-1/6">
          <Text className="text-3xl font-bold">Groceries</Text>

          <TouchableOpacity onPress={() => console.log('Add')} className="pl-4">
            <MaterialIcons name="add" size={34} color="#16c359" />
          </TouchableOpacity>
        </View>

        <View className="px-4 py-6">
          <Text className="text-xl font-bold mb-2">Expiring Soon</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {expiringSoon.map((item, index) => (
              <View key={index} className="flex-col items-left mr-2">
                <View className="bg-gray-200 rounded-lg px-4 py-2 mb-2 h-36 w-36">
                  <Text className="font-bold bg-gray-300 align-bottom">{item.name}</Text>
                </View>
                <Text className="font-medium">{item.daysUntilExpiration !== undefined ? `Expires in ${item.daysUntilExpiration} days` : 'No expiration date'}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

    <View className="flex-row justify-between items-center px-4 pt-4">
      <Menu
        visible={sortMenuVisible}
        onDismiss={() => setSortMenuVisible(false)}
        anchor={
          <TouchableOpacity onPress={() => setSortMenuVisible(true)} className="flex-row items-center">
            <Text className="text-base font-bold text-primary">Sort</Text>
          </TouchableOpacity>
        }
        style={{ marginTop: 25 }}
        contentStyle={{ borderRadius: 5, backgroundColor:'#FFFFFF'}}
      >
        <Menu.Item onPress={() => {}} title="A-Z" />
        <Divider />
        <Menu.Item onPress={() => {}} title="Z-A" />
      </Menu>

      <Menu
        visible={filterMenuVisible}
        onDismiss={() => setFilterMenuVisible(false)}
        anchor={
          <TouchableOpacity onPress={() => setFilterMenuVisible(true)} className="flex-row items-center">
            <Text className="text-base font-bold text-primary">Filter</Text>
          </TouchableOpacity>
        }
        style={{ marginTop: 25 }}
        contentStyle={{ borderRadius: 5, backgroundColor:'#FFFFFF'}}
      >
        <Menu.Item onPress={() => {}} title="A-Z" />
        <Divider />
        <Menu.Item onPress={() => {}} title="Most Popular" />
        <Divider />
        <Menu.Item onPress={() => {}} title="Newest" />
      </Menu>
    </View>

        <View className="flex-1 px-4 pt-2">
          <Text className="text-xl font-bold mb-2">Other Groceries</Text>
          <ScrollView style={{ maxHeight: 'calc(100% - 90px)'}}>
            {otherGroceries.map((item, index) => (
              <View key={index} className="bg-gray-200 rounded-lg px-4 py-2 m-2 h-24">
                <Text>{item.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Provider>
  );
};

export default Groceries;
