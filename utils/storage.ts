import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

interface UploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const uploadImage = async (uri: string, path: string, options: UploadOptions = {}) => {
  try {
    // Fetch the image
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create a reference to the file location in Firebase Storage
    const storageRef = ref(storage, path);

    // Upload the file
    await uploadBytes(storageRef, blob);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const getImageUrl = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw error;
  }
}; 