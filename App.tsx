import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types/navigation';

import InitialScreen from './screens/InitialScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import HomeScreen from './screens/HomeScreen';
import CreateGameScreen from './screens/CreateGameScreen';
import JoinGameScreen from './screens/JoinGameScreen';
import WaitingRoomScreen from './screens/WaitingRoomScreen';
import TeamSelectionScreen from './screens/TeamSelectionScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Initial" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Initial" component={InitialScreen} />
        <Stack.Screen name="Profile" component={ProfileSetupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateGame" component={CreateGameScreen} />
        <Stack.Screen name="JoinGame" component={JoinGameScreen} />
        <Stack.Screen
          name="WaitingRoom"
          component={WaitingRoomScreen}
          options={{ headerShown: true, title: 'Очікування' }}
        />
        <Stack.Screen name="TeamSelection" component={TeamSelectionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
