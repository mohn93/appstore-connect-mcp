// App Store Connect API resource types
// Reference: https://developer.apple.com/documentation/appstoreconnectapi

export interface ASCResource {
  type: string;
  id: string;
  links?: { self: string };
}

// Apps
export interface App extends ASCResource {
  type: "apps";
  attributes: {
    name: string;
    bundleId: string;
    sku: string;
    primaryLocale: string;
    contentRightsDeclaration?: string;
    isOrEverWasMadeForKids?: boolean;
  };
}

// Builds
export interface Build extends ASCResource {
  type: "builds";
  attributes: {
    version: string;
    uploadedDate: string;
    expirationDate: string;
    expired: boolean;
    minOsVersion: string;
    processingState: "PROCESSING" | "FAILED" | "INVALID" | "VALID";
    buildAudienceType?: string;
    iconAssetToken?: unknown;
  };
}

// App Store Versions
export interface AppStoreVersion extends ASCResource {
  type: "appStoreVersions";
  attributes: {
    platform: "IOS" | "MAC_OS" | "TV_OS" | "VISION_OS";
    versionString: string;
    appStoreState:
      | "ACCEPTED"
      | "DEVELOPER_REJECTED"
      | "DEVELOPER_REMOVED_FROM_SALE"
      | "IN_REVIEW"
      | "INVALID_BINARY"
      | "METADATA_REJECTED"
      | "PENDING_APPLE_RELEASE"
      | "PENDING_CONTRACT"
      | "PENDING_DEVELOPER_RELEASE"
      | "PREPARE_FOR_SUBMISSION"
      | "PREORDER_READY_FOR_SALE"
      | "PROCESSING_FOR_APP_STORE"
      | "READY_FOR_REVIEW"
      | "READY_FOR_SALE"
      | "REJECTED"
      | "REMOVED_FROM_SALE"
      | "WAITING_FOR_EXPORT_COMPLIANCE"
      | "WAITING_FOR_REVIEW"
      | "REPLACED_WITH_NEW_VERSION";
    releaseType?: "MANUAL" | "AFTER_APPROVAL" | "SCHEDULED";
    earliestReleaseDate?: string;
    createdDate: string;
  };
}

// Beta Groups (TestFlight)
export interface BetaGroup extends ASCResource {
  type: "betaGroups";
  attributes: {
    name: string;
    isInternalGroup: boolean;
    hasAccessToAllBuilds?: boolean;
    publicLinkEnabled?: boolean;
    publicLinkId?: string;
    publicLinkLimit?: number;
    publicLink?: string;
    feedbackEnabled?: boolean;
    createdDate: string;
  };
}

// Beta Testers
export interface BetaTester extends ASCResource {
  type: "betaTesters";
  attributes: {
    firstName?: string;
    lastName?: string;
    email: string;
    inviteType: "EMAIL" | "PUBLIC_LINK";
    state?: "NOT_INVITED" | "INVITED" | "ACCEPTED" | "INSTALLED";
  };
}

// Devices
export interface Device extends ASCResource {
  type: "devices";
  attributes: {
    name: string;
    platform: "IOS" | "MAC_OS";
    udid: string;
    deviceClass: "APPLE_WATCH" | "IPAD" | "IPHONE" | "IPOD" | "APPLE_TV" | "MAC";
    status: "ENABLED" | "DISABLED";
    model?: string;
    addedDate: string;
  };
}

// Bundle IDs
export interface BundleId extends ASCResource {
  type: "bundleIds";
  attributes: {
    name: string;
    identifier: string;
    platform: "IOS" | "MAC_OS" | "UNIVERSAL";
    seedId: string;
  };
}

// Users
export interface User extends ASCResource {
  type: "users";
  attributes: {
    username: string;
    firstName: string;
    lastName: string;
    roles: string[];
    allAppsVisible: boolean;
    provisioningAllowed: boolean;
  };
}

// Certificates
export interface Certificate extends ASCResource {
  type: "certificates";
  attributes: {
    name: string;
    certificateType: string;
    displayName: string;
    serialNumber: string;
    platform?: string;
    expirationDate: string;
  };
}

// Profiles
export interface Profile extends ASCResource {
  type: "profiles";
  attributes: {
    name: string;
    platform: string;
    profileType: string;
    profileState: "ACTIVE" | "INVALID";
    profileContent?: string;
    uuid: string;
    createdDate: string;
    expirationDate: string;
  };
}

// Customer Reviews
export interface CustomerReview extends ASCResource {
  type: "customerReviews";
  attributes: {
    rating: number;
    title?: string;
    body?: string;
    reviewerNickname: string;
    createdDate: string;
    territory: string;
  };
}

// In-App Purchases
export interface InAppPurchase extends ASCResource {
  type: "inAppPurchases";
  attributes: {
    name: string;
    productId: string;
    inAppPurchaseType: "CONSUMABLE" | "NON_CONSUMABLE" | "NON_RENEWING_SUBSCRIPTION";
    state: string;
  };
}

// Subscription Groups
export interface SubscriptionGroup extends ASCResource {
  type: "subscriptionGroups";
  attributes: {
    referenceName: string;
  };
}
