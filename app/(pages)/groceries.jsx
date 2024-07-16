import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Menu, Provider, Divider, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';

const Groceries = () => {
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState('');
  const textInputRef = useRef(null);
  const [quantity, setQuantity] = useState(0);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Apple', value: 'apple2' },
    { label: 'Apple', value: 'apple3' },
    { label: 'Apple', value: 'apple4' },
    { label: 'Apple', value: 'apple5' }
  ]);

  const incrementCount = () => {
    setQuantity(quantity + 1);
  };

  const decrementCount = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

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

  const handleClose = () => {
    if (text.trim().length > 0) {
      Alert.alert(
        'Submit Grocery',
        'Are you sure you want to close without submitting?',
        [
          {
            text: 'Yes',
            onPress: () => {
              setText('');
              setQuantity(0);
              setValue(null);
              setModalVisible(false);
            },
          },
          {
            text: 'No',
            style: 'cancel',
          },
        ],
        { cancelable: false }
      );
    } else {
      setText('');
      setQuantity(0);
      setValue(null);
      setModalVisible(false);
    }
  };


  return (
    <Provider>
      <View className="bg-white flex-1">
        <View className="flex-row justify-between items-center px-4 pt-12 h-1/6">
          <Text className="text-3xl font-bold">Groceries</Text>

          <TouchableOpacity onPress={() => setModalVisible(true)} className="pl-4">
            <MaterialIcons name="add" size={34} color="#16c359" />
          </TouchableOpacity>
        </View>

        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => handleClose()}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 justify-center bg-black/50">
              <View className="w-full h-full bg-white rounded-lg pt-16 pb-8 px-8 items-center">
                <TouchableOpacity onPress={() => handleClose()} className="absolute top-0 left-0 px-7 mt-20">
                  <MaterialIcons name="close" size={34} color="#16c359" />
                </TouchableOpacity>

                <View className="mt-52">
                  <Text className="text-3xl font-bold">Enter Your Grocery</Text>
                </View>
                <TouchableOpacity onPress={() => textInputRef.current.focus()} className="w-64 mt-10">
                  <View className="border-2 border-gray-200 w-full h-12 p-3 rounded-lg focus:border-primary flex-row items-center">
                    <TextInput
                      ref={textInputRef}
                      value={text}
                      onChangeText={setText}
                      placeholder="Enter Grocery Name"
                      placeholderTextColor="#7b7b8b"
                      className="flex-1"
                      style={{
                        color: '#000',
                        fontSize: 16,
                        paddingLeft: 10,
                        paddingRight: 10,
                      }}
                    />
                  </View>
                </TouchableOpacity>

                <View className="w-1/2 flex-row justify-between px-5 align-center mt-5">
                  <TouchableOpacity onPress={decrementCount}>
                    <MaterialCommunityIcons name="minus-box" size={40} color="#16c359" />
                  </TouchableOpacity>
                  <Text className="text-3xl font-normal">
                    {quantity}
                  </Text>
                  <TouchableOpacity onPress={incrementCount}>
                    <MaterialCommunityIcons name="plus-box" size={40} color="#16c359" />
                  </TouchableOpacity>
                </View>
                <Text className="font-semibold">
                  qty
                </Text>

                <View className="w-72 flex-row justify-between px-5 align-center mt-5">
                  <DropDownPicker
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    placeholder="Select Type"
                    maxHeight={150}
                    containerStyle={{ height: 50, width: '100%' }}
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#ccc', borderWidth: 2, borderRadius: 10 }}
                    dropDownStyle={{ backgroundColor: '#FFFFFF', maxHeight: 24 }}
                    onChangeItem={(item) => setSelectedType(item.value)}
                  />
                </View>

                <View className="absolute bottom-10 w-full align-center">
                  <TouchableOpacity onPress={() => { }} className="bg-primary py-4 rounded-md w-full mb-5">
                    <Text className="text-white text-center text-base font-semibold">Submit Grocery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleClose} className="bg-slate-200 py-4 rounded-md w-full">
                    <Text className="text-black text-center text-base font-semibold">Cancel Grocery</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

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
                <MaterialIcons name='arrow-drop-down' size={20} color="#16c359" />
              </TouchableOpacity>
            }
            style={{ marginTop: 25 }}
            contentStyle={{ borderRadius: 5, backgroundColor: '#FFFFFF' }}
          >
            <Menu.Item onPress={() => { }} title="A-Z" />
            <Divider />
            <Menu.Item onPress={() => { }} title="Z-A" />
          </Menu>

          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setFilterMenuVisible(true)} className="flex-row items-center">
                <Text className="text-base font-bold text-primary">Filter</Text>
                <MaterialIcons name='arrow-drop-down' size={20} color="#16c359" />
              </TouchableOpacity>
            }
            style={{ marginTop: 25 }}
            contentStyle={{ borderRadius: 5, backgroundColor: '#FFFFFF' }}
          >
            <Menu.Item onPress={() => { }} title="A-Z" />
            <Divider />
            <Menu.Item onPress={() => { }} title="Most Popular" />
            <Divider />
            <Menu.Item onPress={() => { }} title="Newest" />
          </Menu>
        </View>

        <View className="flex-1 px-4 pt-2">
          <Text className="text-xl font-bold mb-2">Other Groceries</Text>
          <ScrollView style={{ maxHeight: 'calc(100% - 90px)' }}>
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
