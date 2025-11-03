/**
 * Detects if the current device is an iPad
 * Handles both older iPads and newer iPadOS devices that masquerade as desktop
 */
export function isIPad(): boolean {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Check for explicit iPad user agent
  if (/iPad/i.test(userAgent)) {
    return true;
  }

  // For newer iPads running iPadOS 13+, the user agent might not explicitly say "iPad".
  // They masquerade as Mac, but still have touch support
  if (
    /Macintosh/i.test(userAgent) &&
    /Safari/i.test(userAgent) &&
    !/Chrome/i.test(userAgent)
  ) {
    // Check for touch support, which is a strong indicator of an iPad running iPadOS
    return navigator.maxTouchPoints > 0;
  }

  return false;
}

/**
 * Detects if the current device is any tablet (including iPad)
 */
export function isTablet(): boolean {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // iPad detection
  if (isIPad()) {
    return true;
  }

  // Android tablets
  if (/android/i.test(userAgent) && !/mobile/i.test(userAgent)) {
    return true;
  }

  // Windows tablets
  if (/windows nt/i.test(userAgent) && /touch/i.test(userAgent)) {
    return true;
  }

  // Generic tablet detection based on screen size and touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isLargeScreen = window.innerWidth >= 768 && window.innerWidth <= 1366;

  return hasTouch && isLargeScreen;
}

/**
 * Detects if the current device is a mobile phone
 */
export function isMobile(): boolean {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  return (
    /android.*mobile/i.test(userAgent) ||
    /iPhone/i.test(userAgent) ||
    /iPod/i.test(userAgent) ||
    (/android/i.test(userAgent) && window.innerWidth < 768) ||
    /IEMobile/i.test(userAgent) ||
    /BlackBerry/i.test(userAgent) ||
    /Opera Mini/i.test(userAgent)
  );
}

/**
 * Detects if the device supports touch events
 */
export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Get detailed device information
 */
export function getDeviceInfo() {
  return {
    isIPad: isIPad(),
    isTablet: isTablet(),
    isMobile: isMobile(),
    isTouchDevice: isTouchDevice(),
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
    userAgent: navigator.userAgent,
  };
}

// Log device info on load (development only)
if (import.meta.env.DEV) {
  const deviceInfo = getDeviceInfo();
  console.warn('Device Detection:', deviceInfo);

  if (deviceInfo.isIPad) {
    console.warn('✅ This is an iPad device.');
  } else if (deviceInfo.isTablet) {
    console.warn('📱 This is a tablet device (not iPad).');
  } else if (deviceInfo.isMobile) {
    console.warn('📱 This is a mobile phone.');
  } else {
    console.warn('💻 This is a desktop device.');
  }
}