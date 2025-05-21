import { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

const generateCode = () => Math.floor(10000 + Math.random() * 90000).toString();

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateGame'>;

export default function CreateGameScreen() {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const createGame = async () => {
      try {
        const nickname = await AsyncStorage.getItem('nickname');
        if (!nickname) throw new Error('Нікнейм не знайдено');

        const avatarIndex = await AsyncStorage.getItem('avatarIndex');
        const code = generateCode();

        // 1. Створюємо гру
        const { data: game, error: gameError } = await supabase
          .from('games')
          .insert({ code, status: 'waiting', current_round: 1 })
          .select()
          .single();

        if (gameError || !game) throw gameError;

        // 2. Додаємо хоста в players
        const { error: playerError } = await supabase.from('players').insert({
          game_id: game.id,
          nickname,
          is_host: true,
          team: 'A',
        });

        if (playerError) throw playerError;

        // 3. Переходимо у WaitingRoom
        navigation.navigate('WaitingRoom', {
          gameId: game.id,
          isHost: true,
          code,
        });
      } catch (err: any) {
        Alert.alert('Помилка створення гри', err.message);
      } finally {
        setLoading(false);
      }
    };

    createGame();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Створюємо гру...</Text>
      </View>
    );
  }

  return null;
}