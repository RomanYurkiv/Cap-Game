import { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity, Alert } from 'react-native';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const [nickname, setNickname] = useState('');
  const [avatarIndex, setAvatarIndex] = useState<number | null>(null);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const loadProfile = async () => {
      const nick = await AsyncStorage.getItem('nickname');
      const avatar = await AsyncStorage.getItem('avatarIndex');
      if (!nick || avatar === null) {
        navigation.navigate('Profile');
        return;
      }
      setNickname(nick);
      setAvatarIndex(Number(avatar));
    };
    loadProfile();
  }, []);

  const handleLanguageToggle = () => {
    Alert.alert('🌐 Зміна мови', 'Поки що заглушка. Далі зробимо i18n 😊');
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'space-between' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
        {/* Бургер */}
        <TouchableOpacity onPress={() => Alert.alert('📜 Модалка з правилами / політикою')}>
          <Text style={{ fontSize: 24 }}>☰</Text>
        </TouchableOpacity>

        <Text style={{ flex: 1, textAlign: 'center', fontSize: 28, fontWeight: 'bold' }}>
          Шляпа
        </Text>

        <View style={{ width: 30 }} />
      </View>

      {/* Avatar + Nick */}
      <View style={{ alignItems: 'center', marginTop: 40 }}>
        {avatarIndex !== null && (
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: avatarList[avatarIndex].color,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 36 }}>{avatarList[avatarIndex].label}</Text>
          </View>
        )}
        <Text style={{ fontSize: 20 }}>{nickname}</Text>
      </View>

      {/* Buttons */}
      <View style={{ gap: 16 }}>
        <Button title="🎲 Створити гру" onPress={() => navigation.navigate('CreateGame')} />
        <Button title="🔑 Приєднатись" onPress={() => navigation.navigate('JoinGame')} />
      </View>

      {/* Language Switch */}
      <TouchableOpacity onPress={handleLanguageToggle}>
        <Text style={{ textAlign: 'center', color: '#555', marginTop: 20 }}>
          🌐 Змінити мову (UA / EN)
        </Text>
      </TouchableOpacity>
    </View>
  );
}
