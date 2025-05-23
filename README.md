# Finders App

A React Native mobile application built with Expo for connecting people who have lost items with those who have found them. The app provides a platform for reporting lost items, finding matching items, and facilitating the return process.

## 🚀 Features

- **Item Management**

  - Report lost items
  - Submit found items
  - Search and filter items
  - Real-time item tracking

- **User Authentication**

  - Email/Password login
  - Social media authentication
  - User profile management
  - Secure authentication flow

- **Location Services**

  - Map integration for item locations
  - Location-based search
  - Proximity alerts

- **Communication**

  - In-app messaging
  - Chat functionality
  - Push notifications

- **Admin Dashboard**
  - Content moderation
  - User management
  - Analytics and reporting
  - Dispute resolution

## 🛠 Technology Stack

- **Frontend**

  - React Native
  - Expo SDK 52
  - TypeScript
  - React Navigation
  - React Native Maps

- **Backend**

  - Node.js
  - Express
  - MongoDB
  - Socket.IO

- **Authentication & Storage**

  - Supabase Authentication
  - Supabase Storage
  - Supabase Database

- **Other Tools**
  - Google Maps API
  - Push Notifications
  - Real-time messaging

## 📱 Screenshots

[Coming soon]

## 🏗 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/MuhammadAliZoo/finders-app.git
   cd finders-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   - Create a `.env` file in the root directory
   - Add the required environment variables:
     ```
     EXPO_PUBLIC_API_URL=your_api_url
     EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

## 🔧 Configuration

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your Supabase URL and anon key from Project Settings > API
3. Add your Supabase credentials to your `.env` file as shown above
4. Set up authentication, storage buckets, and database tables in the Supabase dashboard
5. Configure storage and RLS policies as needed

### Google Maps Setup

1. Get a Google Maps API key
2. Add the key to your `.env` file
3. Configure the key in `app.json`

## 📄 License

[MIT License](LICENSE)

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email [your-email@example.com] or open an issue in the repository.

## 🔮 Future Plans

- [ ] AI-powered item matching
- [ ] Advanced search filters
- [ ] Social sharing integration
- [ ] Multi-language support
- [ ] Reward system for finders

## 🔄 Recent Changes (As of March 2024)

### Environment and Configuration Updates

- Added polyfills for Node.js built-in modules compatibility
- Updated Supabase client configuration with improved error handling
- Added debug logging for environment variables
- Implemented Expo Go specific error handling for Supabase operations

### Supabase Integration Improvements

- Enhanced Supabase client initialization with proper WebSocket configuration
- Added comprehensive error handling for storage, auth, and realtime operations
- Implemented connection testing with timeout handling
- Added platform-specific adaptations for React Native environment

### Development Environment

- Added `react-native-url-polyfill` for URL compatibility
- Implemented `react-native-get-random-values` for crypto operations
- Added WebSocket constructor configuration for React Native
- Enhanced AsyncStorage integration with Supabase client
