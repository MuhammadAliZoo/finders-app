import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { adminApi } from '../../api/admin';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList, ModerationItem } from '../../navigation/types';

const ItemModerationScreen = () => {
  const { colors } = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'ItemModeration'>>();
  const { item } = route.params;
  const [itemDetails, setItemDetails] = useState<ModerationItem | null>(item || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!item) return;
    setLoading(true);
    adminApi.getItemsForModeration('all', 'date')
      .then(items => {
        const found = items.find((i: ModerationItem) => i.id === item.id);
        setItemDetails(found || item);
      })
      .catch(() => setItemDetails(item))
      .finally(() => setLoading(false));
  }, [item]);

  const handleModerate = async (action: 'approve' | 'reject') => {
    if (!itemDetails) return;
    setLoading(true);
    try {
      await adminApi.batchModerateItems([itemDetails.id], action);
      Alert.alert('Success', `Item has been ${action}d.`);
    } catch (error: any) {
      Alert.alert('Error', error.message || `Failed to ${action} item.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !itemDetails) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>Item: {itemDetails.title}</Text>
      <Text style={{ color: colors.text }}>Status: {itemDetails.status}</Text>
      <Text style={{ color: colors.text }}>Content: {itemDetails.content}</Text>
      <View style={{ flexDirection: 'row', marginTop: 20 }}>
        <Button title="Approve" onPress={() => handleModerate('approve')} color={colors.success} />
        <View style={{ width: 16 }} />
        <Button title="Reject" onPress={() => handleModerate('reject')} color={colors.error} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
  },
});

export default ItemModerationScreen;
