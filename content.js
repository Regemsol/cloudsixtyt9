// This script runs on EVERY webpage you visit
// It's job is to find and hide distracting elements

console.log("Focus Shield is active!");

// Listen for messages from the popup (when user clicks buttons)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "simplifyMode") {
    activateSimplifyMode();
  } else if (request.action === "focusMode") {
    activateFocusMode();
  } else if (request.action === "normalMode") {
    deactivateAllModes();
  }
});

// SIMPLIFY MODE: Remove ads, popups, and clutter
function activateSimplifyMode() {
  console.log("Simplify Mode activated");
  
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
    'iframe[src*="ads"]',
    'iframe[src*="doubleclick"]',
    'iframe[src*="googlesyndication"]',
    
    // Popups and modals
    '[class*="modal"]',
    '[class*="popup"]',
    '[class*="overlay"]',
    '[class*="notification"]',
    '[class*="toast"]',
    
    // Social media widgets
    '[class*="social-share"]',
    '[class*="share-button"]',
    '[class*="shareicon"]',
    
    // Cookie banners (more patterns)
    '[class*="cookie"]',
    '[id*="cookie"]',
    '[class*="gdpr"]',
    '[class*="consent"]',
    
    // Sidebars and extra navigation
    'aside',
    '[class*="sidebar"]',
    '[class*="right-rail"]',
    '[role="complementary"]',
    
    // Sticky headers/footers (often distracting)
    '[class*="sticky-header"]',
    '[class*="fixed-header"]'
  ];
  
  // Hide all matching elements
  let hiddenCount = 0;
  distractingSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      element.classList.add('focus-shield-hidden');
      hiddenCount++;
    });
  });
  
  console.log(`Simplify Mode: Hidden ${hiddenCount} distracting elements`);
  
  // Store that we're in simplify mode
  document.body.setAttribute('data-focus-shield', 'simplify');
}

// FOCUS MODE: Only show the main content (article, video, etc.)
function activateFocusMode() {
  console.log("Focus Mode activated");
  
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
  
  // Remove all our hiding classes
  const hiddenElements = document.querySelectorAll('.focus-shield-hidden');
  hiddenElements.forEach(element => {
    element.classList.remove('focus-shield-hidden');
    // Reset any inline styles we added
    element.style.maxWidth = '';
    element.style.margin = '';
    element.style.padding = '';
  });
  
  document.body.removeAttribute('data-focus-shield');
}

// Auto-activate simplify mode on page load (you can change this)
// Comment out this line if you don't want auto-activation
// activateSimplifyMode();
