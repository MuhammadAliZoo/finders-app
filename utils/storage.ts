import { storage as supabaseStorage } from '../config/supabase';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../config/supabase';

interface UploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

// Function to compress image before upload
export const compressImage = async (uri: string): Promise<string> => {
  const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 800 } }], {
    compress: 0.7,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  return result.uri;
};

// Function to generate a unique file path
export const generateStoragePath = (folder: string, fileName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  return `${folder}/${timestamp}-${randomString}-${fileName}`;
};

export const uploadToSupabase = async (uri: string, path: string): Promise<string> => {
  try {
    // Compress image before upload
    const compressedUri = await compressImage(uri);

    // Convert URI to blob
    const response = await fetch(compressedUri);
    const blob = await response.blob();

    // Upload to Supabase Storage
    const { data, error } = await supabaseStorage.from('finders-app').upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseStorage.from('finders-app').getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw error;
  }
};

export const deleteFromSupabase = async (path: string): Promise<void> => {
  try {
    const { error } = await supabaseStorage.from('finders-app').remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting from Supabase:', error);
    throw error;
  }
};

export const uploadImage = async (uri: string, userId: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const filePath = `profile-pictures/${userId}/${Date.now()}.jpg`;

  const { data, error } = await supabase.storage
    .from('profile-pictures')
    .upload(filePath, blob, { upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from('profile-pictures').getPublicUrl(filePath);

  return urlData.publicUrl;
};
