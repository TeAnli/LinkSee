import type zhCN from './zh-CN';

type DeepString<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

const en: DeepString<typeof zhCN> = {
  // ===== Error =====
  error: {
    title: 'Something went wrong',
    description: 'Sorry, an unexpected error occurred while rendering this page. Try refreshing or going back to the home page.',
    retry: 'Reload',
    goHome: 'Go Home',
    pageNotFound: 'Page Not Found',
    pageNotFoundDesc: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
  },

  // ===== Common =====
  common: {
    appName: 'LinkSee',
    appDescription: 'AI-Powered Vertical Industry Intelligent Forum',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    back: 'Back',
    more: 'More',
    search: 'Search',
    noData: 'No data',
    placeholder: 'Layout placeholder — content coming soon',
  },

  // ===== Navigation =====
  nav: {
    home: 'Home',
    forum: 'Forum',
    ai: 'AI Assistant',
    messages: 'Messages',
    profile: 'Profile',
    settings: 'Settings',
    createPost: 'Write Post',
    expandSidebar: 'Expand sidebar',
    collapseSidebar: 'Collapse sidebar',
  },

  // ===== Auth =====
  auth: {
    signIn: 'Sign In',
    signUp: 'Create Account',
    signOut: 'Sign out',
    signInToAccount: 'Sign in to your account',
    createAccount: 'Create your account',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    email: 'Email',
    captcha: 'Captcha',
    enterUsername: 'Enter your username',
    enterPassword: 'Enter your password',
    chooseUsername: 'Choose a username',
    enterEmail: 'you@example.com',
    enterCaptcha: 'Enter captcha',
    optional: '(optional)',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    dontHaveAccount: "Don't have an account?",
    createOne: 'Create one',
    alreadyHaveAccount: 'Already have an account?',
    signingIn: 'Signing in...',
    creatingAccount: 'Creating account...',
    orContinueWith: 'OR CONTINUE WITH',
    hidePassword: 'Hide password',
    showPassword: 'Show password',
    clickToRefresh: 'Click to refresh',
    agreeTo: 'I agree to the',
    termsOfService: 'Terms of Service',
    and: 'and',
    privacyPolicy: 'Privacy Policy',
    // Validation
    fillAllFields: 'Please fill in all fields',
    loginFailed: 'Login failed, please try again',
    registrationFailed: 'Registration failed, please try again',
    usernameTooShort: 'Username must be at least 3 characters',
    passwordRequirements: 'Password does not meet all requirements',
    passwordsNotMatch: 'Passwords do not match',
    passwordsMatch: 'Passwords match',
    invalidEmail: 'Please enter a valid email address',
    // Password rules
    ruleMinLength: 'At least 8 characters',
    ruleContainsNumber: 'Contains a number',
    ruleContainsLetter: 'Contains a letter',
    // Forgot password
    resetYourPassword: 'Reset your password',
    resetInfo: "Enter the email associated with your account and we'll send you a reset link.",
    sendResetLink: 'Send Reset Link',
    sending: 'Sending...',
    checkInbox: 'Check your inbox',
    sentResetLinkTo: "We've sent a password reset link to",
    resendIn: 'Resend in {{seconds}}s',
    resending: 'Resending...',
    resendEmail: 'Resend Email',
    useDifferentEmail: 'Use a different email',
    backToSignIn: 'Back to sign in',
    enterYourEmail: 'Please enter your email',
    failedSendResetEmail: 'Failed to send reset email, please try again',
    failedResend: 'Failed to resend, please try again',
    // Reset password
    setNewPassword: 'Set new password',
    newPassword: 'New Password',
    enterNewPassword: 'Enter new password',
    confirmNewPassword: 'Confirm new password',
    invalidResetLink: 'Invalid Reset Link',
    resetLinkExpired: 'This password reset link is invalid or has expired.',
    requestNewLink: 'Request New Link',
    passwordUpdated: 'Password Updated',
    passwordUpdatedDesc: 'Your password has been reset successfully.',
    signInNow: 'Sign In Now',
    resetPassword: 'Reset Password',
    resetting: 'Resetting...',
    invalidResetToken: 'Invalid or missing reset token. Please request a new one.',
    resetFailed: 'Failed to reset password. The link may have expired.',
  },

  // ===== Post =====
  post: {
    pinned: 'Pinned',
    essence: 'Essence',
    views: 'Views',
    likes: 'Likes',
    comments: 'Comments',
    reads: 'Reads',
    share: 'Share',
    toc: 'Table of Contents',
    postNotFound: 'Post not found',
    backToHome: 'Back to home',
    aiSummary: 'AI Summary',
  },

  // ===== Create Post =====
  create: {
    title: 'Create New Post',
    draft: 'Save Draft',
    publish: 'Publish',
    enterTitle: 'Enter post title...',
    titleHint: 'A clear title helps more people find your post',
    selectCategory: 'Select category',
    addTags: 'Add tags (up to 5)',
    split: 'Split',
    edit: 'Edit',
    preview: 'Preview',
    startTyping: 'Start typing to preview',
    placeholder: 'Start writing your content...\n\nSupports Markdown syntax:\n- **Bold**, *italic*, ~~strikethrough~~\n- Code blocks, tables, quotes\n- Math: $E = mc^2$',
    characters: 'chars',
    lines: 'lines',
    words: 'words',
    tags: 'Tags',
    publishCheck: 'Publish Checklist',
    publishCheckDesc: 'Confirm the following before publishing',
    checkTitle: 'Title',
    checkCategory: 'Category',
    checkTags: 'Tags',
    checkContent: 'Content',
    tagsCount: '{{count}} tags',
    noTags: 'None',
    minCharacters: 'Min 20 chars',
    // Toolbar
    bold: 'Bold',
    italic: 'Italic',
    strikethrough: 'Strikethrough',
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    heading3: 'Heading 3',
    unorderedList: 'Unordered List',
    orderedList: 'Ordered List',
    quote: 'Quote',
    inlineCode: 'Inline Code',
    codeBlock: 'Code Block',
    table: 'Table',
    link: 'Link',
    image: 'Image',
    mathFormula: 'Math Formula',
  },

  // ===== Right Panel =====
  rightPanel: {
    hotTopics: 'Hot Topics',
    activeUsers: 'Active Users',
    aiPicks: 'AI Picks',
  },

  // ===== Profile =====
  profile: {
    posts: 'Posts',
    followers: 'Followers',
    following: 'Following',
    activity: 'Activity',
    bio: 'Bio',
    occupation: 'Occupation',
    location: 'Location',
    skills: 'Skills',
    joinedAt: 'Joined',
    recentPosts: 'Recent Posts',
    editProfile: 'Edit Profile',
    levelProgress: 'Level Progress',
    nextLevel: 'Next Level',
    experiencePoints: 'EXP',
    postsCount: 'posts',
    likesReceived: 'likes received',
    collectedCount: 'collected',
    loginToViewProfile: 'Sign in to view your profile',
    goToLogin: 'Sign In',
    noBioYet: 'No bio yet~',
    noSkillsYet: 'No skills tags yet~',
    noPostsYet: 'No posts published yet~',
  },

  // ===== Forum =====
  forum: {
    forumCategories: 'Forum Categories',
    categories: 'Categories',
  },

  // ===== AI Chat =====
  ai: {
    chatInterface: 'AI Chat Interface',
    conversation: 'Conversation',
  },

  // ===== TopBar =====
  topBar: {
    searchPlaceholder: 'Search posts, users, topics...',
    notifications: 'Notifications',
    userMenu: 'User menu',
  },

  // ===== Notifications =====
  noti: {
    title: 'Notifications',
    empty: 'No notifications',
    emptyDesc: 'New messages will appear here~',
    markAllRead: 'Mark all read',
    viewAll: 'View all',
    interaction: 'Interaction',
    system: 'System',
    ai: 'AI',
    commentedYourPost: 'commented on your post',
    likedYourPost: 'liked your post',
    repliedYourComment: 'replied to your comment',
    followedYou: 'followed you',
    mentionedYou: 'mentioned you',
    systemUpdate: 'System update',
    aiAnswerReady: 'AI answer ready',
  },

  // ===== Theme =====
  theme: {
    settings: 'Theme',
    mode: 'Mode',
    hue: 'Hue',
    presets: 'Presets',
  },

  // ===== Color Picker =====
  colorPicker: {
    blueViolet: 'Blue Violet',
    pinkRose: 'Pink Rose',
    orangeSoda: 'Orange Soda',
    lemonDrop: 'Lemon Drop',
    mintFresh: 'Mint Fresh',
    skyBlue: 'Sky Blue',
  },

  // ===== Relative Time =====
  time: {
    justNow: 'just now',
    minutesAgo: '{{count}}m ago',
    hoursAgo: '{{count}}h ago',
    daysAgo: '{{count}}d ago',
  },

  // ===== User Levels =====
  levels: {
    newbie: 'Newbie',
    active: 'Active',
    expert: 'Expert',
    professional: 'Professional',
    star: 'Star',
    leader: 'Leader',
  },
};

export default en;
