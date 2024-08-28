import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback, Keyboard, TextInput, ActivityIndicator, Dimensions, Alert, FlatList, KeyboardAvoidingView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Provider } from 'react-native-paper';
import { db } from '../../config/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Home = () => {
  const [listsModalVisible, setListsModalVisible] = useState(false);
  const [createListsModalVisible, setCreateListsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [groceries, setGroceries] = useState([]);
  const [selectedGroceries, setSelectedGroceries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listName, setListName] = useState('Grocery List');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [userLists, setUserLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    fetchUserLists();
  }, []);

  const fetchUserLists = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      const listsRef = collection(db, `users/${user.uid}/lists`);
      const snapshot = await getDocs(listsRef);
      const listsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setUserLists(listsData);
    } catch (error) {
      console.error("Error fetching user lists:", error);
      Alert.alert("Error", "Failed to fetch user lists");
    }
  };

  const handleListsClose = () => {
    setListsModalVisible(false);
  };

  const handleCreateListsOpen = () => {
    setListsModalVisible(false);
    setCreateListsModalVisible(true);
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

  const handleCreateLists = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    if (listName.trim() === '') {
      Alert.alert("Error", "List name cannot be empty");
      return;
    }

    if (selectedGroceries.length === 0) {
      Alert.alert("Error", "No items selected");
      return;
    }

    try {
      // Check if a list with the same name already exists
      let finalListName = listName;
      const existingListNames = userLists.map(list => list.name);
      let counter = 1;

      while (existingListNames.includes(finalListName)) {
        finalListName = `${listName} (${counter})`;
        counter++;
      }

      const listRef = doc(db, `users/${user.uid}/lists`, finalListName);

      await setDoc(listRef, {
        name: finalListName,
        items: selectedGroceries
      });

      Alert.alert("Success", "Grocery list created successfully");

      resetModalState();
      setCreateListsModalVisible(false);
      fetchUserLists();
      setListsModalVisible(true);
    } catch (error) {
      console.error("Error creating grocery list:", error);
      Alert.alert("Error", "Failed to create grocery list");
    }
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
      if (!selectedGroceries.includes(item)) {
        const newSelectedGroceries = [...selectedGroceries, item];
        setSelectedGroceries(newSelectedGroceries);
        setSearchQuery('');
        setGroceries([]);
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error("Error adding item to list:", error);
    }
  };

  const confirmDeleteList = (listId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this list?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => handleDeleteList(listId),
          style: "destructive",
        },
      ]
    );
  };

  const handleDeleteList = async (listId) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      const listRef = doc(db, `users/${user.uid}/lists`, listId);
      await deleteDoc(listRef);

      Alert.alert("Success", "Grocery list deleted successfully");

      fetchUserLists(); // Refresh the lists after deletion
    } catch (error) {
      console.error("Error deleting grocery list:", error);
      Alert.alert("Error", "Failed to delete grocery list");
    }
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${item}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            // Add logic to delete the item from the list
            const updatedItems = selectedList.items.filter(i => i !== item);
            // Update state or database with the new list of items
            updateItemList(updatedItems);
          }
        }
      ]
    );
  };

  const openDetailsModal = (list) => {
    setSelectedList(list);
    setDetailsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setSelectedList(null);
    setDetailsModalVisible(false);
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {userLists.length > 0 ? (
                userLists.map((item, index) => (
                  <TouchableOpacity key={index} onPress={() => openDetailsModal(item)}>
                    <View className="flex-col items-left mr-2">
                      <View className="bg-gray-200 rounded-lg px-4 py-2 mb-2 h-36 w-36">
                        <Text className="font-bold bg-gray-300 align-bottom">{item.name}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="flex-col items-left mr-2">
                  <View className="bg-gray-200 rounded-lg px-4 py-2 mb-2 h-36 w-36">
                    <Text className="font-bold text-center">Create a list</Text>
                  </View>
                </View>
              )}
            </ScrollView>

          </View>
        </ScrollView>

        <Modal
          transparent={true}
          visible={listsModalVisible}
          animationType="slide"
          onRequestClose={() => handleCreateListsClose()}
        >
          <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
            <View className="flex-1 justify-center bg-black/50">
              <View className="w-full h-full bg-white rounded-lg pt-16 px-8">
                <View className="mt-5 flex-row justify-between items-center mb-5">
                  <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => handleListsClose()}>
                      <MaterialIcons name="arrow-back-ios" size={28} color="#16c359" />
                    </TouchableOpacity>
                    <Text className="text-3xl font-bold">Lists</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleCreateListsOpen()}>
                    <MaterialIcons name="add" size={34} color="#16c359" />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={userLists}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View className="px-4 py-2 border-b border-gray-300 flex-row justify-between items-center">
                      <View style={{ flex: 1 }}>
                        <Text className="text-lg font-bold">{item.name}</Text>
                        {item.items && item.items.length > 0 ? (
                          <Text className="text-gray-600">Items: {item.items.join(', ')}</Text>
                        ) : (
                          <Text className="text-gray-500">No items</Text>
                        )}
                      </View>
                      <TouchableOpacity onPress={() => confirmDeleteList(item.id)} style={{ paddingLeft: 10 }}>
                        <MaterialIcons name="delete" size={24} color="#ff0000" />
                      </TouchableOpacity>
                    </View>
                  )}
                  contentContainerStyle={{ flexGrow: 1, paddingVertical: 4 }}
                  showsVerticalScrollIndicator={true}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <Modal
          transparent={true}
          visible={createListsModalVisible}
          animationType="slide"
          onRequestClose={() => handleCreateListsClose()}
        >
          <View className="flex-1 justify-center bg-black/50">
            <View className="w-full h-full bg-white rounded-lg pt-16 px-8">
              <View className="items-center py-5">
                <View className="border border-gray-300 rounded-xl p-2 w-3/4 text-center text-xl flex-row relative">
                  <TextInput
                    value={listName}
                    onChangeText={handleListNameChange}
                    className="text-center text-xl flex-1"
                    placeholder="Enter list name..."
                    placeholderTextColor="#808080"
                  />
                  <MaterialIcons
                    name="edit"
                    size={25}
                    color="#808080"
                    className="absolute right-0"
                  />
                </View>
              </View>
              <View className="flex-row items-center border border-gray-300 rounded-2xl p-2 mb-4 h-12">
                <MaterialIcons
                  name="search"
                  size={25}
                  color="#808080"
                  className="absolute left-0"
                />
                <TextInput
                  placeholder="Search For Groceries To Add"
                  placeholderTextColor="gray"
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
                <ActivityIndicator size="medium" color="#808080" />
              ) : (
                <View className="rounded-lg" style={{ maxHeight: screenHeight * 0.25 }}>
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

              <View className="py-5">
                <Text className="text-xl font-bold mb-2 py-2">Selected Items</Text>
                <ScrollView style={{ maxHeight: screenHeight * 0.55 }}>
                  {selectedGroceries.length > 0 ? (
                    selectedGroceries.map((item, index) => (
                      <View key={index} className="px-4 py-2 border-b border-gray-300">
                        <Text className="text-lg">{item}</Text>
                      </View>
                    ))
                  ) : (
                    <Text className="text-gray-500">No items selected</Text>
                  )}
                </ScrollView>
              </View>

              <View className="bg-white flex-row justify-between mt-auto mb-8">
                <TouchableOpacity onPress={handleCreateLists} className="py-4 px-9 bg-primary w-1/2 items-center rounded-full">
                  <Text className="text-white text-lg">Create List</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCreateListsClose} className="py-4 px-9 bg-gray-200 w-1/2 items-center rounded-full">
                  <Text className="text-lg">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          transparent={true}
          visible={detailsModalVisible}
          animationType="slide"
          onRequestClose={() => closeDetailsModal()}
        >
          <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
            <View className="flex-1 justify-center bg-black/50">
              <View className="w-full h-full bg-white rounded-lg pt-16 px-8">
                <View className="flex-row justify-between items-center mb-5">
                  <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => closeDetailsModal()}>
                      <MaterialIcons name="arrow-back-ios" size={28} color="#16c359" />
                    </TouchableOpacity>
                    <Text className="text-3xl font-bold">{selectedList ? selectedList.name : 'List Details'}</Text>
                  </View>
                </View>

                <ScrollView style={{ maxHeight: screenHeight * 0.9 }}>
                  {selectedList && selectedList.items && selectedList.items.length > 0 ? (
                    selectedList.items.map((item, index) => (
                      <View key={index} className="px-4 py-2 border-b border-gray-300">
                        <Text className="text-lg">{item}</Text>
                      </View>
                    ))
                  ) : (
                    <Text className="text-gray-500 text-center">No items available</Text>
                  )}
                </ScrollView>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

      </View>
    </Provider>
  );
};

export default Home;
