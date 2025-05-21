import { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

const avatarList = [
  { id: 0, label: '🐱', color: '#FFD700' },
  { id: 1, label: '🐶', color: '#87CEEB' },
  { id: 2, label: '🦊', color: '#FF8C00' },
  { id: 3, label: '🐸', color: '#32CD32' },
  { id: 4, label: '🐵', color: '#A0522D' },
  { id: 5, label: '🦄', color: '#DA70D6' },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileSetupScreen() {
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const navigation = useNavigation<NavigationProp>();

  const handleContinue = async () => {
    if (!nickname || selectedAvatar === null) return;

    await AsyncStorage.setItem('nickname', nickname);
    await AsyncStorage.setItem('avatarIndex', selectedAvatar.toString());

    navigation.navigate('Home');
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 16, textAlign: 'center' }}>👤 Створення профілю</Text>

      <TextInput
        placeholder="Введи нікнейм"
        value={nickname}
        onChangeText={setNickname}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 10,
          marginBottom: 20,
        }}
      />

      <Text style={{ marginBottom: 8, fontSize: 16 }}>Оберіть аватарку:</Text>
      <FlatList
        horizontal
        data={avatarList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelectedAvatar(item.id)} style={{ marginRight: 10 }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: item.color,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: selectedAvatar === item.id ? 3 : 0,
                borderColor: '#007bff',
              }}
            >
              <Text style={{ fontSize: 24 }}>{item.label}</Text>
            </View>
          </Pressable>
        )}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Продовжити" onPress={handleContinue} disabled={!nickname || selectedAvatar === null} />
      </View>
    </View>
  );
}
