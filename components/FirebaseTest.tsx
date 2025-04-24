import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { testFirebaseConnection } from '../config/firebase';

const FirebaseTest = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTest = async () => {
      try {
        setLoading(true);
        const result = await testFirebaseConnection();
        setTestResult(result);
      } catch (error) {
        console.error('Test failed:', error);
        setTestResult({ error: 'Test failed to run' });
      } finally {
        setLoading(false);
      }
    };

    runTest();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Testing Firebase Connection...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Connection Test Results</Text>
      <View style={styles.resultContainer}>
        <Text style={styles.text}>Auth: {testResult?.auth ? '✅ Connected' : '❌ Not Connected'}</Text>
        <Text style={styles.text}>Firestore: {testResult?.firestore ? '✅ Connected' : '❌ Not Connected'}</Text>
        <Text style={styles.text}>Storage: {testResult?.storage ? '✅ Connected' : '❌ Not Connected'}</Text>
        {testResult?.error && (
          <Text style={styles.errorText}>Error: {testResult.error}</Text>
        )}
      </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resultContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    width: '100%',
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginTop: 10,
  },
});

export default FirebaseTest; 