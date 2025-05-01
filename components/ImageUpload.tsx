import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  Platform,
  Image as RNImage,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadToSupabase, generateStoragePath } from '../utils/storage';
import { useTheme } from '../theme/ThemeContext';

interface ImageUploadProps {
  folder: string;
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: Error) => void;
  size?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  folder,
  onUploadComplete,
  onUploadError,
  size = 200,
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { colors } = useTheme();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        handleUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      onUploadError?.(error as Error);
    }
  };

  const handleUpload = async (uri: string) => {
    try {
      setUploading(true);
      const fileName = uri.split('/').pop() || 'image.jpg';
      const path = generateStoragePath(folder, fileName);
      const url = await uploadToSupabase(uri, path);
      onUploadComplete(url);
    } catch (error) {
      console.error('Error uploading image:', error);
      onUploadError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {image ? (
        <Image source={{ uri: image }} style={[styles.image, { width: size, height: size }]} />
      ) : (
        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: colors.primary }]}
          onPress={pickImage}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Ionicons name="camera" size={size * 0.4} color={colors.background} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    borderRadius: 8,
  },
  uploadButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
});

export default ImageUpload;
