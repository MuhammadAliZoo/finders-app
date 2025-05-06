import { Dispute } from '../screens/admin/DisputeResolutionScreen';
import { Item } from '../types/item';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  // Auth Flow
  Auth: undefined;
  Login: undefined;
  Signup: undefined;
  AdminLogin: undefined;

  // Main App Flow
  Main: NavigatorScreenParams<MainStackParamList>;

  // Admin Flow
  AdminDashboard: undefined;  // Primary admin route
  AdminProfile: undefined;
  ContentModeration: undefined;
  ItemModeration: { item: ModerationItem };
  DisputeResolution: undefined;
  DisputeDetails: { dispute: Dispute };
  WidgetSettings: undefined;
  GenerateReport: {
    type: 'performance' | 'activity' | 'issues' | 'users' | 'items' | 'matches' | 'disputes';
  };
  CollaborativeWorkspace: undefined;
  Settings: undefined;
  Chat: { conversationId: string; otherUser: any; item?: any };
  EditProfile: undefined;
  HelpSupport: undefined;
  PrivacySecurity: undefined;
  RareItemsMarketplace: { items: any[] };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = {
  navigation: NativeStackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};

export type MainStackParamList = {
  Home: undefined;
  ItemDetails: { id: string };
  AIAssistant: undefined;
  Chat: { conversationId: string; otherUser: any; item?: any };
  Submission: undefined;
  RareItemsMarketplace: { items: any[] };
  Tabs: NavigatorScreenParams<TabParamList>;
  SearchResults: { searchQuery: string };
  ClaimTracking: { claimId: string };
  AllTrendingItems: { items: Item[] };
  Settings: {
    section: 'profile' | 'help' | 'privacy';
  };
};

export type TabParamList = {
  HomeTab: undefined;
  FinderTab: undefined;
  RequesterTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

export type MainStackScreenProps<T extends keyof MainStackParamList> = {
  navigation: NativeStackNavigationProp<MainStackParamList, T>;
  route: RouteProp<MainStackParamList, T>;
};

export type TabScreenProps<T extends keyof TabParamList> = {
  navigation: BottomTabNavigationProp<TabParamList, T>;
  route: RouteProp<TabParamList, T>;
};

export interface ModerationItem {
  id: string;
  title: string;
  content: string;
  type: 'listing' | 'profile' | 'comment';
  status: 'pending' | 'flagged' | 'approved' | 'rejected';
  reportCount: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    name: string;
    avatar: string;
  };
  category: string;
  images: string[];
  aiFlags: string[];
}
