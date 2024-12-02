# My Finance App

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```


```txt
https://www.npmjs.com/package/react-native-cheerio
https://www-iranintl-com.translate.goog/finance?_x_tr_sl=en&_x_tr_tl=fa&_x_tr_hl=en&_x_tr_pto=wapp
```

## Build Helps:

- ### 1 Create an upload key

Inside your Expo project directory, run the following keytool command to create an upload key:

```sh
sudo keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

After running this command, you will be prompted to enter a password for the keystore. This password will protect the upload key. Remember the password you enter here, as you'll need it in the next step.

This command also generates the keystore file named **my-upload-key.keystore** in your project directory. Move it to the **android/app** directory.

    If you commit the android directory to a version control system like Git, don't commit this keystore file. It contains your upload key and should be kept private.


- ### 2 Update gradle variables

Open **android/gradle.properties** file and add the following gradle variables at the end of the file. These variables contain information about your upload key:

```txt
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

    If you commit the android directory to a version control system like Git, don't commit the above information. Instead, create a ~/.gradle/gradle.properties file on your computer and add the above variables to this file.



- ### 3 Add signing config to build.gradle

Open **android/app/build.gradle** file and add the following configuration:

```txt
android {
  signingConfigs {
    // ...
+   release {
+     if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
+         storeFile file(MYAPP_UPLOAD_STORE_FILE)
+         storePassword MYAPP_UPLOAD_STORE_PASSWORD
+         keyAlias MYAPP_UPLOAD_KEY_ALIAS
+         keyPassword MYAPP_UPLOAD_KEY_PASSWORD
+     }
    }
  }
  buildTypes {
    // ...
    release {
      signingConfig signingConfigs.debug
+     signingConfig signingConfigs.release
      minifyEnabled false
      // ...
    }
  }
}
```


- ### 4 build and install on device

   ```bash
   npx expo prebuild
   npm run android
   cd android
   # Generate release Android Application Bundle (aab)
   ./gradlew app:bundleRelease
   # install on device
   ./gradlew installRelease
   ```