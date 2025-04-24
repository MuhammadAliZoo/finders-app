import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Chat: { chatId: string };
  NewChat: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>; 