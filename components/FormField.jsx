import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import icons from '../constants/icons'

const FormField = ({ title, value, placeholder, handleChangeText, otherStyles, ...props }) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <View className={`space-y-2 ${otherStyles}`}>
            <Text className="text-base text-gray-100">{title}</Text>

            <View className="border-2 border-gray-200 w-full h-16 px-4 bg-green-50 rounded-2xl focus:border-secondary items-center flex-row">
                <TextInput 
                    className="flex-1 text-black text-base"
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor="#7b7b8b"
                    onChangeText={handleChangeText}
                    secureTextEntry={placeholder === 'Password' && !showPassword}
                />

                {placeholder === 'Password' && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Image source={!showPassword ? icons.eye : icons.eyeHide}
                        style={{ width: 32, height: 32, opacity:0.5}}
                        resizeMode='contain'/>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

export default FormField
