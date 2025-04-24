import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useFirebase } from '../context/FirebaseContext';

export const FirebaseTest = () => {
  const { user } = useFirebase();
  const [testStatus, setTestStatus] = useState('Not started');
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    try {
      setTestStatus('Testing Firebase Auth...');
      
      // Test Anonymous Auth
      if (!user) {
        await auth().signInAnonymously();
        setTestStatus('Auth Test Passed ✅\nTesting Firestore...');
      } else {
        setTestStatus('Auth Already Authenticated ✅\nTesting Firestore...');
      }

      // Test Firestore
      const testCollection = firestore().collection('test');
      await testCollection.add({
        timestamp: firestore.FieldValue.serverTimestamp(),
        test: true
      });
      
      const snapshot = await testCollection.get();
      const docsCount = snapshot.size;

      setTestStatus(`All Tests Passed ✅\nAuth: Working\nFirestore: Working\nFound ${docsCount} docs`);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setTestStatus('Tests Failed ❌');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Connection Test</Text>
      <Text style={styles.status}>{testStatus}</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Run Tests" onPress={runTests} />
      {user && (
        <Text style={styles.userInfo}>
          Current User: {user.email || 'Anonymous'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginVertical: 20,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginVertical: 10,
    textAlign: 'center',
  },
  userInfo: {
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
}); 