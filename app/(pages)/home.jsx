import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback, Keyboard, TextInput, ActivityIndicator, Dimensions, Alert, FlatList, KeyboardAvoidingView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Divider, Menu, Provider, Portal } from 'react-native-paper';
import { db } from '../../config/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, updateDoc, getDoc, arrayRemove } from 'firebase/firestore';
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
  const [detailsInMenuModalVisible, setDetailsInMenuModalVisible] = useState(false);
  const [editSearchVisible, setEditSearchVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [detailsOptionsVisible, setDetailsOptionsVisible] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    fetchUserLists();
  }, []);

  const auth = getAuth();
  const user = auth.currentUser;

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

      const filteredGroceries = allGroceries
        .filter(item => item.toLowerCase().includes(queryString.toLowerCase()))
        .sort((a, b) => a.localeCompare(b));

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

      fetchUserLists();
      closeDetailsModal();
      closeDetailsInMenuModal();
    } catch (error) {
      console.error("Error deleting grocery list:", error);
      Alert.alert("Error", "Failed to delete grocery list");
    }
  };

  const deleteItemFromList = async (listName, item, user) => {
    if (!user || !user.uid) {
      console.error("User ID is not defined");
      return;
    }

    try {
      const listDocRef = doc(db, `users/${user.uid}/lists/${listName}`);

      const listDoc = await getDoc(listDocRef);
      if (!listDoc.exists()) {
        console.error("List document does not exist");
        return;
      }

      await updateDoc(listDocRef, {
        items: arrayRemove(item),
      });

      setSelectedList(prevList => ({
        ...prevList,
        items: prevList.items.filter(listItem => listItem !== item)
      }));

      await fetchUserLists();

    } catch (error) {
      console.error("Error removing item:", error);
      Alert.alert("Error", "Failed to remove the item from the list");
    }
  };

  const handleDeleteItem = (listName, item, user) => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete "${item}" from the list?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => deleteItemFromList(listName, item, user),
          style: "destructive"
        }
      ]
    );
  };

  const openDetailsModal = (list) => {
    setListsModalVisible(false);
    setSelectedList(list);
    setDetailsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setSelectedList(null);
    setDetailsModalVisible(false);
    setIsEditMode(false);
  };

  const openDetailsInMenuModal = (list) => {
    setListsModalVisible(false);
    setSelectedList(list);
    setDetailsInMenuModalVisible(true);
  }

  const closeDetailsInMenuModal = () => {
    setSelectedList(null);
    setDetailsInMenuModalVisible(false);
    setListsModalVisible(true);
    setIsEditMode(false);
  }

  const openEditModal = (list) => {
    setSelectedList(list);
    setListName(list.name);
    setSelectedGroceries(list.items || []);
    setEditSearchVisible(true);
  };

  return (
    <Provider>
      <View className="bg-white flex-1">
        <View className="flex-row justify-between items-center px-4 pt-20 h-1/8">
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
                        <Text className="font-bold align-bottom font-bold text-lg">{item.name}</Text>
                        <Text className="text-base">{item.items ? `Items: ${item.items.length}` : 'No items'}</Text>
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
          style={{ position: 'absolute', zIndex: 1 }}
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
                <ScrollView
                  contentContainerStyle={{ flexGrow: 1, paddingVertical: 4 }}
                  showsVerticalScrollIndicator={true}
                >
                  {userLists.map((item) => (
                    <View key={item.id} className="px-4 py-2 border-b border-gray-300 flex-row justify-between items-center">
                      <TouchableOpacity style={{ flex: 1 }} onPress={() => openDetailsInMenuModal(item)}>
                        <Text className="text-lg font-bold">{item.name}</Text>
                        {item.items && item.items.length > 0 ? (
                          <Text className="text-gray-600">Items: {item.items.join(', ')}</Text>
                        ) : (
                          <Text className="text-gray-500">No items</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => confirmDeleteList(item.id)}
                        style={{ paddingLeft: 10 }}
                      >
                        <MaterialIcons name="delete" size={24} color="#E57373" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <Modal
          transparent={true}
          visible={createListsModalVisible}
          animationType="slide"
          onRequestClose={() => handleCreateListsClose()}
          style={{ position: 'absolute', zIndex: 2 }}
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
              <View className="w-full h-full bg-white rounded-lg pt-20 px-8">
                <View className="flex-row justify-between items-center mb-7">
                  <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => closeDetailsModal()}>
                      <MaterialIcons name="arrow-back-ios" size={28} color="#16c359" />
                    </TouchableOpacity>
                    <Text className="text-3xl font-bold">
                      {selectedList ? selectedList.name : 'List Details'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsEditMode(!isEditMode)}
                    className="py-0 px-5 bg-primary items-center rounded-full"
                  >
                    <Text className="text-white text-lg font-semibold">Edit</Text>
                  </TouchableOpacity>
                </View>

                {isEditMode && (
                  <View className="border-b-0 border-gray-400 mb-4">
                    <View>
                      <View
                        className={`flex-row items-center border border-gray-300 p-2 mb-0 h-12 ${searchQuery.length && groceries.length > 0 ? 'rounded-tl-2xl rounded-tr-2xl' : 'rounded-2xl'
                          }`}
                      >
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

                      {groceries.length > 0 && (
                        <View
                          className="rounded-bl-2xl rounded-br-2xl border border-gray-300"
                          style={{
                            maxHeight: screenHeight * 0.25,
                            overflow: 'hidden',
                            marginTop: -1,
                          }}
                        >
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
                                  <View className="border-b border-gray-300 my-1 w-full" />
                                )}
                              </View>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                <ScrollView style={{ maxHeight: screenHeight * 0.9 }}>
                  {selectedList && selectedList.items && selectedList.items.length > 0 ? (
                    selectedList.items.map((item, index) => (
                      <View key={index} className="px-0 py-2 border-b border-gray-300 flex-row justify-between items-center">
                        <Text className="text-lg">{item}</Text>
                        {isEditMode && (
                          <TouchableOpacity onPress={() => handleDeleteItem(selectedList.name, item, user)}>
                            <MaterialIcons name="delete" size={24} color="#E57373" />
                          </TouchableOpacity>
                        )}
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


        <Modal
          transparent={true}
          visible={detailsInMenuModalVisible}
          animationType="slide"
          onRequestClose={() => closeDetailsInMenuModal()}
          style={{ position: 'absolute', zIndex: 3 }}
        >
          <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
            <View className="flex-1 justify-center bg-black/50">
              <View className="w-full h-full bg-white rounded-lg pt-20 px-8">
                <View className="flex-row justify-between items-center mb-7">
                  <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => closeDetailsInMenuModal()}>
                      <MaterialIcons name="arrow-back-ios" size={28} color="#16c359" />
                    </TouchableOpacity>
                    <Text className="text-3xl font-bold">{selectedList ? selectedList.name : 'List Details'}</Text>
                  </View>
                  <TouchableOpacity
                    className="fixed right-0"
                    onPress={() => confirmDeleteList(selectedList.id)}
                    style={{ paddingLeft: 10 }}
                  >
                    <MaterialIcons name="delete" size={24} color="#E57373" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: screenHeight * 0.9 }}>
                  {selectedList && selectedList.items && selectedList.items.length > 0 ? (
                    selectedList.items.map((item, index) => (
                      <View key={index} className="px-0 py-2 border-b border-gray-300 flex-row justify-between items-center">
                        <Text className="text-lg">{item}</Text>
                        <TouchableOpacity onPress={() => handleDeleteItem(selectedList.name, item, user)}>
                          <MaterialIcons name="delete" size={24} color="#E57373" />
                        </TouchableOpacity>
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
