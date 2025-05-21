import { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function LobbyScreen() {
  const [nickname, setNickname] = useState('');
  const [gameId, setGameId] = useState<string | null>(null);

  const createGame = async () => {
    // 1. Створюємо гру
    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({ status: 'waiting' })
      .select()
      .single();

    if (gameError) {
      console.error(gameError);
      Alert.alert('Помилка при створенні гри');
      return;
    }

    // 2. Додаємо гравця (як хост)
    const { error: playerError } = await supabase.from('players').insert({
      game_id: game.id,
      nickname,
      is_host: true,
      team: 'A', // Поки просто для старту
    });

    if (playerError) {
      console.error(playerError);
      Alert.alert('Помилка при додаванні гравця');
      return;
    }

    setGameId(game.id);
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 12 }}>🎮 Створення гри</Text>

      <TextInput
        placeholder="Введи нікнейм"
        value={nickname}
        onChangeText={setNickname}
        style={{
          borderWidth: 1,
          padding: 10,
          borderRadius: 8,
          marginBottom: 12,
        }}
      />

      <Button title="Створити гру" onPress={createGame} disabled={!nickname} />

      {gameId && (
        <Text style={{ marginTop: 20, fontSize: 18 }}>
          ✅ Код гри: <Text style={{ fontWeight: 'bold' }}>{gameId}</Text>
        </Text>
      )}
    </View>
  );
}