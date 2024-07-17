import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, TouchableWithoutFeedback, Keyboard, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Menu, Provider, Divider, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { db, auth } from '../../config/firebase';
import { getFirestore, doc, deleteDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Groceries = () => {
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [addAnotherModalVisible, setAddAnotherModalVisible] = useState(false);
  const [text, setText] = useState('');
  const textInputRef = useRef(null);
  const [quantity, setQuantity] = useState(0);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: 'Fruit', value: 'fruit' },
    { label: 'Vegatable', value: 'vegatable' },
    { label: 'Grain', value: 'grain' },
    { label: 'Protein', value: 'protein' },
    { label: 'Dairy', value: 'dairy' },
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

  const [otherGroceries, setOtherGroceries] = useState([]);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUser(user);
        fetchGroceries(user.uid);
      }
    });
    return unsubscribe;
  }, []);

  const fetchGroceries = async (uid) => {
    const groceriesRef = collection(db, `users/${uid}/groceries`);
    const querySnapshot = await getDocs(groceriesRef);
    const groceriesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setOtherGroceries(groceriesList);
  };


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

  const saveGroceryItem = async () => {
    if (text.trim().length > 0 && selectedType && quantity > 0) {
      setIsSubmitting(true);
      try {
        await addDoc(collection(db, `users/${user.uid}/groceries`), {
          name: text,
          category: selectedType,
          quantity: quantity,
        });
        setText('');
        setQuantity(0);
        setValue(null);
        setSelectedType('');
        setModalVisible(false);
        fetchGroceries(user.uid);
        setAddAnotherModalVisible(true);
      } catch (error) {
        console.error('Error adding document: ', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      Alert.alert('Please enter all fields');
    }
  };

  const handleAddAnother = () => {
    setAddAnotherModalVisible(false);
    setModalVisible(true);
  };

  const handleFinish = () => {
    setAddAnotherModalVisible(false);
  };

  const handleEditItem = async () => {
    if (editText.trim().length > 0 && editSelectedType && editQuantity > 0) {
      setIsSubmitting(true);
      try {
        await updateDoc(doc(db, `users/${user.uid}/groceries`, selectedItem.id), {
          name: editText,
          category: editSelectedType,
          quantity: editQuantity,
        });
        setEditText('');
        setEditQuantity(0);
        setValue(null);
        setEditSelectedType('');
        setEditModalVisible(false);
        fetchGroceries(user.uid);
      } catch (error) {
        console.error('Error updating document: ', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      Alert.alert('Please enter all fields');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      if (!id) {
        console.error("No ID provided for deletion");
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        console.error("No user is authenticated");
        return;
      }

      const groceryDocPath = `users/${user.uid}/groceries/${id}`;
      const groceryDocRef = doc(db, groceryDocPath);

      await deleteDoc(groceryDocRef);

      setOtherGroceries((prevGroceries) => prevGroceries.filter(item => item.id !== id));
      setExpiringSoon((prevGroceries) => prevGroceries.filter(item => item.id !== id));
      console.log('Document successfully deleted!');
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Delete Grocery",
      "Are you sure you want to delete this item?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => handleDeleteItem(id)
        }
      ],
      { cancelable: false }
    );
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

                <View className="mt-44">
                  <Text className="text-3xl font-bold">Enter Your Grocery</Text>
                </View>
                <TouchableOpacity onPress={() => textInputRef.current.focus()} className="w-64 mt-10">
                  <View className="border-2 border-gray-200 w-full h-12 p-3 rounded-full focus:border-primary flex-row items-center">
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
                    <MaterialCommunityIcons name="minus-circle" size={40} color="#16c359" />
                  </TouchableOpacity>
                  <Text className="text-3xl font-normal">
                    {quantity}
                  </Text>
                  <TouchableOpacity onPress={incrementCount}>
                    <MaterialCommunityIcons name="plus-circle" size={40} color="#16c359" />
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
                    placeholderStyle={{ color: "#7b7b8b" }}
                    arrowIconStyle={{ width: 20 }}
                    maxHeight={150}
                    itemSeparator={true}
                    containerStyle={{ height: 50, width: '100%' }}
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#e5e7eb', borderWidth: 2, borderRadius: 30 }}
                    dropDownContainerStyle={{ borderColor: "#e5e7eb", borderWidth: 2, borderRadius: 30 }}
                    itemSeparatorStyle={{ backgroundColor: "#e5e7eb", marginVertical: 6 }}
                    textStyle={{ fontSize: 14, color: '#000000' }}
                    onChangeValue={(item) => setSelectedType(item)}
                  />
                </View>

                <View className="absolute bottom-10 w-full justify-center align-center">
                  <TouchableOpacity
                    onPress={() => saveGroceryItem()}
                    className="bg-primary py-4 rounded-full w-full h-14 mb-5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white text-center text-lg font-bold">Add Grocery</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleClose} className="bg-slate-200 py-4 rounded-full w-full h-14 mb-5">
                    <Text className="text-black text-center text-lg font-bold">Cancel Grocery</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal
          transparent={true}
          visible={addAnotherModalVisible}
          animationType="slide"
          onRequestClose={() => setAddAnotherModalVisible(false)}
        >
          <View className="w-full h-full bg-white pt-16 px-8 items-center flex-col">
            <View className="w-full h-full my-64">
              <Text className="text-2xl text-center font-semibold mb-5">Would you like to add another grocery item?</Text>
              <TouchableOpacity
                onPress={handleAddAnother}
                className="bg-primary py-4 rounded-full w-full h-14 mb-5"
              >
                <Text className="text-white text-center text-lg font-bold">Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFinish}
                className="bg-slate-200 py-4 rounded-full w-full h-14 mb-5"
              >
                <Text className="text-black text-center text-lg font-bold">No</Text>
              </TouchableOpacity>
            </View>
          </View>
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
            <Divider />
            <Menu.Item onPress={() => { }} title="Expiring Soon" />
            <Divider />
            <Menu.Item onPress={() => { }} title="Expiring Latest" />
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
              <View key={index} className="bg-gray-200 rounded-lg px-4 py-2 m-2 h-24 flex-row justify-between items-center">
                <Text>{item.name}</Text>
                <Text>{item.quantity}</Text>
                <View className="flex-col">
                  <TouchableOpacity className="mb-5" onPress={() => {
                    setEditText(item.name);
                    setEditQuantity(item.quantity);
                    setEditSelectedType(item.category);
                    setSelectedItem(item);
                    setEditModalVisible(true);
                  }}>
                    <MaterialIcons name="edit" size={24} color="#16c359" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(item.id)}>
                    <MaterialIcons name="delete" size={24} color="#DC143C" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Provider>
  );
};

export default Groceries;
