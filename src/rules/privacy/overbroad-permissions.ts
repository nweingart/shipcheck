import type { Rule } from '../../types/index.js';

/**
 * Maps NS*UsageDescription keys to patterns that would justify their presence.
 */
const PERMISSION_USAGE_MAP: Record<string, { pattern: RegExp; label: string }> = {
  NSCameraUsageDescription: {
    pattern: /launchCamera|ImagePicker.*camera|CameraRoll|react-native-camera|expo-camera|requestCameraPermission/i,
    label: 'Camera',
  },
  NSPhotoLibraryUsageDescription: {
    pattern: /launchImageLibrary|CameraRoll|PhotoLibrary|expo-image-picker|requestPhotoLibraryPermission/i,
    label: 'Photo Library',
  },
  NSLocationWhenInUseUsageDescription: {
    pattern: /Geolocation|getCurrentPosition|watchPosition|expo-location|requestForegroundPermission|requestLocationPermission/i,
    label: 'Location (When In Use)',
  },
  NSLocationAlwaysUsageDescription: {
    pattern: /requestAlwaysAuthorization|requestBackgroundPermission|startMonitoringSignificantLocationChanges/i,
    label: 'Location (Always)',
  },
  NSMicrophoneUsageDescription: {
    pattern: /AudioRecorder|expo-av.*record|requestMicrophonePermission|react-native-audio/i,
    label: 'Microphone',
  },
  NSContactsUsageDescription: {
    pattern: /Contacts\.getAll|expo-contacts|react-native-contacts/i,
    label: 'Contacts',
  },
  NSCalendarsUsageDescription: {
    pattern: /CalendarManager|expo-calendar|react-native-calendar-events/i,
    label: 'Calendars',
  },
  NSFaceIDUsageDescription: {
    pattern: /LAContext|FaceID|react-native-biometrics|expo-local-authentication/i,
    label: 'Face ID',
  },
  NSBluetoothAlwaysUsageDescription: {
    pattern: /BleManager|react-native-ble|expo-bluetooth|CBCentralManager/i,
    label: 'Bluetooth',
  },
  NSMotionUsageDescription: {
    pattern: /CMMotionManager|expo-sensors|react-native-sensors|Accelerometer|Gyroscope/i,
    label: 'Motion',
  },
  NSSpeechRecognitionUsageDescription: {
    pattern: /SFSpeechRecognizer|expo-speech|react-native-voice/i,
    label: 'Speech Recognition',
  },
};

export const overbroadPermissions: Rule = {
  meta: {
    id: 'privacy/overbroad-permissions',
    title: 'Overbroad Permissions',
    description:
      'Info.plist declares permission usage descriptions for APIs that do not appear to be used in the source code.',
    severity: 'warning',
    category: 'privacy',
    fixable: true,
  },

  check(context) {
    const violations = [];

    if (!context.plist) return { violations: [] };

    const allSource = context.sourceFiles.map((f) => f.content).join('\n');

    for (const [key, { pattern, label }] of Object.entries(PERMISSION_USAGE_MAP)) {
      if (context.plist.purposeStrings[key] && !pattern.test(allSource)) {
        violations.push({
          message: `Info.plist declares \`${key}\` (${label}) but no matching API usage was found in source code. This may trigger App Review questions.`,
          file: context.project.infoPlistPath ?? undefined,
          fix: {
            prompt: `Remove the key "${key}" from Info.plist since the app does not appear to use ${label} APIs. If the permission IS actually needed (e.g., by a native module), keep it but verify the usage description is accurate.`,
            files: [context.project.infoPlistPath!],
          },
        });
      }
    }

    return { violations };
  },
};
