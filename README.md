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

  - Firebase Authentication
  - Firebase Storage
  - Firebase Firestore

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
     ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project
2. Add your Firebase configuration in `app/utils/firebase.ts`
3. Enable Authentication methods in Firebase Console
4. Set up Firestore rules
5. Configure Storage rules

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

## 🚧 Current Implementation Challenges

### Firebase Integration Issues

- Firebase native modules (`@react-native-firebase/*`) compatibility issues with Expo Go
- Version conflicts between Firebase packages (current version 18.7.3) and other dependencies
- Need to implement custom development client for native Firebase functionality
- Configuration issues with `google-services.json` and `GoogleService-Info.plist`

### Expo Configuration Challenges

- Conflicts between Expo managed workflow and native module requirements
- Navigation types need updates to include new screens (e.g., FirebaseTest screen)
- Issues with Expo prebuild process when including native modules
- Environment variable loading errors affecting configuration

### Development Environment Setup

- Native module integration requiring custom development client
- Build process failing due to plugin configuration errors
- Package version mismatches between Expo SDK 52 and React Native dependencies
- Pod installation issues in iOS development environment

### Potential Solutions Being Explored

1. **Firebase Integration**

   - Consider switching to Expo's Firebase SDK
   - Implement proper version management for Firebase packages
   - Complete native module setup with development client

2. **Expo Configuration**

   - Update navigation types and configurations
   - Resolve prebuild process issues
   - Implement proper environment variable handling

3. **Development Setup**
   - Configure proper development client setup
   - Resolve pod installation issues
   - Align package versions with Expo SDK requirements

### Next Steps

1. Resolve Firebase configuration issues
2. Complete native module setup
3. Fix navigation type definitions
4. Implement proper environment variable handling
5. Resolve pod installation and build process issues
