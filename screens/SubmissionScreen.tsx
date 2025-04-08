"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

const SubmissionScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { type } = route.params || { type: "found" }

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [category, setCategory] = useState("")
  const [images, setImages] = useState([])
  const [suggestedTags, setSuggestedTags] = useState(["Wallet", "Black", "Leather"])

  const handleAddImage = () => {
    // In a real app, this would open the camera or image picker
    setImages([...images, "https://via.placeholder.com/300"])
  }

  const handleSubmit = () => {
    // In a real app, this would submit the form data to the backend
    navigation.goBack()
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {type === "found" ? "Report Found Item" : "Report Lost Item"}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
          Please provide as much detail as possible to help with matching.
        </Text>
      </View>

      {/* Image Upload Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Upload Images</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.secondary }]}>
          Clear photos increase the chances of a successful match.
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: image }} style={styles.uploadedImage} />
              <TouchableOpacity
                style={[styles.removeImageButton, { backgroundColor: colors.error }]}
                onPress={() => setImages(images.filter((_, i) => i !== index))}
              >
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={[styles.addImageButton, { borderColor: colors.primary }]} onPress={handleAddImage}>
            <Ionicons name="camera-outline" size={32} color={colors.primary} />
            <Text style={[styles.addImageText, { color: colors.primary }]}>Add Photo</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Item Details Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Item Details</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Title</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="e.g., Black Leather Wallet"
            placeholderTextColor="#888888"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Category</Text>
          <View style={[styles.categorySelector, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.categoryInput, { color: colors.text }]}
              placeholder="Select or type a category"
              placeholderTextColor="#888888"
              value={category}
              onChangeText={setCategory}
            />
            <Ionicons name="chevron-down" size={20} color={colors.secondary} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="Provide a detailed description of the item..."
            placeholderTextColor="#888888"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </View>

      {/* AI Suggested Tags */}
      {images.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Suggested Tags</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.secondary }]}>
            Based on your images, we suggest these tags:
          </Text>

          <View style={styles.tagsContainer}>
            {suggestedTags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.tagButton, { backgroundColor: colors.primary + "20", borderColor: colors.primary }]}
              >
                <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={styles.tagIcon} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Location & Date Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Location & Date</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Location</Text>
          <View style={[styles.locationInput, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, { flex: 1, backgroundColor: "transparent", color: colors.text }]}
              placeholder="Enter location or use current location"
              placeholderTextColor="#888888"
              value={location}
              onChangeText={setLocation}
            />
            <TouchableOpacity>
              <Ionicons name="location" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Date</Text>
          <View style={[styles.dateInput, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, { flex: 1, backgroundColor: "transparent", color: colors.text }]}
              placeholder="Select date"
              placeholderTextColor="#888888"
              value={date}
              onChangeText={setDate}
            />
            <TouchableOpacity>
              <Ionicons name="calendar" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  imagesContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  imageWrapper: {
    position: "relative",
    marginRight: 12,
  },
  uploadedImage: {
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
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
  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
  },
  categoryInput: {
    flex: 1,
    fontSize: 16,
  },
  locationInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tagButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 14,
  },
  tagIcon: {
    marginLeft: 4,
  },
  buttonContainer: {
    padding: 16,
    marginBottom: 24,
  },
  submitButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default SubmissionScreen

