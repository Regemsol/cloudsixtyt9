# Focus Shield - Browser Extension

A calmer web for neurodiverse users (ADHD, autism, anxiety, etc.)

## 🚀 How to Load Your Extension (First Time)

1. Open Chrome and go to: `chrome://extensions/`
2. Turn ON "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `focus-shield` folder
5. Your extension is now installed! 🎉

## 📝 How to Test It

1. Go to any busy website (try news sites, blogs, etc.)
2. Click the Focus Shield icon in your toolbar
3. Try the different modes:
   - **Simplify Mode**: Removes ads, popups, sidebars
   - **Focus Mode**: Shows only the main content
   - **Normal Mode**: Back to regular view

## 🐛 Quick Debugging Tips

**Extension not showing up?**
- Make sure all files are in the same folder
- Check chrome://extensions/ for error messages
- Try clicking "Reload" on your extension

**Buttons not working?**
- Open DevTools (F12) and check the Console tab
- Look for errors in red
- Make sure you clicked "Reload" on chrome://extensions/ after making changes

**Not hiding elements you want hidden?**
- Open DevTools, right-click the annoying element
- Click "Inspect" to see its class or id
- Add that selector to the `distractingSelectors` array in content.js

## 📁 File Structure Explained

- `manifest.json` - Tells Chrome what your extension does
- `content.js` - Runs on every webpage, does the hiding
- `styles.css` - Makes hidden things actually disappear
- `popup.html` - The UI when you click the icon
- `popup.js` - Makes the buttons work

## ⚠️ Known Issues (Normal for MVP!)

- Icons are missing (you'll see a default gray icon)
- Some websites might break in Focus Mode
- You need to click buttons each time you load a page
- Doesn't remember your preference yet

## 🔧 Quick Fixes for Tomorrow

When you're ready to improve it:
1. Add actual icons (search "free icon generator" online)
2. Save user preferences (use chrome.storage API)
3. Add more selectors for common ad networks
4. Make Focus Mode smarter at finding main content
5. Add keyboard shortcuts

## 💡 Demo Tips for Hackathon

1. Test on 3-4 different websites beforehand
2. Show before/after comparisons
3. Explain WHY neurodiverse users need this
4. Have backup screenshots in case wifi fails
5. Emphasize the problem > your solution > impact

Good luck! 🍀
