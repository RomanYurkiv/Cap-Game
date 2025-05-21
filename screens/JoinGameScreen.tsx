import { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

export default function JoinGameScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const handleJoin = async () => {
    if (code.length !== 5) {
      Alert.alert('Некоректний код', 'Код має бути 5-значним числом');
      return;
    }

    setLoading(true);

    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('code', code)
      .single();

    if (gameError || !game) {
      setLoading(false);
      Alert.alert('Гру не знайдено', 'Перевір правильність коду');
      return;
    }

    const nickname = await AsyncStorage.getItem('nickname');
    const avatarIndex = await AsyncStorage.getItem('avatarIndex');

    if (!nickname || avatarIndex === null) {
      setLoading(false);
      Alert.alert('Помилка профілю', 'Будь ласка, створіть профіль заново');
      return;
    }

    // Перевірка: чи гравець уже є в грі
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', game.id)
      .eq('nickname', nickname)
      .maybeSingle();

    if (existingPlayer) {
      setLoading(false);
      Alert.alert('⚠️ Ви вже у грі', 'Цей гравець уже в лобі');
      navigation.navigate('WaitingRoom', {
        gameId: game.id,
        isHost: false,
        code,
      });
      return;
    }

    // Вставка нового гравця
    const { data: newPlayer, error: insertError } = await supabase
      .from('players')
      .insert({
        game_id: game.id,
        nickname,
        team: 'B',
        is_host: false,
      })
      .select()
      .single();

    if (insertError || !newPlayer) {
      setLoading(false);
      Alert.alert('Помилка приєднання до гри', insertError?.message || '');
      return;
    }

    setLoading(false);
    navigation.navigate('WaitingRoom', {
      gameId: game.id,
      isHost: false,
      code,
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 20 }}>
        🔑 Приєднання до гри
      </Text>

      <TextInput
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
        maxLength={5}
        placeholder="Введіть 5-значний код"
        style={{
          borderWidth: 1,
          padding: 10,
          borderRadius: 8,
          fontSize: 20,
          textAlign: 'center',
          marginBottom: 20,
        }}
      />

      <Button
        title={loading ? 'Приєднання...' : 'Приєднатись'}
        onPress={handleJoin}
        disabled={loading}
      />
    </View>
  );
}
