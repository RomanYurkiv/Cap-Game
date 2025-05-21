export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Initial: undefined;
  CreateGame: undefined;
  JoinGame: undefined;
  WaitingRoom: { gameId: string; isHost: boolean; code: string };
  TeamSelection: { gameId: string };
};