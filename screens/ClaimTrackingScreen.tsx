'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { supabase } from '../config/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

type TimelineEvent = {
  id: string;
  event: string;
  date: string;
  time: string;
  completed: boolean;
  current?: boolean;
};

type TimelineItemProps = {
  event: TimelineEvent;
  index: number;
  total: number;
  colors: {
    primary: string;
    border: string;
    text: string;
    secondary: string;
  };
};

const TimelineItem = React.memo(({ event, index, total, colors }: TimelineItemProps) => (
  <View style={styles.timelineItem} testID={`timeline-item-${event.id}`}>
    <View
      style={[
        styles.timelineDot,
        {
          backgroundColor: event.completed ? colors.primary : colors.border,
          borderColor: event.current ? colors.primary : 'transparent',
          borderWidth: event.current ? 2 : 0,
        },
      ]}
    />
    {index < total - 1 && (
      <View
        style={[
          styles.timelineLine,
          { backgroundColor: event.completed ? colors.primary : colors.border },
        ]}
      />
    )}
    <View style={styles.timelineContent}>
      <Text
        style={[
          styles.timelineEvent,
          {
            color: event.completed ? colors.text : colors.secondary,
            fontWeight: event.current ? 'bold' : 'normal',
          },
        ]}
        numberOfLines={1}
      >
        {event.event}
      </Text>
      <Text style={[styles.timelineDate, { color: colors.secondary }]} numberOfLines={1}>
        {event.date} {event.time && `at ${event.time}`}
      </Text>
    </View>
  </View>
));

type ProofImageItemProps = {
  image: { uri: string };
  index: number;
  onRemove: () => void;
  colors: {
    error: string;
  };
};

const ProofImageItem = React.memo(({ image, index, onRemove, colors }: ProofImageItemProps) => (
  <View style={styles.imageWrapper} testID={`proof-image-${index}`}>
    <Image source={image} style={styles.proofImage} />
    <TouchableOpacity
      style={[styles.removeImageButton, { backgroundColor: colors.error }]}
      onPress={onRemove}
    >
      <Ionicons name="close" size={16} color="#FFFFFF" />
    </TouchableOpacity>
  </View>
));

const TimelineItemWrapper = ({
  event,
  index,
  total,
  colors,
}: TimelineItemProps & { key: string }) => (
  <TimelineItem event={event} index={index} total={total} colors={colors} />
);

const ProofImageItemWrapper = ({
  image,
  index,
  onRemove,
  colors,
}: ProofImageItemProps & { key: number }) => (
  <ProofImageItem image={image} index={index} onRemove={onRemove} colors={colors} />
);

type ClaimTrackingScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'ClaimTracking'
>;

// Add Claim type for claim state
interface Claim {
  id: string;
  item: any;
  status: string;
  progress: number;
  timeline: any[];
  finder: any;
}

const ClaimTrackingScreen = () => {
  const navigation = useNavigation<ClaimTrackingScreenNavigationProp>();
  const route = useRoute();
  const { colors } = useTheme();
  const claimId = (route as any).params?.claimId as string | undefined;
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [proofDescription, setProofDescription] = useState('');
  const [proofImages, setProofImages] = useState<Array<{ uri: string }>>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaim = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!claimId) {
          setError('No claim ID provided');
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('claims')
          .select(`*, item:items(*), requester:profiles!requester_id(*), finder:profiles!finder_id(*)`)
          .eq('id', claimId)
          .single();
        if (error) throw error;
        if (!data) {
          setError('No claim found for this ID');
          setLoading(false);
          return;
        }
        setClaim(data);
      } catch (err) {
        console.error('Error fetching claim:', err);
        setError('Failed to fetch claim details');
      } finally {
        setLoading(false);
      }
    };
    if (claimId) fetchClaim();
  }, [claimId]);

  // Add logging for the claim state
  useEffect(() => {
    console.log('Current claim state:', { claim, loading, error });
  }, [claim, loading, error]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      gestureEnabled: true,
      gestureDirection: 'horizontal',
      animation: 'slide_from_right',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors]);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Helper to upload image to Supabase bucket and update claim
  const uploadProofImage = async (localUri: string) => {
    if (!claimId) return;
    setUploading(true);
    setUploadError(null);
    try {
      // Get file info
      const fileName = `proof_${claimId}_${Date.now()}.jpg`;
      const fileData = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
      const fileBuffer = Buffer.from(fileData, 'base64');
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('item_images')
        .upload(fileName, fileBuffer, { contentType: 'image/jpeg', upsert: true });
      if (uploadError) throw uploadError;
      // Get public URL
      const { data: publicUrlData } = supabase.storage.from('item_images').getPublicUrl(fileName);
      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) throw new Error('Failed to get public URL');
      // Update claim with proof_image
      const { error: updateError } = await supabase
        .from('claims')
        .update({ proof_image: publicUrl })
        .eq('id', claimId);
      if (updateError) throw updateError;
      // Set proofImages state to the new image
      setProofImages([{ uri: publicUrl }]);
    } catch (err: any) {
      setUploadError('Failed to upload image. Please try again.');
      console.error('Error uploading proof image:', err);
    } finally {
      setUploading(false);
    }
  };

  // Handler for picking and uploading proof image
  const handleAddProofImage = async () => {
    // Pick image from device
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const localUri = result.assets[0].uri;
      await uploadProofImage(localUri);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, this would send the message to the backend
      setMessage('');
    }
  };

  const handleSubmitProof = () => {
    // In a real app, this would submit the proof to the backend
    alert('Proof submitted successfully!');
  };

  if (loading) {
    return <View style={[styles.container, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }
  if (error || !claim) {
    return <View style={[styles.container, { backgroundColor: colors.background }]}><Text style={[styles.errorText, { color: colors.text }]}>{error || 'Claim not found'}</Text></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: 8 }]}>
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Header with gradient overlay */}
          <View style={{
            padding: 0,
            marginBottom: 0,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            overflow: 'hidden',
            backgroundColor: colors.primary,
            elevation: 2,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
          }}>
            <View style={{ padding: 24, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
              <Ionicons name="shield-checkmark" size={32} color="#fff" style={{ marginRight: 12 }} />
              <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold', flex: 1 }}>Claim Tracking</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: 12, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500', textAlign: 'center' }}>
                Track the status of your claim for <Text style={{ fontWeight: '700' }}>{claim.item.title}</Text>
              </Text>
            </View>
          </View>

          {/* Item Card */}
          <View style={[styles.itemCard, { backgroundColor: colors.card, borderRadius: 20, marginTop: -32, marginHorizontal: 16, elevation: 6, shadowColor: colors.primary, shadowOpacity: 0.08 }]}>
            <Image source={{ uri: claim.item.image }} style={[styles.itemImage, { borderRadius: 16, margin: 8 }]} />
            <View style={styles.itemDetails}>
              <Text style={[styles.itemTitle, { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 4 }]} numberOfLines={1}>
                {claim.item.title}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons name="information-circle-outline" size={18} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.statusLabel, { color: colors.secondary, fontWeight: '600' }]}>Status:</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.primary, marginLeft: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }]}>
                  <Text style={styles.statusText} numberOfLines={1}>{claim.status}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Progress Tracker */}
          <View style={[styles.progressSection, { backgroundColor: colors.card, borderRadius: 18, marginHorizontal: 16, marginTop: 18, elevation: 2 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="trending-up" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.progressTitle, { color: colors.text, fontSize: 17, fontWeight: 'bold' }]}>Claim Progress</Text>
              <Text style={[styles.progressPercentage, { color: colors.primary, marginLeft: 'auto', fontWeight: 'bold', fontSize: 16 }]}>{claim.progress}%</Text>
            </View>
            <View style={[styles.progressBarContainer, { backgroundColor: colors.border, height: 10, borderRadius: 6 }]}>
              <View style={{
                width: `${claim.progress}%`,
                backgroundColor: colors.primary,
                height: 10,
                borderRadius: 6,
                shadowColor: colors.primary,
                shadowOpacity: 0.15,
                shadowRadius: 4,
              }} />
            </View>
            <Text style={[styles.progressEstimate, { color: colors.secondary, marginTop: 6, fontSize: 13 }]}>Estimated completion: 2-3 days</Text>
          </View>

          {/* Timeline Section */}
          <View style={[styles.timelineSection, { backgroundColor: colors.card, borderRadius: 18, marginHorizontal: 16, marginTop: 18, elevation: 2, paddingBottom: 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="time-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 17, fontWeight: 'bold' }]}>Timeline</Text>
            </View>
            <View style={styles.timeline}>
              {Array.isArray(claim.timeline) && claim.timeline.length > 0 ? (
                claim.timeline.map((event, index) => (
                  <TimelineItem
                    key={event.id}
                    event={event}
                    index={index}
                    total={claim.timeline.length}
                    colors={colors}
                  />
                ))
              ) : (
                <Text style={{ color: colors.text, opacity: 0.7, marginTop: 8 }}>No timeline events yet.</Text>
              )}
            </View>
          </View>

          {/* Proof Submission Section */}
          <View style={[styles.proofSection, { backgroundColor: colors.card, borderRadius: 18, marginHorizontal: 16, marginTop: 18, elevation: 2 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="image-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 17, fontWeight: 'bold' }]}>Submit Proof of Ownership</Text>
            </View>
            <Text style={[styles.proofDescription, { color: colors.secondary, fontSize: 14, marginBottom: 12 }]} numberOfLines={2}>
              Please provide evidence that you are the rightful owner of this item.
            </Text>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text, fontWeight: '600' }]} numberOfLines={1}>Description</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: colors.background, color: colors.text, borderWidth: 1, borderColor: colors.border, fontSize: 15 },
                ]}
                placeholder="Describe unique features or provide details only the owner would know..."
                placeholderTextColor="#888888"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={proofDescription}
                onChangeText={setProofDescription}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text, fontWeight: '600' }]} numberOfLines={1}>Upload Images</Text>
              <Text style={[styles.inputSubLabel, { color: colors.secondary, fontSize: 13 }]} numberOfLines={2}>
                Upload receipts, photos with the item, or other proof of ownership.
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imagesContainer}
                contentContainerStyle={styles.imagesContent}
              >
                {proofImages.map((image, index) => (
                  <ProofImageItem
                    key={index}
                    image={image}
                    index={index}
                    onRemove={() => setProofImages([])}
                    colors={colors}
                  />
                ))}
                <TouchableOpacity
                  style={[styles.addImageButton, { borderColor: colors.primary, backgroundColor: uploading ? '#f3f3f3' : 'transparent' }]}
                  onPress={handleAddProofImage}
                  disabled={uploading}
                >
                  <Ionicons name="camera-outline" size={32} color={colors.primary} />
                  <Text style={[styles.addImageText, { color: colors.primary }]} numberOfLines={1}>
                    {uploading ? 'Uploading...' : 'Add Photo'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
              {uploadError && <Text style={{ color: 'red', marginTop: 8 }}>{uploadError}</Text>}
            </View>
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary, marginTop: 10, borderRadius: 10, elevation: 2 },
              ]}
              onPress={handleSubmitProof}
            >
              <Ionicons name="cloud-upload-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.submitButtonText} numberOfLines={1}>Submit Proof</Text>
            </TouchableOpacity>
          </View>

          {/* Chat with Finder Section */}
          <View style={{ padding: 16, marginTop: 8 }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.18,
                shadowRadius: 8,
                elevation: 6,
                flexDirection: 'row',
                marginBottom: 8,
              }}
              onPress={() => navigation.navigate('Chat', {
                conversationId: `claim-${claim.id}`,
                otherUser: claim.finder,
                item: { id: claim.id, title: claim.item.title },
              })}
            >
              <Ionicons name="chatbubble-ellipses" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Chat with Finder</Text>
            </TouchableOpacity>
          </View>

          {/* Dispute Claim Button Section */}
          <View style={{ padding: 16, marginTop: 0 }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#EF4444',
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#EF4444',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.18,
                shadowRadius: 8,
                elevation: 6,
                flexDirection: 'row',
              }}
              onPress={() => alert('Dispute feature coming soon!')}
            >
              <Ionicons name="alert-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Dispute Claim</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  addImageButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 100,
    justifyContent: 'center',
    width: 100,
  },
  addImageText: {
    fontSize: 12,
    marginTop: 8,
  },
  chatContainer: {
    borderRadius: 16,
    elevation: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chatInput: {
    borderRadius: 20,
    flex: 1,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chatInputContainer: {
    borderTopColor: '#333333',
    borderTopWidth: 1,
    flexDirection: 'row',
    padding: 8,
  },
  chatSection: {
    marginBottom: 24,
    padding: 16,
  },
  container: {
    flex: 1,
  },
  finderCard: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
  },
  finderImage: {
    borderRadius: 25,
    height: 50,
    width: 50,
  },
  finderInfo: {
    marginLeft: 12,
  },
  finderName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  header: {
    padding: 16,
    paddingTop: 8,
    width: '100%',
  },
  headerSubtitle: {
    flexShrink: 1,
    flexWrap: 'wrap',
    fontSize: 16,
    lineHeight: 22,
    width: '100%',
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingRight: 16,
    width: '100%',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  imageWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  imagesContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  imagesContent: {
    paddingRight: 16,
  },
  input: {
    borderRadius: 12,
    fontSize: 16,
    padding: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputSubLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  itemCard: {
    borderRadius: 16,
    elevation: 3,
    flexDirection: 'row',
    margin: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
    padding: 12,
  },
  itemImage: {
    height: 100,
    width: 100,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  messageReceived: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderRadius: 16,
    marginBottom: 16,
    maxWidth: '80%',
    padding: 12,
  },
  messageSent: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    borderRadius: 16,
    marginBottom: 16,
    maxWidth: '80%',
    padding: 12,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  messageTime: {
    alignSelf: 'flex-end',
    fontSize: 10,
    marginTop: 4,
  },
  messages: {
    padding: 16,
  },
  progressBar: {
    borderRadius: 4,
    height: 8,
  },
  progressBarContainer: {
    borderRadius: 4,
    height: 8,
    marginBottom: 8,
  },
  progressEstimate: {
    fontSize: 12,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressSection: {
    borderRadius: 16,
    elevation: 3,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  proofDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  proofImage: {
    borderRadius: 12,
    height: 100,
    width: 100,
  },
  proofSection: {
    borderRadius: 16,
    elevation: 3,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ratingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  removeImageButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: -8,
    top: -8,
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sendButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statusLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 8,
    padding: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textArea: {
    minHeight: 100,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 16,
  },
  timelineDate: {
    fontSize: 14,
  },
  timelineDot: {
    borderRadius: 8,
    height: 16,
    marginTop: 4,
    width: 16,
  },
  timelineEvent: {
    fontSize: 16,
    marginBottom: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative',
  },
  timelineLine: {
    height: '100%',
    left: 7,
    position: 'absolute',
    top: 20,
    width: 2,
  },
  timelineSection: {
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 16,
    textAlign: 'center',
  },
});

export default ClaimTrackingScreen;
