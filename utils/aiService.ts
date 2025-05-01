import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Replace with your Google Cloud Vision API key
const GOOGLE_CLOUD_VISION_API_KEY = 'YOUR_API_KEY';
const GOOGLE_CLOUD_VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`;

export const processImageWithAI = async (imageUri: string): Promise<string> => {
  try {
    // Convert image to base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Prepare the request body
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 5,
            },
            {
              type: 'OBJECT_LOCALIZATION',
              maxResults: 5,
            },
          ],
        },
      ],
    };

    // Make the API request
    const response = await fetch(GOOGLE_CLOUD_VISION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Extract labels and objects from the response
    const labels = result.responses[0].labelAnnotations || [];
    const objects = result.responses[0].localizedObjectAnnotations || [];

    // Combine and format the results
    const items = [
      ...labels.map((label: any) => label.description),
      ...objects.map((obj: any) => obj.name),
    ];

    // Return the most relevant item
    return items[0] || 'No items detected';
  } catch (error) {
    console.error('AI processing error:', error);
    throw error;
  }
};
