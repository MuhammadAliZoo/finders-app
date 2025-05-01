import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { usePermissions } from '../contexts/PermissionsContext';

export const PermissionsTest = () => {
  const {
    locationEnabled,
    backgroundLocationEnabled,
    loading,
    error,
    requestPermissions,
    checkPermissions,
  } = usePermissions();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permissions Status</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <>
          <View style={styles.statusContainer}>
            <Text style={styles.label}>Location Permission:</Text>
            <Text style={[styles.status, { color: locationEnabled ? '#4CAF50' : '#F44336' }]}>
              {locationEnabled ? 'Granted' : 'Not Granted'}
            </Text>
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.label}>Background Location:</Text>
            <Text
              style={[styles.status, { color: backgroundLocationEnabled ? '#4CAF50' : '#F44336' }]}
            >
              {backgroundLocationEnabled ? 'Granted' : 'Not Granted'}
            </Text>
          </View>

          {error && <Text style={styles.error}>Error: {error}</Text>}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={requestPermissions}>
              <Text style={styles.buttonText}>Request Permissions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={checkPermissions}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Check Status</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  error: {
    color: '#F44336',
    marginVertical: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  loader: {
    marginVertical: 20,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderColor: '#2196F3',
    borderWidth: 1,
  },
  secondaryButtonText: {
    color: '#2196F3',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});
