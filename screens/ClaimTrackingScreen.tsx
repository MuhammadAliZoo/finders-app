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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type TimelineEvent = {
  id: string;
  event: string;
  date: string;
  time: string;
  completed: boolean;
  current?: boolean;
};

// Mock data
const claimDetails = {
  id: '1',
  itemTitle: 'Gold Watch',
  itemImage: 'https://via.placeholder.com/300',
  status: 'Verification',
  progress: 40,
  finder: {
    name: 'Michael Rodriguez',
    image: 'https://via.placeholder.com/100',
    rating: 4.8,
  },
  timeline: [
    {
      id: 't1',
      event: 'Claim Submitted',
      date: 'June 16, 2023',
      time: '10:30 AM',
      completed: true,
    },
    {
      id: 't2',
      event: 'Verification in Progress',
      date: 'June 16, 2023',
      time: '11:45 AM',
      completed: true,
      current: true,
    },
    {
      id: 't3',
      event: 'Proof Review',
      date: 'Pending',
      time: '',
      completed: false,
    },
    {
      id: 't4',
      event: 'Claim Approved',
      date: 'Pending',
      time: '',
      completed: false,
    },
    {
      id: 't5',
      event: 'Item Handover',
      date: 'Pending',
      time: '',
      completed: false,
    },
  ] as TimelineEvent[],
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

const ClaimTrackingScreen = () => {
  const navigation = useNavigation<ClaimTrackingScreenNavigationProp>();
  const route = useRoute();
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [proofDescription, setProofDescription] = useState('');
  const [proofImages, setProofImages] = useState<Array<{ uri: string }>>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

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

  const handleAddProofImage = () => {
    // In a real app, this would open the camera or image picker
    setProofImages([...proofImages, { uri: 'https://via.placeholder.com/300' }]);
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              Claim Tracking
            </Text>
            <View style={styles.headerSubtitleContainer}>
              <Text style={[styles.headerSubtitle, { color: colors.primary }]} numberOfLines={2}>
                Track the status of your claim for{' '}
                <Text style={{ fontWeight: '600' }}>{claimDetails.itemTitle}</Text>
              </Text>
            </View>
          </View>

          {/* Item Card */}
          <View style={[styles.itemCard, { backgroundColor: colors.card }]}>
            <Image source={{ uri: claimDetails.itemImage }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                {claimDetails.itemTitle}
              </Text>
              <View style={styles.statusContainer}>
                <Text style={[styles.statusLabel, { color: colors.secondary }]}>Status:</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.statusText} numberOfLines={1}>
                    {claimDetails.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Progress Tracker */}
          <View style={[styles.progressSection, { backgroundColor: colors.card }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressTitle, { color: colors.text }]} numberOfLines={1}>
                Claim Progress
              </Text>
              <Text style={[styles.progressPercentage, { color: colors.primary }]}>
                {claimDetails.progress}%
              </Text>
            </View>
            <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${claimDetails.progress}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressEstimate, { color: colors.secondary }]} numberOfLines={1}>
              Estimated completion: 2-3 days
            </Text>
          </View>

          {/* Timeline */}
          <View style={styles.timelineSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]} numberOfLines={1}>
              Timeline
            </Text>
            <View style={styles.timeline}>
              {claimDetails.timeline.map((event, index) => (
                <TimelineItem
                  key={event.id}
                  event={event}
                  index={index}
                  total={claimDetails.timeline.length}
                  colors={colors}
                />
              ))}
            </View>
          </View>

          {/* Proof Submission */}
          <View style={[styles.proofSection, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]} numberOfLines={1}>
              Submit Proof of Ownership
            </Text>
            <Text style={[styles.proofDescription, { color: colors.secondary }]} numberOfLines={2}>
              Please provide evidence that you are the rightful owner of this item.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]} numberOfLines={1}>
                Description
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: colors.background, color: colors.text },
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
              <Text style={[styles.inputLabel, { color: colors.text }]} numberOfLines={1}>
                Upload Images
              </Text>
              <Text style={[styles.inputSubLabel, { color: colors.secondary }]} numberOfLines={2}>
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
                    onRemove={() => setProofImages(proofImages.filter((_, i) => i !== index))}
                    colors={colors}
                  />
                ))}

                <TouchableOpacity
                  style={[styles.addImageButton, { borderColor: colors.primary }]}
                  onPress={handleAddProofImage}
                >
                  <Ionicons name="camera-outline" size={32} color={colors.primary} />
                  <Text style={[styles.addImageText, { color: colors.primary }]} numberOfLines={1}>
                    Add Photo
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmitProof}
            >
              <Text style={styles.submitButtonText} numberOfLines={1}>
                Submit Proof
              </Text>
            </TouchableOpacity>
          </View>

          {/* Chat with Finder */}
          <View style={styles.chatSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]} numberOfLines={1}>
              Chat with Finder
            </Text>

            <View style={[styles.finderCard, { backgroundColor: colors.card }]}>
              <Image source={{ uri: claimDetails.finder.image }} style={styles.finderImage} />
              <View style={styles.finderInfo}>
                <Text style={[styles.finderName, { color: colors.text }]} numberOfLines={1}>
                  {claimDetails.finder.name}
                </Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color={colors.warning} />
                  <Text style={[styles.ratingText, { color: colors.secondary }]} numberOfLines={1}>
                    {claimDetails.finder.rating}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.chatContainer, { backgroundColor: colors.card }]}>
              <View style={styles.messages}>
                <View style={[styles.messageReceived, { backgroundColor: colors.background }]}>
                  <Text style={[styles.messageText, { color: colors.text }]} numberOfLines={3}>
                    Hello! I found a gold watch that might be yours. Can you describe any unique
                    features?
                  </Text>
                  <Text style={[styles.messageTime, { color: colors.secondary }]} numberOfLines={1}>
                    10:30 AM
                  </Text>
                </View>

                <View style={[styles.messageSent, { backgroundColor: colors.primary }]}>
                  <Text style={styles.messageText} numberOfLines={3}>
                    Hi! Yes, my watch has my initials "JD" engraved on the back and has a small
                    scratch on the face.
                  </Text>
                  <Text
                    style={[styles.messageTime, { color: 'rgba(255,255,255,0.7)' }]}
                    numberOfLines={1}
                  >
                    10:35 AM
                  </Text>
                </View>

                <View style={[styles.messageReceived, { backgroundColor: colors.background }]}>
                  <Text style={[styles.messageText, { color: colors.text }]} numberOfLines={3}>
                    That matches the watch I found! I'll check for the initials and confirm.
                  </Text>
                  <Text style={[styles.messageTime, { color: colors.secondary }]} numberOfLines={1}>
                    10:38 AM
                  </Text>
                </View>
              </View>

              <View style={styles.chatInputContainer}>
                <TextInput
                  style={[
                    styles.chatInput,
                    { backgroundColor: colors.background, color: colors.text },
                  ]}
                  placeholder="Type a message..."
                  placeholderTextColor="#888888"
                  value={message}
                  onChangeText={setMessage}
                />
                <TouchableOpacity
                  style={[styles.sendButton, { backgroundColor: colors.primary }]}
                  onPress={handleSendMessage}
                >
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
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
});

export default ClaimTrackingScreen;
