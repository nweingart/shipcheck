import type { Rule } from '../../types/index.js';

/**
 * Maps common RN permission API patterns to the required NS*UsageDescription plist key.
 */
const PERMISSION_MAP: Record<string, { key: string; label: string }> = {
  // Camera
  'launchCamera|ImagePicker.*camera|CameraRoll|react-native-camera|expo-camera|requestCameraPermission':
    { key: 'NSCameraUsageDescription', label: 'Camera' },
  // Photo Library
  'launchImageLibrary|CameraRoll|PhotoLibrary|expo-image-picker|requestPhotoLibraryPermission':
    { key: 'NSPhotoLibraryUsageDescription', label: 'Photo Library' },
  // Location
  'Geolocation|getCurrentPosition|watchPosition|expo-location|requestForegroundPermission|requestLocationPermission':
    { key: 'NSLocationWhenInUseUsageDescription', label: 'Location' },
  // Microphone
  'AudioRecorder|expo-av.*record|requestMicrophonePermission|react-native-audio':
    { key: 'NSMicrophoneUsageDescription', label: 'Microphone' },
  // Contacts
  'Contacts\\.getAll|expo-contacts|react-native-contacts':
    { key: 'NSContactsUsageDescription', label: 'Contacts' },
  // Calendars
  'CalendarManager|expo-calendar|react-native-calendar-events':
    { key: 'NSCalendarsUsageDescription', label: 'Calendars' },
  // Face ID
  'LAContext|FaceID|react-native-biometrics|expo-local-authentication':
    { key: 'NSFaceIDUsageDescription', label: 'Face ID' },
  // Bluetooth
  'BleManager|react-native-ble|expo-bluetooth|CBCentralManager':
    { key: 'NSBluetoothAlwaysUsageDescription', label: 'Bluetooth' },
  // Motion
  'CMMotionManager|expo-sensors|react-native-sensors|Accelerometer|Gyroscope':
    { key: 'NSMotionUsageDescription', label: 'Motion' },
  // Speech Recognition
  'SFSpeechRecognizer|expo-speech|react-native-voice':
    { key: 'NSSpeechRecognitionUsageDescription', label: 'Speech Recognition' },
};

export const missingPurposeStrings: Rule = {
  meta: {
    id: 'privacy/missing-purpose-strings',
    title: 'Missing Purpose Strings',
    description:
      'Code references permission APIs but Info.plist is missing the required NS*UsageDescription key. Apple will reject the app.',
    severity: 'error',
    category: 'privacy',
    fixable: true,
  },

  check(context) {
    const violations = [];

    if (!context.plist) {
      return { violations: [] };
    }

    const allSource = context.sourceFiles.map((f) => f.content).join('\n');

    for (const [pattern, { key, label }] of Object.entries(PERMISSION_MAP)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(allSource) && !context.plist.purposeStrings[key]) {
        // Find which source file(s) reference this
        const matchingFiles = context.sourceFiles
          .filter((f) => regex.test(f.content))
          .map((f) => f.path);

        violations.push({
          message: `Code uses ${label} APIs but Info.plist is missing \`${key}\``,
          file: context.project.infoPlistPath ?? undefined,
          fix: {
            prompt: `Add the key "${key}" to the Info.plist file with an appropriate user-facing description for why the app needs ${label} access. The description should be specific to this app's use case. Look at the source code to understand why this permission is needed.`,
            files: [
              context.project.infoPlistPath!,
              ...matchingFiles.slice(0, 3),
            ],
          },
        });
      }
    }

    return { violations };
  },
};
