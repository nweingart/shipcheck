import type { Rule } from '../../types/index.js';

const WEBVIEW_PATTERNS = [
  /react-native-webview/,
  /<WebView[\s/>]/,
  /import.*WebView/,
];

// UI components beyond the trivial wrappers (View, Text, StyleSheet)
const NATIVE_UI_COMPONENTS = [
  /FlatList/,
  /ScrollView/,
  /TextInput/,
  /TouchableOpacity|TouchableHighlight|Pressable/,
  /Image(?!.*WebView)/,
  /Modal/,
  /Button/,
  /SectionList/,
  /Switch/,
  /ActivityIndicator/,
  /SafeAreaView/,
  /KeyboardAvoidingView/,
  /StatusBar/,
  /Alert\./,
  /Animated\./,
  /Picker|@react-native-picker/,
  /Slider|@react-native-community\/slider/,
  /MapView|react-native-maps/,
  /DrawerLayout|NavigationContainer/,
  /BottomTab|createBottomTabNavigator/,
  /createStackNavigator|createNativeStackNavigator/,
];

export const webviewOnly: Rule = {
  meta: {
    id: 'functionality/webview-only',
    title: 'WebView-Only App',
    description:
      'App appears to be a thin WebView wrapper with minimal native UI. Apple may reject apps that are simply websites bundled as apps.',
    severity: 'warning',
    category: 'functionality',
    fixable: false,
  },

  check(context) {
    const violations = [];
    const allSource = context.sourceFiles.map((f) => f.content).join('\n');

    const usesWebView = WEBVIEW_PATTERNS.some((p) => p.test(allSource));
    if (!usesWebView) return { violations: [] };

    const nativeComponentCount = NATIVE_UI_COMPONENTS.filter((p) =>
      p.test(allSource),
    ).length;

    if (nativeComponentCount < 3) {
      violations.push({
        message: `App uses WebView but only ${nativeComponentCount} native UI component(s) were detected. Apple may reject apps that are primarily thin wrappers around a website. Guideline 4.2 requires apps to provide functionality beyond what a website can offer.`,
      });
    }

    return { violations };
  },
};
