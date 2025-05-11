'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import type {
  ViewProps,
  TextProps,
  ScrollViewProps,
  TouchableOpacityProps,
  TextInputProps,
  ImageProps,
  ActivityIndicatorProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { MainStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import ImageUpload from '../components/ImageUpload';
import { uploadImage } from '../utils/storage';
import { supabase } from '../config/supabase';

// Type assertions for React Native components with more specific types
const RNView = View as React.ComponentType<ViewProps & { style?: StyleProp<ViewStyle> }>;
const RNText = Text as React.ComponentType<TextProps & { style?: StyleProp<TextStyle> }>;
const RNScrollView = ScrollView as React.ComponentType<
  ScrollViewProps & { style?: StyleProp<ViewStyle> }
>;
const RNTouchableOpacity = TouchableOpacity as React.ComponentType<
  TouchableOpacityProps & { style?: StyleProp<ViewStyle> }
>;
const RNTextInput = TextInput as React.ComponentType<
  TextInputProps & { style?: StyleProp<TextStyle> }
>;
const RNImage = Image as React.ComponentType<ImageProps & { style?: StyleProp<ImageStyle> }>;
const RNActivityIndicator = ActivityIndicator as React.ComponentType<
  ActivityIndicatorProps & { style?: StyleProp<ViewStyle> }
>;

type SubmissionScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Submission'>;

const SubmissionScreen = () => {
  const navigation = useNavigation<SubmissionScreenNavigationProp>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [type, setType] = useState<'found' | 'lost'>('found');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>(['Wallet', 'Black', 'Leather']);
  const [isRareItem, setIsRareItem] = useState<boolean>(false);
  const [finderReward, setFinderReward] = useState<string>('');
  const [rarity, setRarity] = useState<string>('');
  const [condition, setCondition] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [descInputHeight, setDescInputHeight] = useState<number>(100);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const categoryOptions = [
    { label: 'Electronics', value: 'electronics' },
    { label: 'Accessories', value: 'accessories' },
    { label: 'Jewelry', value: 'jewelry' },
    { label: 'Vehicle', value: 'vehicle' },
    { label: 'Other', value: 'other' },
  ];

  // Dynamic styles that depend on theme
  const dynamicStyles: {
    toggleContainer: StyleProp<ViewStyle>;
    chip: StyleProp<ViewStyle>;
    chipText: StyleProp<TextStyle>;
  } = {
    toggleContainer: {
      backgroundColor: colors.card,
    },
    chip: {
      backgroundColor: colors.card,
    },
    chipText: {
      color: colors.text,
    },
  };

  // Request permission for image picker
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload photos!',
      );
      return false;
    }
    return true;
  };

  const uploadImageToStorage = async (uri: string): Promise<string> => {
    if (!user) throw new Error('You must be logged in');
    // Upload to Supabase Storage bucket 'item-images'
    const fileName = `item-images/${user.id}_${Date.now()}.jpg`;
    const response = await fetch(uri);
    const blob = await response.blob();
    const { error: uploadError } = await supabase.storage.from('item-images').upload(fileName, blob, { upsert: true });
    if (uploadError) throw uploadError;
    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('item-images').getPublicUrl(fileName);
    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) throw new Error('Failed to get public URL');
    return publicUrl;
  };

  const handleAddImage = async () => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      setIsUploadingImage(true);
      setError('');

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
        error instanceof Error ? error.message : 'Failed to select image. Please try again.',
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      if (!title || !description || !location || !date || !category) {
        throw new Error('Please fill in all required fields');
      }

      // Upload all images to Supabase Storage
      const uploadedImages: string[] = [];
      for (const img of images) {
        const url = await uploadImageToStorage(img);
        uploadedImages.push(url);
      }

      const baseData = {
        title,
        description,
        category,
        location,
        date: new Date(date),
        images: uploadedImages,
        tags: suggestedTags,
        isRareItem,
        ...(isRareItem && {
          rarity,
          condition,
          finderReward: parseFloat(finderReward),
        }),
        user_id: user?.id,
        created_at: new Date().toISOString(),
        status: type === 'found' ? 'pending' : 'searching',
        type: type,
      };

      if (type === 'found') {
        // Insert into items table for found items
        const { error: itemError } = await supabase
          .from('items')
          .insert([{ 
            ...baseData,
            type: 'found',
            ...(isRareItem && {
              rarity,
              condition,
              finderReward: parseFloat(finderReward),
            })
          }]);
        
        if (itemError) throw itemError;
      } else {
        // Insert into requests table for lost items
        const { error: requestError } = await supabase
          .from('requests')
          .insert([{ 
            ...baseData,
            type: 'lost',
            ...(isRareItem && {
              rarity,
              condition,
              finderReward: parseFloat(finderReward),
            })
          }]);
        
        if (requestError) throw requestError;
      }

      Alert.alert(
        'Success', 
        type === 'found' 
          ? 'Found item reported successfully!' 
          : 'Lost item request created successfully!'
      );

      // Navigate to the appropriate screen
      navigation.navigate('Tabs', { 
        screen: type === 'found' ? 'FinderTab' : 'RequesterTab'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit item');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rarityLevels = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Extremely Rare'];
  const conditionLevels = ['Mint', 'Excellent', 'Good', 'Fair', 'Poor'];

  const handleUploadComplete = (url: string) => {
    setImageUrl(url);
    // You can now use this URL in your form submission
  };

  const handleUploadError = (error: Error) => {
    Alert.alert('Upload Error', error.message);
  };

  return (
    <RNScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <RNView style={styles.header}>
        {/* Type Toggle */}
        <RNView style={[styles.toggleContainer, dynamicStyles.toggleContainer]}>
          <RNTouchableOpacity
            style={[
              styles.toggleButton,
              !isRareItem && { backgroundColor: colors.primary },
              styles.toggleButtonLeft,
            ]}
            onPress={() => setIsRareItem(false)}
          >
            <Ionicons
              name={type === 'found' ? 'search' : 'alert-circle'}
              size={16}
              color={!isRareItem ? '#fff' : colors.text}
              style={styles.toggleIcon}
            />
            <RNText
              style={[styles.toggleText, !isRareItem ? { color: '#fff' } : { color: colors.text }]}
            >
              {type === 'found' ? 'Found' : 'Lost'}
            </RNText>
          </RNTouchableOpacity>
          <RNTouchableOpacity
            style={[
              styles.toggleButton,
              isRareItem && { backgroundColor: colors.primary },
              styles.toggleButtonRight,
            ]}
            onPress={() => setIsRareItem(true)}
          >
            <Ionicons
              name="diamond"
              size={16}
              color={isRareItem ? '#fff' : colors.text}
              style={styles.toggleIcon}
            />
            <RNText
              style={[styles.toggleText, isRareItem ? { color: '#fff' } : { color: colors.text }]}
            >
              Rare
            </RNText>
          </RNTouchableOpacity>
        </RNView>

        <RNText style={[styles.headerTitle, { color: colors.text }]}>
          {isRareItem
            ? 'Rare Item Submission'
            : type === 'found'
              ? 'Report Lost Item'
              : 'Report Lost Item'}
        </RNText>
        <RNText style={[styles.headerSubtitle, { color: colors.secondary }]}>
          {isRareItem
            ? 'Please provide detailed information about your rare item.'
            : 'Please provide as much detail as possible to help with matching.'}
        </RNText>
      </RNView>

      {/* Image Upload Section */}
      <RNView style={[styles.section, styles.cardContainer, { backgroundColor: colors.card }]}>
        <RNText style={[styles.sectionTitle, { color: colors.text }]}>Upload Images</RNText>
        <RNText style={[styles.sectionSubtitle, { color: colors.secondary }]}>
          Clear photos increase the chances of a successful match.
        </RNText>

        <ImageUpload
          folder="submissions"
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          size={250}
        />
      </RNView>

      {/* Item Details Section */}
      <RNView style={[styles.section, styles.cardContainer, { backgroundColor: colors.card }]}>
        <RNText style={[styles.sectionTitle, { color: colors.text }]}>Item Details</RNText>

        <RNView style={styles.inputGroup}>
          <RNText style={[styles.inputLabel, { color: colors.text }]}>Title</RNText>
          <RNView style={styles.inputWrapper}>
            <Ionicons
              name="bookmark-outline"
              size={20}
              color={colors.primary}
              style={styles.inputIcon}
            />
            <RNTextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="e.g., Black Leather Wallet"
              placeholderTextColor={colors.secondary}
              value={title}
              onChangeText={setTitle}
            />
          </RNView>
        </RNView>

        <RNView style={styles.inputGroup}>
          <RNText style={[styles.inputLabel, { color: colors.text }]}>Category</RNText>
          <Pressable
            style={[styles.inputWrapper, { backgroundColor: colors.background }]}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Ionicons
              name="folder-outline"
              size={20}
              color={colors.primary}
              style={styles.inputIcon}
            />
            <RNText
              style={{ color: category ? colors.text : colors.secondary, fontSize: 14, flex: 1 }}
            >
              {category
                ? categoryOptions.find(opt => opt.value === category)?.label
                : 'Select a category'}
            </RNText>
            <Ionicons name="chevron-down" size={20} color={colors.secondary} />
          </Pressable>
          <Modal
            visible={categoryModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setCategoryModalVisible(false)}
          >
            <Pressable
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }}
              onPress={() => setCategoryModalVisible(false)}
            >
              <View style={{
                position: 'absolute',
                top: '40%',
                left: 24,
                right: 24,
                backgroundColor: colors.card,
                borderRadius: 12,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8,
              }}>
                <FlatList
                  data={categoryOptions}
                  keyExtractor={item => item.value}
                  renderItem={({ item }) => (
                    <Pressable
                      style={{ paddingVertical: 14, paddingHorizontal: 8 }}
                      onPress={() => {
                        setCategory(item.value);
                        setCategoryModalVisible(false);
                      }}
                    >
                      <RNText style={{ color: colors.text, fontSize: 16 }}>{item.label}</RNText>
                    </Pressable>
                  )}
                />
              </View>
            </Pressable>
          </Modal>
        </RNView>

        {/* Rare Item Fields */}
        {isRareItem && (
          <>
            <RNView style={styles.inputGroup}>
              <RNText style={[styles.inputLabel, { color: colors.text }]}>Finder Reward ($)</RNText>
              <RNView style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
                <Ionicons
                  name="cash-outline"
                  size={20}
                  color={colors.primary}
                  style={styles.inputIcon}
                />
                <RNTextInput
                  style={[styles.input, { backgroundColor: 'transparent', color: colors.text }]}
                  placeholder="e.g., 5000"
                  placeholderTextColor={colors.secondary}
                  value={finderReward}
                  onChangeText={setFinderReward}
                  keyboardType="numeric"
                />
              </RNView>
            </RNView>

            <RNView style={styles.inputGroup}>
              <RNText style={[styles.inputLabel, { color: colors.text }]}>Rarity Level</RNText>
              <RNScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsContainer}
                contentContainerStyle={styles.chipsContentContainer}
              >
                {rarityLevels.map(level => (
                  <RNTouchableOpacity
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
                        elevation: 6,
                      },
                    ]}
                    onPress={() => setRarity(level)}
                  >
                    <RNText
                      style={[
                        styles.chipText,
                        { color: colors.text },
                        rarity === level && { color: '#fff' },
                      ]}
                    >
                      {level}
                    </RNText>
                  </RNTouchableOpacity>
                ))}
              </RNScrollView>
            </RNView>

            <RNView style={styles.inputGroup}>
              <RNText style={[styles.inputLabel, { color: colors.text }]}>Condition</RNText>
              <RNScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsContainer}
                contentContainerStyle={styles.chipsContentContainer}
              >
                {conditionLevels.map(level => (
                  <RNTouchableOpacity
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
                        elevation: 6,
                      },
                    ]}
                    onPress={() => setCondition(level)}
                  >
                    <RNText
                      style={[
                        styles.chipText,
                        { color: colors.text },
                        condition === level && { color: '#fff' },
                      ]}
                    >
                      {level}
                    </RNText>
                  </RNTouchableOpacity>
                ))}
              </RNScrollView>
            </RNView>
          </>
        )}

        <RNView style={styles.inputGroup}>
          <RNText style={[styles.inputLabel, { color: colors.text, marginBottom: 8 }]}>Description</RNText>
          <RNView style={[styles.inputWrapper, styles.inputWrapperColumn, { backgroundColor: colors.background, height: undefined, minHeight: 100, alignItems: 'stretch' }]}> 
            <RNTextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: 'transparent', color: colors.text, minHeight: 100, height: descInputHeight, maxHeight: 200 },
              ]}
              placeholder="Provide a detailed description of the item..."
              placeholderTextColor={colors.secondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              onContentSizeChange={e => setDescInputHeight(Math.max(100, e.nativeEvent.contentSize.height))}
              scrollEnabled={true}
            />
          </RNView>
        </RNView>
      </RNView>

      {/* AI Suggested Tags */}
      {images.length > 0 && (
        <RNView style={[styles.section, styles.cardContainer, { backgroundColor: colors.card }]}>
          <RNView style={styles.sectionHeaderRow}>
            <RNText style={[styles.sectionTitle, { color: colors.text }]}>AI Suggested Tags</RNText>
            <Ionicons name="flash" size={24} color={colors.primary} />
          </RNView>
          <RNText style={[styles.sectionSubtitle, { color: colors.secondary }]}>
            Based on your images, we suggest these tags:
          </RNText>

          <RNView style={styles.tagsContainer}>
            {suggestedTags.map((tag, index) => (
              <RNTouchableOpacity
                key={index}
                style={[
                  styles.tagButton,
                  {
                    backgroundColor: colors.primary + '10',
                    borderColor: colors.primary,
                  },
                ]}
              >
                <RNText style={[styles.tagText, { color: colors.primary }]}>{tag}</RNText>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={colors.primary}
                  style={styles.tagIcon}
                />
              </RNTouchableOpacity>
            ))}
          </RNView>
        </RNView>
      )}

      {/* Location & Date Section */}
      <RNView style={[styles.section, styles.cardContainer, { backgroundColor: colors.card }]}>
        <RNText style={[styles.sectionTitle, { color: colors.text }]}>Location & Date</RNText>

        <RNView style={styles.inputGroup}>
          <RNText style={[styles.inputLabel, { color: colors.text }]}>Location</RNText>
          <RNView style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
            <Ionicons
              name="location-outline"
              size={20}
              color={colors.primary}
              style={styles.inputIcon}
            />
            <RNTextInput
              style={[styles.input, { backgroundColor: 'transparent', color: colors.text }]}
              placeholder="Enter location or use current location"
              placeholderTextColor={colors.secondary}
              value={location}
              onChangeText={setLocation}
            />
            <RNTouchableOpacity style={styles.inputActionButton}>
              <Ionicons name="navigate" size={20} color={colors.primary} />
            </RNTouchableOpacity>
          </RNView>
        </RNView>

        <RNView style={styles.inputGroup}>
          <RNText style={[styles.inputLabel, { color: colors.text }]}>Date</RNText>
          <RNView style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.primary}
              style={styles.inputIcon}
            />
            <RNTextInput
              style={[styles.input, { backgroundColor: 'transparent', color: colors.text }]}
              placeholder="Select date"
              placeholderTextColor={colors.secondary}
              value={date}
              onChangeText={setDate}
            />
            <RNTouchableOpacity style={styles.inputActionButton}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
            </RNTouchableOpacity>
          </RNView>
        </RNView>
      </RNView>

      {error ? <RNText style={[styles.errorText, { color: colors.error }]}>{error}</RNText> : null}

      {/* Submit Button */}
      <RNView style={styles.buttonContainer}>
        <RNTouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
              opacity: isSubmitting ? 0.7 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <RNActivityIndicator color="#FFFFFF" style={styles.submitButtonIcon} />
          ) : (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color="#FFFFFF"
              style={styles.submitButtonIcon}
            />
          )}
          <RNText style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </RNText>
        </RNTouchableOpacity>
      </RNView>
    </RNScrollView>
  );
};

const styles = StyleSheet.create({
  addImageButton: {
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 100,
    overflow: 'hidden',
    width: 100,
  },
  addImageInner: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  addImageText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  cardContainer: {
    borderRadius: 12,
    elevation: 2,
    marginHorizontal: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chip: {
    borderRadius: 16,
    marginBottom: 6,
    marginRight: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chipsContainer: {
    height: 40,
    marginTop: 8,
  },
  chipsContentContainer: {
    paddingRight: 12,
  },
  container: {
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
    marginHorizontal: 16,
    textAlign: 'center',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    paddingTop: 60,
  },
  headerSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  imageWrapper: {
    borderRadius: 8,
    elevation: 2,
    marginRight: 8,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imagesContainer: {
    height: 110,
    marginTop: 8,
  },
  imagesContentContainer: {
    paddingRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
  },
  inputActionButton: {
    padding: 6,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  inputWrapper: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    height: 40,
    paddingHorizontal: 12,
  },
  inputWrapperColumn: {
    flexDirection: 'column',
    alignItems: 'stretch',
    height: undefined,
    minHeight: 100,
  },
  removeImageButton: {
    alignItems: 'center',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    top: 4,
    width: 20,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 14,
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
  tagButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 6,
    marginRight: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagIcon: {
    marginLeft: 4,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  toggleButton: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 80,
    paddingVertical: 6,
  },
  toggleButtonLeft: {
    borderBottomLeftRadius: 6,
    borderTopLeftRadius: 6,
    marginRight: 1,
  },
  toggleButtonRight: {
    borderBottomRightRadius: 6,
    borderTopRightRadius: 6,
    marginLeft: 1,
  },
  toggleContainer: {
    alignSelf: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    height: 36,
    marginBottom: 12,
    maxWidth: 200,
    padding: 2,
    width: '100%',
  },
  toggleIcon: {
    marginRight: 4,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  uploadProgressContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  uploadProgressText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  uploadedImage: {
    borderRadius: 8,
    height: 100,
    width: 100,
  },
});

export default SubmissionScreen;
