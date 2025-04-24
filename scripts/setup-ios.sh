#!/bin/bash

# Add Facebook configuration to Info.plist
/usr/libexec/PlistBuddy -c "Add :FacebookAppID string \${FACEBOOK_APP_ID}" ios/finders/Info.plist
/usr/libexec/PlistBuddy -c "Add :FacebookClientToken string \${FACEBOOK_CLIENT_TOKEN}" ios/finders/Info.plist
/usr/libexec/PlistBuddy -c "Add :FacebookDisplayName string Finders" ios/finders/Info.plist
/usr/libexec/PlistBuddy -c "Add :LSApplicationQueriesSchemes array" ios/finders/Info.plist
/usr/libexec/PlistBuddy -c "Add :LSApplicationQueriesSchemes: string fbapi" ios/finders/Info.plist
/usr/libexec/PlistBuddy -c "Add :LSApplicationQueriesSchemes: string fb-messenger-share-api" ios/finders/Info.plist

# Add URL schemes for Google Sign In
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes array" ios/finders/Info.plist
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes: dict" ios/finders/Info.plist
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes array" ios/finders/Info.plist
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes: string \${GOOGLE_REVERSED_CLIENT_ID}" ios/finders/Info.plist

# Add Sign In with Apple capability
/usr/libexec/PlistBuddy -c "Add :com.apple.developer.applesignin array" ios/finders/Info.plist
/usr/libexec/PlistBuddy -c "Add :com.apple.developer.applesignin: string Default" ios/finders/Info.plist 