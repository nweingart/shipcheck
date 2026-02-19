export interface ProjectInfo {
  /** Absolute path to the project root (where package.json lives) */
  rootDir: string;
  /** Absolute path to the ios/ directory */
  iosDir: string;
  /** App name (from Xcode project or package.json) */
  appName: string;
  /** Path to Info.plist */
  infoPlistPath: string | null;
  /** Path to project.pbxproj */
  pbxprojPath: string | null;
  /** Path to Podfile.lock */
  podfileLockPath: string | null;
  /** Path to PrivacyInfo.xcprivacy */
  privacyManifestPath: string | null;
}

export interface ParsedPlist {
  raw: Record<string, unknown>;
  /** NS*UsageDescription keys present */
  purposeStrings: Record<string, string>;
  /** App Transport Security settings */
  ats: {
    allowsArbitraryLoads?: boolean;
    exceptionDomains?: Record<string, unknown>;
  };
  /** URL schemes registered */
  urlSchemes: string[];
  /** Bundle version string */
  bundleVersion: string | null;
  /** Bundle short version string (marketing version) */
  bundleShortVersion: string | null;
}

export interface ParsedPbxproj {
  raw: string;
  /** MARKETING_VERSION from build settings */
  marketingVersion: string | null;
  /** IPHONEOS_DEPLOYMENT_TARGET */
  deploymentTarget: string | null;
  /** ASSETCATALOG_COMPILER_APPICON_NAME */
  appIconName: string | null;
}

export interface SourceFile {
  path: string;
  content: string;
}

export interface RuleContext {
  project: ProjectInfo;
  plist: ParsedPlist | null;
  pbxproj: ParsedPbxproj | null;
  sourceFiles: SourceFile[];
  packageJson: Record<string, unknown> | null;
}
