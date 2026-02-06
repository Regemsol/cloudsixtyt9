# 🧪 NLP Testing & Debugging Guide

## Quick Testing Steps

### 1. Load the Extension
1. Go to `chrome://extensions/`
2. Click "Load unpacked"
3. Select the cloudsixtyt9 folder
4. Click "Reload" on the extension

### 2. Test Simple Mode

1. **Open a website** (try news sites, Reddit, Medium, etc.)
2. **Click the Focus Shield icon** → Click "Simplify Mode"
3. **Open DevTools** (F12)
4. **Look for these logs in the Console:**

```
✅ Simple Mode: NLP detected and hidden 18 distracting elements
🔍 NLP Analysis: Found 24 potentially distracting elements:
1. [ADS] Score: 0.92 | Class: "advertisement-block" | ID: ""
2. [MODALS] Score: 0.87 | Class: "popup-overlay" | ID: "modal-1"
3. [SIDEBARS] Score: 0.84 | Class: "sidebar-widget" | ID: ""
```

### 3. Test Focus Mode

1. **Open a website**
2. **Click the Focus Shield icon** → Click "Focus Mode"
3. **Check the logs:**

```
✅ Focus Mode: NLP detected and hidden 8 ads
🔍 NLP Focus Mode: Analyzed 20 distracting elements, hid 8 ads
```

### 4. Test Dynamic Detection

1. **Activate Simple Mode on a website**
2. **Scroll down and wait** for ads to be dynamically injected (they usually are)
3. **Check logs for:**

```
Focus Shield: NLP detected and hid 3 dynamically-injected distracting elements
```

## Debugging Commands

Run these in DevTools Console while Focus Shield is active:

### View All Detected Elements
```javascript
distractingDetector.analyzePageElements()
// Shows top 10 detected elements with scores and categories
```

### Check a Specific Element's Score
```javascript
const element = document.querySelector('.some-class');
console.log('Score:', distractingDetector.scoreElement(element));
```

### Analyze Class/ID Similarity
```javascript
distractingDetector.analyzeClassOrId('advertisement-block')
// Returns score (higher = more likely to be distracting)
```

### Check Pattern Matching
```javascript
distractingDetector.matchesPattern('advertisement', 'ad')
// Returns true/false based on similarity
```

### Get Element Category
```javascript
const element = document.querySelector('.popup-modal');
distractingDetector.categorizeElement(element)
// Returns: "modals", "ads", "sidebars", etc.
```

## Adjusting Detection Sensitivity

If you want to tune the detection in `content.js`:

### More Aggressive (catches more, includes false positives)
```javascript
// Simple Mode
const distractingElements = distractingDetector.findDistractivElemts(0.35);

// Focus Mode  
const allDistracting = distractingDetector.findDistractivElemts(0.50);
```

### More Conservative (fewer false positives, might miss some)
```javascript
// Simple Mode
const distractingElements = distractingDetector.findDistractivElemts(0.55);

// Focus Mode
const allDistracting = distractingDetector.findDistractivElemts(0.70);
```

## Common Issues & Solutions

### "NLP isn't detecting anything"
- **Check**: Is the element's class/ID in the detection patterns?
- **Try**: Run `distractingDetector.analyzePageElements()` to see all detected
- **Debug**: Check scores - elements need score > threshold to be hidden

### "Too many false positives"
- Increase the threshold value in the mode function
- Check which elements are being incorrectly hidden
- Review distractingPatterns in the detector class

### "Extension not working on specific site"
- Open DevTools → Console
- Run: `distractingDetector.analyzePageElements()`
- Check if distracting elements are being detected
- If score is below threshold, increase sensitivity or add custom patterns

## Performance Testing

Check how fast detection is:

```javascript
console.time('NLP Detection');
distractingDetector.findDistractivElemts(0.45);
console.timeEnd('NLP Detection');
// Should show <100ms on average sites
```

## Adding Custom Patterns

To add custom detection patterns, modify the `distractingPatterns` in the DetectorClass:

```javascript
this.distractingPatterns = {
  // ... existing patterns ...
  ads: [..., 'your-custom-pattern'],
  // Or add a new category:
  customAds: ['special-ad-vendor-name']
}
```

## Testing on Different Websites

Try these websites to test NLP detection:

| Site | Good For Testing |
|------|-----------------|
| news.google.com | Ads, sidebars, recommendations |
| medium.com | Paywalls, recommendations, modals |
| reddit.com | Ads, sidebars, promoted posts |
| techcrunch.com | Ads, sticky headers, popups |
| dev.to | Ads, sidebars, notifications |
| amazon.com | Ads, promotions, widgets |
| twitter.com | Promoted tweets, ads, notifications |

## Expected Behavior

### Simple Mode Should Hide
- ✅ All ads and sponsored content
- ✅ Popups and modals
- ✅ Cookie banners
- ✅ Social share widgets
- ✅ Sidebars
- ✅ Tracking pixels (hidden anyway)

### Focus Mode Should Hide
- ✅ Ads
- ✅ Sponsored content
- ✅ Promotional banners
- ❌ Navigation elements
- ❌ Search bars
- ❌ Content sidebars (only distracting ones)

## Reporting Issues

If NLP isn't working well:

1. **Note the website URL**
2. **Note which elements weren't hidden**
3. **Run** `distractingDetector.analyzePageElements()`
4. **Check the score** - is it above threshold?
5. **Check the class/ID** - does it match any pattern?

## Performance Metrics

Typical performance on modern sites:
- Detection time: 50-150ms
- Memory usage: ~15KB
- DOM elements analyzed: 200-2000
- Elements hidden per page: 10-50

If experiencing slowness:
- Reduce number of elements analyzed
- Increase debounce timeout in MutationObserver
- Use Focus Mode instead of Simple Mode

