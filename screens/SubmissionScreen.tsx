"use client"

import React, { useState, useCallback, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../theme/ThemeContext"
import { MainStackParamList } from "../navigation/types"
import { User, useAuth } from "../context/AuthContext"
import { useFirebase } from "../context/FirebaseContext"
import axios from "axios"
import { EXPO_PUBLIC_API_URL } from "@env"
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'

type SubmissionScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface AuthUser extends User {
  token: string;
}

const SubmissionScreen = () => {
  const navigation = useNavigation<SubmissionScreenNavigationProp>()
  const { colors } = useTheme()
  const { user } = useAuth()
  const { auth, storage, isInitialized } = useFirebase()
  const [type, setType] = useState<"found" | "lost">("found")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [category, setCategory] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [suggestedTags, setSuggestedTags] = useState(["Wallet", "Black", "Leather"])
  const [isRareItem, setIsRareItem] = useState(false)
  const [finderReward, setFinderReward] = useState("")
  const [rarity, setRarity] = useState("")
  const [condition, setCondition] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Dynamic styles that depend on theme
  const dynamicStyles = {
    toggleContainer: {
      backgroundColor: colors.card,
    },
    chip: {
      backgroundColor: colors.card,
    },
    chipText: {
      color: colors.text,
    }
  }

  // Request permission for image picker
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload photos!'
      );
      return false;
    }
    return true;
  };

  const uploadImageToStorage = async (uri: string): Promise<string> => {
    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized');
      }
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be signed in to upload images');
      }

      if (!storage) {
        throw new Error('Firebase Storage is not initialized');
      }

      console.log('Starting upload process for:', uri);

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('File info:', fileInfo);

      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Create filename with timestamp and random string
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const filename = `found-items/${currentUser.uid}/${timestamp}-${randomString}.jpg`;
      console.log('Generated filename:', filename);

      // Create storage reference
      const storageRef = storage.ref(filename);
      console.log('Storage reference created');

      // Upload file
      const task = storageRef.putFile(uri);
      console.log('Upload task created');

      // Get download URL after upload completes
      await task;
      const url = await storageRef.getDownloadURL();
      console.log('Download URL obtained:', url);

      return url;
    } catch (error) {
      console.error('Detailed upload error:', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  };

  const handleAddImage = async () => {
    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized');
      }
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Please sign in to upload images');
      }

      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      setIsUploadingImage(true);
      setError("");

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('Selected image URI:', imageUri);
        
        const imageUrl = await uploadImageToStorage(imageUri);
        console.log('Upload successful, URL:', imageUrl);
        
        setImages(prev => [...prev, imageUrl]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to select image. Please try again.'
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError("")

      if (!title || !description || !location || !date || !category) {
        throw new Error("Please fill in all required fields")
      }

      const formData = {
        title,
        description,
        category,
        location,
        date: new Date(date),
        images,
        tags: suggestedTags,
        isRareItem,
        ...(isRareItem && {
          rarity,
          condition,
          finderReward: parseFloat(finderReward)
        })
      }

      if (!user?.token) {
        throw new Error("You must be logged in to submit an item")
      }
      
      const response = await axios.post(
        `${EXPO_PUBLIC_API_URL}/api/found-items`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data) {
        navigation.navigate('Tabs', { screen: 'Finder' as const })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit item")
      console.error("Submit error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const rarityLevels = ["Common", "Uncommon", "Rare", "Very Rare", "Extremely Rare"]
  const conditionLevels = ["Mint", "Excellent", "Good", "Fair", "Poor"]

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        {/* Type Toggle */}
        <View style={[styles.toggleContainer, dynamicStyles.toggleContainer]}>
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              !isRareItem && { backgroundColor: colors.primary },
              styles.toggleButtonLeft
            ]} 
            onPress={() => setIsRareItem(false)}
          >
            <Ionicons 
              name={type === "found" ? "search" : "alert-circle"} 
              size={16} 
              color={!isRareItem ? '#fff' : colors.text} 
              style={styles.toggleIcon}
            />
            <Text style={[
              styles.toggleText, 
              !isRareItem ? { color: '#fff' } : { color: colors.text }
            ]}>
              {type === "found" ? "Found" : "Lost"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              isRareItem && { backgroundColor: colors.primary },
              styles.toggleButtonRight
            ]} 
            onPress={() => setIsRareItem(true)}
          >
            <Ionicons 
              name="diamond" 
              size={16} 
              color={isRareItem ? '#fff' : colors.text} 
              style={styles.toggleIcon}
            />
            <Text style={[
              styles.toggleText, 
              isRareItem ? { color: '#fff' } : { color: colors.text }
            ]}>
              Rare
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isRareItem ? "Rare Item Submission" : (type === "found" ? "Report Found Item" : "Report Lost Item")}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
          {isRareItem 
            ? "Please provide detailed information about your rare item."
            : "Please provide as much detail as possible to help with matching."
          }
        </Text>
      </View>

      {/* Image Upload Section */}
      <View style={[styles.section, styles.cardContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Upload Images</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.secondary }]}>
          Clear photos increase the chances of a successful match.
        </Text>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.imagesContainer}
          contentContainerStyle={styles.imagesContentContainer}
        >
          {images.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: image }} style={styles.uploadedImage} />
              <TouchableOpacity
                style={[styles.removeImageButton, { backgroundColor: colors.error }]}
                onPress={() => setImages(images.filter((_, i) => i !== index))}
              >
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              {uploadProgress[image] !== undefined && uploadProgress[image] < 100 && (
                <View style={styles.uploadProgressContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.uploadProgressText, { color: colors.primary }]}>
                    {Math.round(uploadProgress[image])}%
                  </Text>
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity 
            style={[
              styles.addImageButton, 
              { borderColor: colors.primary },
              isUploadingImage && { opacity: 0.5 }
            ]} 
            onPress={handleAddImage}
            disabled={isUploadingImage}
          >
            <View style={[styles.addImageInner, { backgroundColor: colors.primary + '10' }]}>
              {isUploadingImage ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={32} color={colors.primary} />
                  <Text style={[styles.addImageText, { color: colors.primary }]}>
                    Add Photo
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Item Details Section */}
      <View style={[styles.section, styles.cardContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Item Details</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Title</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="bookmark-outline" size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="e.g., Black Leather Wallet"
              placeholderTextColor={colors.secondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Category</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
            <Ionicons name="folder-outline" size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { backgroundColor: 'transparent', color: colors.text }]}
              placeholder="Select or type a category"
              placeholderTextColor={colors.secondary}
              value={category}
              onChangeText={setCategory}
            />
            <Ionicons name="chevron-down" size={20} color={colors.secondary} />
          </View>
        </View>

        {/* Rare Item Fields */}
        {isRareItem && (
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Finder Reward ($)</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
                <Ionicons name="cash-outline" size={20} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { backgroundColor: 'transparent', color: colors.text }]}
                  placeholder="e.g., 5000"
                  placeholderTextColor={colors.secondary}
                  value={finderReward}
                  onChangeText={setFinderReward}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Rarity Level</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.chipsContainer}
                contentContainerStyle={styles.chipsContentContainer}
              >
                {rarityLevels.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.background },
                      rarity === level && { 
                        backgroundColor: colors.primary,
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6
                      }
                    ]}
                    onPress={() => setRarity(level)}
                  >
                    <Text style={[
                      styles.chipText,
                      { color: colors.text },
                      rarity === level && { color: '#fff' }
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Condition</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.chipsContainer}
                contentContainerStyle={styles.chipsContentContainer}
              >
                {conditionLevels.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.background },
                      condition === level && { 
                        backgroundColor: colors.primary,
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6
                      }
                    ]}
                    onPress={() => setCondition(level)}
                  >
                    <Text style={[
                      styles.chipText,
                      { color: colors.text },
                      condition === level && { color: '#fff' }
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: 'transparent', color: colors.text }]}
              placeholder="Provide a detailed description of the item..."
              placeholderTextColor={colors.secondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>
      </View>

      {/* AI Suggested Tags */}
      {images.length > 0 && (
        <View style={[styles.section, styles.cardContainer, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Suggested Tags</Text>
            <Ionicons name="flash" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.sectionSubtitle, { color: colors.secondary }]}>
            Based on your images, we suggest these tags:
          </Text>

          <View style={styles.tagsContainer}>
            {suggestedTags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tagButton, 
                  { 
                    backgroundColor: colors.primary + "10",
                    borderColor: colors.primary 
                  }
                ]}
              >
                <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={styles.tagIcon} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Location & Date Section */}
      <View style={[styles.section, styles.cardContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Location & Date</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Location</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
            <Ionicons name="location-outline" size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { backgroundColor: 'transparent', color: colors.text }]}
              placeholder="Enter location or use current location"
              placeholderTextColor={colors.secondary}
              value={location}
              onChangeText={setLocation}
            />
            <TouchableOpacity style={styles.inputActionButton}>
              <Ionicons name="navigate" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Date</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { backgroundColor: 'transparent', color: colors.text }]}
              placeholder="Select date"
              placeholderTextColor={colors.secondary}
              value={date}
              onChangeText={setDate}
            />
            <TouchableOpacity style={styles.inputActionButton}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : null}

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.submitButton, 
            { 
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
              opacity: isSubmitting ? 0.7 : 1
            }
          ]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" style={styles.submitButtonIcon} />
          ) : (
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" style={styles.submitButtonIcon} />
          )}
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    paddingTop: 60,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
    height: 36,
    marginBottom: 12,
    width: '100%',
    maxWidth: 200,
    alignSelf: 'center',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    minWidth: 80,
  },
  toggleButtonLeft: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    marginRight: 1,
  },
  toggleButtonRight: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    marginLeft: 1,
  },
  toggleIcon: {
    marginRight: 4,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  section: {
    marginBottom: 12,
  },
  cardContainer: {
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
    opacity: 0.8,
  },
  imagesContainer: {
    marginTop: 8,
    height: 110,
  },
  imagesContentContainer: {
    paddingRight: 8,
  },
  imageWrapper: {
    marginRight: 8,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  addImageInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
  },
  inputActionButton: {
    padding: 6,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  chipsContainer: {
    marginTop: 8,
    height: 40,
  },
  chipsContentContainer: {
    paddingRight: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tagIcon: {
    marginLeft: 4,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  submitButton: {
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonIcon: {
    marginRight: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  errorText: {
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    fontSize: 14,
  },
  uploadProgressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadProgressText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default SubmissionScreen

