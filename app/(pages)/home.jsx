import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback, Keyboard, TextInput, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Provider } from 'react-native-paper';
import { db } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

const Home = () => {
  const [listsModalVisible, setListsModalVisible] = useState(false);
  const [createListsModalVisible, setCreateListsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [groceries, setGroceries] = useState([]);
  const [selectedGroceries, setSelectedGroceries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listName, setListName] = useState('Grocery List');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const screenHeight = Dimensions.get('window').height;

  const handleListsClose = () => {
    setListsModalVisible(false);
  };

  const handleCreateListsClose = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to exit?",
        [
          {
            text: "Cancel",
            onPress: () => { },
            style: "cancel"
          },
          {
            text: "Yes",
            onPress: () => {
              resetModalState();
              setCreateListsModalVisible(false);
              setListsModalVisible(true);
            }
          }
        ]
      );
    } else {
      resetModalState();
      setCreateListsModalVisible(false);
      setListsModalVisible(true);
    }
  };

  const resetModalState = () => {
    setSelectedGroceries([]);
    setSearchQuery('');
    setGroceries([]);
    setListName('Grocery List');
    setHasUnsavedChanges(false);
  };

  const handleCreateLists = () => {
    setListsModalVisible(false);
    setCreateListsModalVisible(true);
  };

  const handleSearch = async (queryString) => {
    setSearchQuery(queryString);
    setLoading(true);

    if (queryString.trim() === '') {
      setGroceries([]);
      setLoading(false);
      return;
    }

    try {
      const groceriesRef = collection(db, 'groceriesDB');
      const snapshot = await getDocs(groceriesRef);
      const allGroceries = snapshot.docs.map(doc => doc.id);


      const filteredGroceries = allGroceries.filter(item =>
        item.toLowerCase().startsWith(queryString.toLowerCase())
      );

      setGroceries(filteredGroceries);
    } catch (error) {
      console.error("Error searching for groceries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setGroceries([]);
  };

  const handleListNameChange = (text) => {
    setListName(text);
  };

  const handleAddToList = async (item) => {
    try {
      const newSelectedGroceries = [...selectedGroceries, item];
      setSelectedGroceries(newSelectedGroceries);
      setSearchQuery('');
      setGroceries([]);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error adding item to list:", error);
    }
  };

  return (
    <Provider>
      <View className="bg-white flex-1">
        <View className="flex-row justify-between items-center px-4 pt-12 h-1/8">
          <Text className="text-3xl font-bold">All My Groceries</Text>
        </View>

        <ScrollView>
          <View className="px-4 py-6">
            <TouchableOpacity onPress={() => setListsModalVisible(true)}>
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl font-bold text-primary mr-2">Lists</Text>
                <MaterialIcons name="arrow-forward-ios" size={20} color="#16c359" />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>


        <Modal
          transparent={true}
          visible={listsModalVisible}
          animationType="slide"
          onRequestClose={() => handleCreateListsClose()}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 justify-center bg-black/50">
              <View className="w-full h-full bg-white rounded-lg pt-16 px-8">

                <View className="mt-5 flex-row justify-between items-center mb-5">
                  <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => handleCreateListsClose()}>
                      <MaterialIcons name="arrow-back-ios" size={28} color="#16c359" />
                    </TouchableOpacity>
                    <Text className="text-3xl font-bold">Lists</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleCreateLists()} className="">
                    <MaterialIcons name="add" size={34} color="#16c359" />
                  </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal
          transparent={true}
          visible={createListsModalVisible}
          animationType="slide"
          onRequestClose={() => handleCreateListsClose()}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 justify-center bg-black/50">
              <View className="w-full h-full bg-white rounded-lg pt-16 px-8">
                <Text className="text-xl font-bold mb-4">Search For Groceries To Add</Text>
                <View className="flex-row items-center border border-gray-300 rounded-2xl p-2 mb-4 h-12">
                  <TextInput
                    placeholder="Add an item ..."
                    placeholderTextColor="#16c359"
                    value={searchQuery}
                    onChangeText={text => handleSearch(text)}
                    className="flex-1 px-2"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={handleClearSearch}>
                      <MaterialIcons name="cancel" size={24} color="gray" />
                    </TouchableOpacity>
                  )}
                </View>

                {loading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                  <View className="rounded-lg" style={{ maxHeight: screenHeight * 0.25, overflow: 'hidden' }}>
                    <ScrollView
                      showsVerticalScrollIndicator={true}
                      contentContainerStyle={{ paddingVertical: 4 }}
                    >
                      {groceries.map((item, index) => (
                        <View key={index}>
                          <TouchableOpacity
                            className="px-4"
                            onPress={() => handleAddToList(item)}
                          >
                            <Text className="text-lg font-semibold">{item}</Text>
                          </TouchableOpacity>

                          {index < groceries.length - 1 && (
                            <View className="border-b border-gray-300 my-2" />
                          )}
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}


                <View className="items-center py-5">
                  <TextInput
                    value={listName}
                    onChangeText={handleListNameChange}
                    className="border border-gray-300 rounded-xl p-2 w-3/4 text-center text-xl"
                    placeholder="Enter list name..."
                    placeholderTextColor="#000"
                  />
                </View>

                <View className="py-5">
                  <Text className="text-xl font-bold mb-2">Selected Items</Text>
                  {selectedGroceries.length > 0 ? (
                    <ScrollView className="h-full">
                      {selectedGroceries.map((item, index) => (
                        <View key={index} className="px-4 py-2 border-b border-gray-300">
                          <Text className="text-lg">{item}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  ) : (
                    <Text className="text-gray-500">No items selected</Text>
                  )}
                </View>


                <View className="flex-row justify-between mt-auto mb-4">
                  <TouchableOpacity onPress={handleCreateLists} className="py-2 px-4 bg-primary rounded-md">
                    <Text className="text-white">Create List</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCreateListsClose} className="py-2 px-4 bg-gray-200 rounded-md">
                    <Text>Close Modal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

      </View>
    </Provider>
  );
};

export default Home;
