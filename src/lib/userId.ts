import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = 'guide-ai-user-id';

/**
 * Generate a simple unique ID for the device/user
 */
function generateUserId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `user_${timestamp}_${randomStr}`;
}

/**
 * Get or create a persistent user ID for this device
 * This ID is used for TTS trial tracking and rate limiting
 */
export async function getUserId(): Promise<string> {
  try {
    // Try to get existing user ID
    const existingUserId = await AsyncStorage.getItem(USER_ID_KEY);

    if (existingUserId) {
      return existingUserId;
    }

    // Generate new user ID if none exists
    const newUserId = generateUserId();
    await AsyncStorage.setItem(USER_ID_KEY, newUserId);

    console.log('Generated new user ID for TTS:', newUserId);
    return newUserId;
  } catch (error) {
    console.error('Error getting/creating user ID:', error);

    // Fallback to session-based ID if AsyncStorage fails
    const fallbackId = generateUserId();
    console.warn('Using session-based user ID:', fallbackId);
    return fallbackId;
  }
}

/**
 * Reset the user ID (useful for testing or privacy reset)
 */
export async function resetUserId(): Promise<string> {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
    return await getUserId(); // This will generate a new one
  } catch (error) {
    console.error('Error resetting user ID:', error);
    throw error;
  }
}
