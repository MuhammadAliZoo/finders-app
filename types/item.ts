export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  isRare?: boolean;
  rarity: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  category: 'jewelry' | 'electronics' | 'documents' | 'accessories' | 'other';
  lastSeen?: string;
} 