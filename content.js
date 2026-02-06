// This script runs on EVERY webpage you visit
// It's job is to find and hide distracting elements

console.log("Focus Shield is active!");

let mutationObserver = null;
let currentMode = null;

// Listen for messages from the popup (when user clicks buttons)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === "simplifyMode") {
      activateSimplifyMode();
    } else if (request.action === "focusMode") {
      activateFocusMode();
    } else if (request.action === "normalMode") {
      deactivateAllModes();
    }
    sendResponse({status: "success"});
  } catch (error) {
    console.error("Focus Shield error:", error);
    sendResponse({status: "error", message: error.message});
  }
});

// SIMPLIFY MODE: Remove ads, popups, and clutter
function activateSimplifyMode() {
  console.log("Simplify Mode activated");
  currentMode = "simplify";
  
  // Common selectors for ads and distracting elements
  const distractingSelectors = [
    // Ads - more aggressive matching
    '[class*="ad-"]',
    '[class*="ad_"]',
    '[class*="_ad"]',
    '[class*="ads"]',
    '[id*="ad-"]',
    '[id*="ad_"]',
    '[id*="_ad"]',
    '[class*="advertisement"]',
    '[class*="adsbygoogle"]',
    '[class*="banner"]',
    '[class*="sponsor"]',
    '[data-ad-client]',
    '[data-ad-slot]',
    '[data-ad-format]',
    '[data-adsbygoogle]',
    'iframe[src*="ads"]',
    'iframe[src*="doubleclick"]',
    'iframe[src*="googlesyndication"]',
    'iframe[src*="facebook.com/plugins"]',
    'iframe[src*="googletagmanager"]',
    'iframe[src*="pagead"]',
    'script[src*="ads"]',
    'script[src*="advertisement"]',
    '[class*="advert"]',
    '[class*="advertising"]',
    '[class*="promoted"]',
    '[class*="promote"]',
    '[class*="promotional"]',
    '[class*="promo"]',
    
    // Popups and modals
    '[class*="modal"]',
    '[class*="popup"]',
    '[class*="overlay"]',
    '[class*="notification"]',
    '[class*="toast"]',
    '[class*="dialog"]',
    '[role="dialog"]',
    
    // Social media widgets
    '[class*="social-share"]',
    '[class*="share-button"]',
    '[class*="shareicon"]',
    '[class*="social"]',
    
    // Cookie banners (more patterns)
    '[class*="cookie"]',
    '[id*="cookie"]',
    '[class*="gdpr"]',
    '[class*="consent"]',
    '[class*="banner-cookie"]',
    
    // Sidebars and extra navigation
    'aside',
    '[class*="sidebar"]',
    '[class*="right-rail"]',
    '[class*="rail"]',
    '[role="complementary"]',
    
    // Sticky headers/footers (often distracting)
    '[class*="sticky-header"]',
    '[class*="fixed-header"]',
    '[class*="sticky"]'
  ];
  
  // Hide all matching elements
  let hiddenCount = 0;
  distractingSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.classList.add('focus-shield-hidden');
        hiddenCount++;
      });
    } catch (e) {
      // Invalid selector, skip it
    }
  });
  
  console.log(`Simplify Mode: Hidden ${hiddenCount} distracting elements`);
  
  // Store that we're in simplify mode
  document.body.setAttribute('data-focus-shield', 'simplify');
  
  // Start watching for new ads injected dynamically
  startMutationObserver();
}

// FOCUS MODE: Only show the main content (article, video, etc.)
function activateFocusMode() {
  console.log("Focus Mode activated");
  currentMode = "focus";
  
  // First, do everything simplify mode does
  activateSimplifyMode();
  
  // Try to find the main content
  const mainContentSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.post-content',
    '.article-content',
    '#content',
    '.content'
  ];
  
  let mainContent = null;
  for (let selector of mainContentSelectors) {
    mainContent = document.querySelector(selector);
    if (mainContent) break;
  }
  
  if (mainContent) {
    // Hide everything except the main content and header
    const allElements = document.body.children;
    for (let element of allElements) {
      if (!element.contains(mainContent) && element.tagName !== 'HEADER') {
        element.classList.add('focus-shield-hidden');
      }
    }
    
    // Make the main content more readable
    if (mainContent) {
      mainContent.style.maxWidth = '700px';
      mainContent.style.margin = '0 auto';
      mainContent.style.padding = '20px';
    }
  }
  
  document.body.setAttribute('data-focus-shield', 'focus');
}

// NORMAL MODE: Show everything again
function deactivateAllModes() {
  console.log("Back to normal mode");
  currentMode = null;
  
  // Stop watching for new elements
  stopMutationObserver();
  
  // Remove all our hiding classes
  const hiddenElements = document.querySelectorAll('.focus-shield-hidden');
  hiddenElements.forEach(element => {
    element.classList.remove('focus-shield-hidden');
  });
  
  // Reset main content styles from focus mode
  const mainContent = document.querySelector('main, article, [role="main"], .post-content, .article-content, #content, .content');
  if (mainContent) {
    mainContent.style.maxWidth = '';
    mainContent.style.margin = '';
    mainContent.style.padding = '';
  }
  
  document.body.removeAttribute('data-focus-shield');
}

// MutationObserver to catch dynamically-injected ads
function startMutationObserver() {
  if (mutationObserver) return; // Already watching
  
  mutationObserver = new MutationObserver((mutations) => {
    // Rerun ad hiding on mutations (but throttle to avoid performance issues)
    clearTimeout(window.focusShieldTimeout);
    window.focusShieldTimeout = setTimeout(() => {
      if (currentMode === 'simplify' || currentMode === 'focus') {
        hideAds();
      }
    }, 500);
  });
  
  // Watch for changes to the entire document
  mutationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id', 'data-ad-client', 'data-ad-slot']
  });
  
  console.log("Focus Shield: Watching for dynamically-injected ads");
}

function stopMutationObserver() {
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
    console.log("Focus Shield: Stopped watching for new ads");
  }
}

// Extracted ad-hiding logic for reuse
function hideAds() {
  const distractingSelectors = [
    '[class*="ad-"]',
    '[class*="ad_"]',
    '[class*="_ad"]',
    '[class*="ads"]',
    '[id*="ad-"]',
    '[id*="ad_"]',
    '[id*="_ad"]',
    '[class*="advertisement"]',
    '[class*="adsbygoogle"]',
    '[class*="banner"]',
    '[class*="sponsor"]',
    '[data-ad-client]',
    '[data-ad-slot]',
    '[data-ad-format]',
    '[data-adsbygoogle]',
    'iframe[src*="ads"]',
    'iframe[src*="doubleclick"]',
    'iframe[src*="googlesyndication"]',
    'iframe[src*="facebook.com/plugins"]',
    'iframe[src*="googletagmanager"]',
    'iframe[src*="pagead"]'
  ];
  
  distractingSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (!element.classList.contains('focus-shield-hidden')) {
          element.classList.add('focus-shield-hidden');
          console.log("Focus Shield: Hid dynamically-injected ad", element);
        }
      });
    } catch (e) {
      // Invalid selector, skip
    }
  });
}

// Auto-activate simplify mode on page load (you can change this)
// Comment out this line if you don't want auto-activation
// activateSimplifyMode();
