import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Button, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Player = {
  id: string;
  nickname: string;
  is_host: boolean;
  team: 'A' | 'B' | null;
  game_id: string;
};

export default function TeamSelectionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { gameId } = route.params as { gameId: string };

  const [players, setPlayers] = useState<Player[]>([]);
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('nickname').then(setNickname);
  }, []);

  const fetchPlayers = async () => {
    const { data } = await supabase.from('players').select('*').eq('game_id', gameId);
    if (data) setPlayers(data);
  };

  useEffect(() => {
    fetchPlayers();

    const channel = supabase
      .channel(`teams-realtime-${gameId}`)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`,
        },
        () => fetchPlayers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const handleTeamSelect = async (team: 'A' | 'B') => {
    if (!nickname) return;
    await supabase
      .from('players')
      .update({ team })
      .eq('game_id', gameId)
      .eq('nickname', nickname);
  };

  const handleRandomizeTeams = async () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const half = Math.ceil(shuffled.length / 2);

    const teamA = shuffled.slice(0, half).map(p => ({ id: p.id, team: 'A' }));
    const teamB = shuffled.slice(half).map(p => ({ id: p.id, team: 'B' }));

    const updates = [...teamA, ...teamB];

    for (const update of updates) {
      await supabase.from('players').update({ team: update.team }).eq('id', update.id);
    }
  };

  const teamA = players.filter(p => p.team === 'A');
  const teamB = players.filter(p => p.team === 'B');

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 10 }}>🟦 Команда Синіх</Text>
      <FlatList
        data={teamA}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Text style={{ fontSize: 18 }}>
            • {item.nickname} {item.is_host ? '(власник)' : ''}
          </Text>
        )}
      />

      <Text style={{ fontSize: 24, textAlign: 'center', marginVertical: 10 }}>🟥 Команда Червоних</Text>
      <FlatList
        data={teamB}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Text style={{ fontSize: 18 }}>
            • {item.nickname} {item.is_host ? '(власник)' : ''}
          </Text>
        )}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 }}>
        <TouchableOpacity onPress={() => handleTeamSelect('A')}>
          <Text style={{ fontSize: 18 }}>🔵 Обрати Синіх</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTeamSelect('B')}>
          <Text style={{ fontSize: 18 }}>🔴 Обрати Червоних</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 30 }}>
        <Button title="🎲 Рандомно обрати команду" onPress={handleRandomizeTeams} />
      </View>
    </View>
  );
}
