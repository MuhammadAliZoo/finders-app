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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, deleteImage } from '../utils/storage';
import { useTheme } from '../theme/ThemeContext';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  path: string;
  initialImage?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  onImageRemoved,
  path,
  initialImage,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.8,
}) => {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [uploading, setUploading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { colors } = useTheme();

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please grant camera and photo library permissions to upload images'
      );
      return false;
    }
    return true;
  };

  const processImage = async (uri: string) => {
    try {
      setUploading(true);

      // Get image dimensions
      const { width, height } = await new Promise<{ width: number; height: number }>((resolve) => {
        RNImage.getSize(uri, (width, height) => {
          resolve({ width, height });
        });
      });

      // Calculate new dimensions while maintaining aspect ratio
      let newWidth = width;
      let newHeight = height;

      if (width > maxWidth) {
        newWidth = maxWidth;
        newHeight = (height * maxWidth) / width;
      }

      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = (width * maxHeight) / height;
      }

      const downloadURL = await uploadImage(uri, path, {
        maxWidth: newWidth,
        maxHeight: newHeight,
        quality,
      });
      
      setImage(downloadURL);
      onImageUploaded(downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setShowOptions(false);
    }
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setShowOptions(false);
    }
  };

  const removeImage = async () => {
    try {
      if (!image) return;
      
      setUploading(true);
      await deleteImage(path);
      setImage(null);
      if (onImageRemoved) {
        onImageRemoved();
      }
    } catch (error) {
      console.error('Error removing image:', error);
      Alert.alert('Error', 'Failed to remove image');
    } finally {
      setUploading(false);
      setShowOptions(false);
    }
  };

  const showImageOptions = () => {
    setShowOptions(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.uploadButton, { backgroundColor: colors.card }]}
        onPress={showImageOptions}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color={colors.primary} />
        ) : image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Ionicons name="camera" size={24} color={colors.primary} />
        )}
      </TouchableOpacity>

      <Modal
        visible={showOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.optionsContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={takePhoto}
            >
              <Ionicons name="camera" size={24} color={colors.primary} />
              <Text style={[styles.optionText, { color: colors.text }]}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={pickImage}
            >
              <Ionicons name="images" size={24} color={colors.primary} />
              <Text style={[styles.optionText, { color: colors.text }]}>Choose from Library</Text>
            </TouchableOpacity>

            {image && (
              <TouchableOpacity
                style={[styles.optionButton, { borderBottomWidth: 0 }]}
                onPress={removeImage}
              >
                <Ionicons name="trash" size={24} color={colors.error} />
                <Text style={[styles.optionText, { color: colors.error }]}>Remove Photo</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowOptions(false)}
            >
              <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  uploadButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  optionsContainer: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ImageUpload; 