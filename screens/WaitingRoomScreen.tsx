import { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function WaitingRoomScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { gameId } = route.params;

  const [players, setPlayers] = useState<any[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [gameCode, setGameCode] = useState('');
  const [nickname, setNickname] = useState('');

  // Отримати гравця і перевірити чи він хост
  useEffect(() => {
    const fetchInitialData = async () => {
      const nickname = await AsyncStorage.getItem('nickname');
      setNickname(nickname || '');
  
      // 1. Отримати гравця і визначити чи він хост
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId)
        .eq('nickname', nickname)
        .single();
  
      if (playerError) {
        console.error('Не вдалося знайти гравця:', playerError.message);
        return;
      }
  
      if (player?.is_host) setIsHost(true);

      // 2. Отримати гру, щоб дістати код
    const { data: game, error: gameError } = await supabase
    .from('games')
    .select('code')
    .eq('id', gameId)
    .single();

  if (!gameError && game?.code) {
    setGameCode(game.code);
  }

  // 3. Завантажити гравців
  fetchPlayers();
};

fetchInitialData();
}, []);

  // Слухаємо оновлення таблиці players
  useEffect(() => {
    const channel = supabase
      .channel(`players-in-${gameId}`)
      .on('postgres_changes' as any, {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `game_id=eq.${gameId}`,
      }, (payload) => {
        console.log('♻️ Players updated');
        fetchPlayers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId);

    setPlayers(data || []);
  };

  // Слухаємо зміни статусу гри (старт)
  useEffect(() => {
    const channel = supabase
      .channel('game_status_channel')
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          const updatedGame = payload.new as { started: boolean };
  
          if (updatedGame?.started) {
            console.log('🎯 Гру стартовано, переходимо на TeamSelection');
            navigation.navigate('TeamSelection', { gameId });
          }
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const handleStartGame = async () => {
    const { error } = await supabase
      .from('games')
      .update({ started: true })
      .eq('id', gameId);

    if (error) {
      Alert.alert('Помилка старту гри', error.message);
    } else {
      console.log('Гру стартовано!');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center' }}>👬 Гравці у лобі</Text>
      <Text style={{ textAlign: 'center', marginVertical: 10 }}>
        Код гри: <Text style={{ fontWeight: 'bold' }}>{gameCode}</Text>
      </Text>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={{ fontSize: 18 }}>
            • {item.nickname}{item.is_host ? ' (власник)' : ''}
          </Text>
        )}
      />

      {isHost && (
        <Button title="🚀 Почати гру" onPress={handleStartGame} />
      )}
    </View>
  );
}
