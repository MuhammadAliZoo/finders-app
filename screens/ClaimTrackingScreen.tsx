"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from "react-native"
import { useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

// Mock data
const claimDetails = {
  id: "1",
  itemTitle: "Gold Watch",
  itemImage: "https://via.placeholder.com/300",
  status: "Verification",
  progress: 40,
  finder: {
    name: "Michael Rodriguez",
    image: "https://via.placeholder.com/100",
    rating: 4.8,
  },
  timeline: [
    {
      id: "t1",
      event: "Claim Submitted",
      date: "June 16, 2023",
      time: "10:30 AM",
      completed: true,
    },
    {
      id: "t2",
      event: "Verification in Progress",
      date: "June 16, 2023",
      time: "11:45 AM",
      completed: true,
      current: true,
    },
    {
      id: "t3",
      event: "Proof Review",
      date: "Pending",
      time: "",
      completed: false,
    },
    {
      id: "t4",
      event: "Claim Approved",
      date: "Pending",
      time: "",
      completed: false,
    },
    {
      id: "t5",
      event: "Item Handover",
      date: "Pending",
      time: "",
      completed: false,
    },
  ],
}

const ClaimTrackingScreen = () => {
  const route = useRoute()
  const { colors } = useTheme()
  const [message, setMessage] = useState("")
  const [proofDescription, setProofDescription] = useState("")
  const [proofImages, setProofImages] = useState([])

  const handleAddProofImage = () => {
    // In a real app, this would open the camera or image picker
    setProofImages([...proofImages, "https://via.placeholder.com/300"])
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, this would send the message to the backend
      setMessage("")
    }
  }

  const handleSubmitProof = () => {
    // In a real app, this would submit the proof to the backend
    alert("Proof submitted successfully!")
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Claim Tracking</Text>
        <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
          Track the status of your claim for {claimDetails.itemTitle}
        </Text>
      </View>

      {/* Item Card */}
      <View style={[styles.itemCard, { backgroundColor: colors.card }]}>
        <Image source={{ uri: claimDetails.itemImage }} style={styles.itemImage} />
        <View style={styles.itemDetails}>
          <Text style={[styles.itemTitle, { color: colors.text }]}>{claimDetails.itemTitle}</Text>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusLabel, { color: colors.secondary }]}>Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.statusText}>{claimDetails.status}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Progress Tracker */}
      <View style={[styles.progressSection, { backgroundColor: colors.card }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: colors.text }]}>Claim Progress</Text>
          <Text style={[styles.progressPercentage, { color: colors.primary }]}>{claimDetails.progress}%</Text>
        </View>
        <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
          <View style={[styles.progressBar, { width: `${claimDetails.progress}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressEstimate, { color: colors.secondary }]}>Estimated completion: 2-3 days</Text>
      </View>

      {/* Timeline */}
      <View style={styles.timelineSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Timeline</Text>
        <View style={styles.timeline}>
          {claimDetails.timeline.map((event, index) => (
            <View key={event.id} style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  {
                    backgroundColor: event.completed ? colors.success : colors.border,
                    borderColor: event.current ? colors.primary : "transparent",
                    borderWidth: event.current ? 2 : 0,
                  },
                ]}
              />
              {index < claimDetails.timeline.length - 1 && (
                <View
                  style={[styles.timelineLine, { backgroundColor: event.completed ? colors.success : colors.border }]}
                />
              )}
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineEvent,
                    {
                      color: event.completed ? colors.text : colors.secondary,
                      fontWeight: event.current ? "bold" : "normal",
                    },
                  ]}
                >
                  {event.event}
                </Text>
                <Text style={[styles.timelineDate, { color: colors.secondary }]}>
                  {event.date} {event.time && `at ${event.time}`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Proof Submission */}
      <View style={[styles.proofSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Submit Proof of Ownership</Text>
        <Text style={[styles.proofDescription, { color: colors.secondary }]}>
          Please provide evidence that you are the rightful owner of this item.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text }]}
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
          <Text style={[styles.inputLabel, { color: colors.text }]}>Upload Images</Text>
          <Text style={[styles.inputSubLabel, { color: colors.secondary }]}>
            Upload receipts, photos with the item, or other proof of ownership.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
            {proofImages.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.proofImage} />
                <TouchableOpacity
                  style={[styles.removeImageButton, { backgroundColor: colors.error }]}
                  onPress={() => setProofImages(proofImages.filter((_, i) => i !== index))}
                >
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.addImageButton, { borderColor: colors.primary }]}
              onPress={handleAddProofImage}
            >
              <Ionicons name="camera-outline" size={32} color={colors.primary} />
              <Text style={[styles.addImageText, { color: colors.primary }]}>Add Photo</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmitProof}
        >
          <Text style={styles.submitButtonText}>Submit Proof</Text>
        </TouchableOpacity>
      </View>

      {/* Chat with Finder */}
      <View style={styles.chatSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Chat with Finder</Text>

        <View style={[styles.finderCard, { backgroundColor: colors.card }]}>
          <Image source={{ uri: claimDetails.finder.image }} style={styles.finderImage} />
          <View style={styles.finderInfo}>
            <Text style={[styles.finderName, { color: colors.text }]}>{claimDetails.finder.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <Text style={[styles.ratingText, { color: colors.secondary }]}>{claimDetails.finder.rating}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.chatContainer, { backgroundColor: colors.card }]}>
          <View style={styles.messages}>
            <View style={[styles.messageReceived, { backgroundColor: colors.background }]}>
              <Text style={[styles.messageText, { color: colors.text }]}>
                Hello! I found a gold watch that might be yours. Can you describe any unique features?
              </Text>
              <Text style={[styles.messageTime, { color: colors.secondary }]}>10:30 AM</Text>
            </View>

            <View style={[styles.messageSent, { backgroundColor: colors.primary }]}>
              <Text style={styles.messageText}>
                Hi! Yes, my watch has my initials "JD" engraved on the back and has a small scratch on the face.
              </Text>
              <Text style={[styles.messageTime, { color: "rgba(255,255,255,0.7)" }]}>10:35 AM</Text>
            </View>

            <View style={[styles.messageReceived, { backgroundColor: colors.background }]}>
              <Text style={[styles.messageText, { color: colors.text }]}>
                That matches the watch I found! I'll check for the initials and confirm.
              </Text>
              <Text style={[styles.messageTime, { color: colors.secondary }]}>10:38 AM</Text>
            </View>
          </View>

          <View style={styles.chatInputContainer}>
            <TextInput
              style={[styles.chatInput, { backgroundColor: colors.background, color: colors.text }]}
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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  itemCard: {
    flexDirection: "row",
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  itemImage: {
    width: 100,
    height: 100,
  },
  itemDetails: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  progressSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "bold",
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressEstimate: {
    fontSize: 12,
  },
  timelineSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 24,
    position: "relative",
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    height: "100%",
    position: "absolute",
    left: 7,
    top: 20,
  },
  timelineContent: {
    marginLeft: 16,
    flex: 1,
  },
  timelineEvent: {
    fontSize: 16,
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
  },
  proofSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  proofDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputSubLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  imagesContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  imageWrapper: {
    position: "relative",
    marginRight: 12,
  },
  proofImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addImageText: {
    marginTop: 8,
    fontSize: 12,
  },
  submitButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  chatSection: {
    padding: 16,
    marginBottom: 24,
  },
  finderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  finderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  finderInfo: {
    marginLeft: 12,
  },
  finderName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  chatContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  messages: {
    padding: 16,
  },
  messageReceived: {
    alignSelf: "flex-start",
    maxWidth: "80%",
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  messageSent: {
    alignSelf: "flex-end",
    maxWidth: "80%",
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  messageText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  chatInputContainer: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  chatInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default ClaimTrackingScreen

