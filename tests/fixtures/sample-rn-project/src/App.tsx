import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';

const App = () => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
    });
    if (result.assets && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSignUp = async () => {
    // Creates a new user account
    const response = await fetch('https://api.example.com/auth/signUp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: 'secret' }),
    });
    const data = await response.json();
    console.log('Account created:', data);
  };

  const handleCreateAccount = async () => {
    // Alternative account creation flow
    const response = await fetch('https://api.example.com/auth/createAccount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'newuser', password: 'secret' }),
    });
    const data = await response.json();
    console.log('Account created:', data);
  };

  // NOTE: No account deletion functionality exists in this app.
  // NOTE: No deep link handling exists in this app.
  // NOTE: No restore purchases functionality exists in this app.

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <Text style={styles.title}>SampleApp</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          {photoUri && (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  section: {
    padding: 16,
    gap: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  photo: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginTop: 12,
  },
});

export default App;
