import { Dispute } from '../screens/admin/DisputeResolutionScreen';
import { Item } from '../types/item';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  Profile: undefined;
  Settings: undefined;
  FirebaseTest: undefined;
  Chat: {
    conversationId: string;
    otherUser: {
      id: string;
      displayName: string;
      photoURL?: string | null;
    };
    item?: {
      _id: string;
      title: string;
      images: string[];
    };
  };
  ItemDetails: { itemId: string };
  AIAssistant: undefined;
  Tabs: {
    screen: 'Search' | 'Profile' | 'Settings' | 'Chat';
    params?: {
      searchQuery?: string;
    };
  };
  
  // Auth screens
  Auth: undefined;
  AdminLogin: undefined;
  
  // Main navigator
  Main: undefined;
  
  // Admin screens
  AdminHome: undefined;
  AdminProfile: undefined;
  AdminDashboard: undefined;
  ContentModeration: undefined;
  ItemModeration: { item: ModerationItem };
  DisputeResolution: undefined;
  DisputeDetails: { dispute: Dispute };
  WidgetSettings: undefined;
  GenerateReport: {
    type: 'performance' | 'activity' | 'issues' | 'users' | 'items' | 'matches' | 'disputes';
  };
  CollaborativeWorkspace: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenParams = {
  Home: undefined;
  ProfileTab: undefined;
  Search: { searchQuery?: string };
  Notifications: undefined;
  Settings: undefined;
};

export type MainStackParamList = {
  Tabs: NavigatorScreenParams<TabScreenParams>;
  Login: undefined;
  Register: undefined;
  EditProfile: undefined;
  HelpSupport: undefined;
  PrivacySecurity: undefined;
  ItemDetails: { itemId: string; item?: any };
  AIAssistant: undefined;
  Submission: undefined;
  RareItemsMarketplace: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  ProfileTab: undefined;
  SearchTab: undefined;
  NotificationsTab: undefined;
  SettingsTab: undefined;
};

export interface ModerationItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  status: string;
  priority: number;
  rating: number;
  date: string;
} 