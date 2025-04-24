#!/bin/bash

# Add Facebook configuration to AndroidManifest.xml
sed -i '' '/<application/a\
        <meta-data android:name="com.facebook.sdk.ApplicationId" android:value="\${FACEBOOK_APP_ID}"/>\
        <meta-data android:name="com.facebook.sdk.ClientToken" android:value="\${FACEBOOK_CLIENT_TOKEN}"/>' android/app/src/main/AndroidManifest.xml

# Add Facebook login activity
sed -i '' '/<activity android:name=".MainActivity"/a\
        <activity android:name="com.facebook.FacebookActivity"\
            android:configChanges="keyboard|keyboardHidden|screenLayout|screenSize|orientation"\
            android:label="@string/app_name" />\
        <activity\
            android:name="com.facebook.CustomTabActivity"\
            android:exported="true">\
            <intent-filter>\
                <action android:name="android.intent.action.VIEW" />\
                <category android:name="android.intent.category.DEFAULT" />\
                <category android:name="android.intent.category.BROWSABLE" />\
                <data android:scheme="@string/fb_login_protocol_scheme" />\
            </intent-filter>\
        </activity>' android/app/src/main/AndroidManifest.xml

# Add Facebook string resources
echo '<resources>
    <string name="app_name">Finders</string>
    <string name="fb_login_protocol_scheme">fb${FACEBOOK_APP_ID}</string>
</resources>' > android/app/src/main/res/values/strings.xml 