# Portfolio Testing Guide

This guide explains how to test all functionalities of Lawrence's portfolio website.

## 🚀 Quick Start

1. **Start the development server:**

   ```bash
   cd portfolio
   pnpm dev
   ```

2. **Open the website:**

   ```
   http://localhost:3000
   ```

3. **Run the automated tests:**
   ```bash
   node simple-test.js
   ```

## 📋 Test Scripts Overview

### 1. **Simple Node.js Test** (`simple-test.js`)

- **Purpose:** Automated file structure and configuration validation
- **What it tests:**

  - File structure completeness
  - Package.json dependencies
  - Configuration files
  - Public assets
  - Source code structure
  - API routes
  - Build process

- **How to run:**
  ```bash
  node simple-test.js
  ```

### 2. **Browser Test Suite** (`browser-test-suite.js`)

- **Purpose:** Interactive browser-based testing
- **What it tests:**

  - Page load and navigation
  - Chatbot functionality
  - Contact form validation
  - Link validation
  - Image loading
  - Responsive design
  - Accessibility

- **How to run:**
  1. Open browser console on `http://localhost:3000`
  2. Copy and paste the contents of `browser-test-suite.js`
  3. Press Enter to run

### 3. **Manual Test Checklist** (`manual-test-checklist.md`)

- **Purpose:** Comprehensive manual testing guide
- **What it tests:**

  - All user interactions
  - Edge cases
  - Different devices/browsers
  - User experience flows

- **How to use:**
  1. Open `manual-test-checklist.md`
  2. Follow the checklist systematically
  3. Mark items as complete
  4. Document any issues found

## 🤖 AI Functionality Testing

### Chatbot Testing

1. **Basic Functionality:**

   - Click chatbot button → modal opens
   - Type message → send → receive response
   - Test messages: "Hello", "What are Lawrence's skills?"

2. **Girlfriend Easter Egg:**

   - Ask: "Who is Lawrence's favorite person?"
   - Should ask for password
   - Try wrong password → get mentor response
   - Try correct password: "August 21, 2024"
   - Should activate love mode + show poem

3. **File Upload:**
   - Click paperclip → file picker opens
   - Select image file (< 5MB) → preview shows
   - Select large file (> 5MB) → error message
   - Send file with message → works properly

### Token Management

- **Issue Fixed:** The chatbot now handles large context files by truncating them to fit within OpenAI's token limits
- **How it works:**
  - Estimates tokens (1 token ≈ 4 characters)
  - Truncates system prompt if too long
  - Cuts at sentence boundaries when possible
  - Provides clear error messages for token limit issues

## 📧 Contact Form Testing

### Form Validation

- Try submit empty form → validation errors
- Try submit without email → validation error
- Try invalid email → validation error
- Fill all fields correctly → form submits

### Form Submission

- Submit valid form → success message
- Check email received (if configured)
- Form resets after submission

## 📅 Meeting Scheduling Testing

### Schedule Buttons

- Find "Schedule Meeting" or similar button
- Click → opens scheduling tool (Calendly, etc.)
- External link opens in new tab
- Scheduling interface loads properly

## 🔗 Link and Image Testing

### Internal Links

- Resume download link works
- All navigation links work
- Project links work

### External Links

- GitHub profile link
- LinkedIn profile link
- Email links (mailto:)
- All open in new tabs

### Images

- Lawrence's profile picture loads
- Company logos load
- Project images load
- No broken image placeholders
- Images scale properly on mobile

## 📊 Analytics Page Testing

### Password Protection

- Navigate to `/analytics`
- Should show password prompt
- Wrong password → access denied
- Correct password → access granted

### Analytics Functionality (if accessed)

- Dashboard loads
- Charts render properly
- Data displays correctly
- Export/download features work

## 📱 Mobile Experience Testing

### Responsive Design

- Test on mobile browser
- All elements fit screen
- Touch interactions work
- No horizontal scrolling

### Mobile-Specific Features

- Chatbot works on mobile
- Contact form usable on mobile
- Links work on mobile

## ♿ Accessibility Testing

### Keyboard Navigation

- Tab through all interactive elements
- Enter/Space activates buttons
- Focus indicators visible

### Screen Reader Compatibility

- Alt text on images
- Proper heading structure
- Form labels associated

## 🐛 Common Issues to Check

### Chatbot Issues

- "Failed to get response" errors
- Messages not sending
- No AI responses
- File upload not working

### Form Issues

- Form not submitting
- Validation not working
- No success/error messages
- Email not received

### Image Issues

- Broken image links
- Slow image loading
- Wrong image sizes
- Missing alt text

### Link Issues

- 404 errors on internal links
- External links not opening
- Wrong target attributes
- Broken social media links

## 🚨 Critical Issues (Fix Immediately)

- Page doesn't load
- Chatbot completely broken
- Contact form not working
- Major layout issues
- Security vulnerabilities

## 🔧 Minor Issues (Fix When Possible)

- Minor styling issues
- Slow loading times
- Accessibility improvements
- Performance optimizations

## 🎯 Testing Tips

1. **Test systematically** - Go through each section in order
2. **Test edge cases** - Try unusual inputs, large files, etc.
3. **Test on different devices** - Desktop, tablet, mobile
4. **Test with different browsers** - Chrome, Firefox, Safari
5. **Document everything** - Keep detailed notes of issues found
6. **Test user flows** - Complete full user journeys
7. **Check error handling** - What happens when things go wrong?

## 🔄 Regression Testing

After any changes, re-run these critical tests:

- Chatbot basic functionality
- Contact form submission
- Page load performance
- Mobile responsiveness
- No console errors

## 📝 Test Results

### Automated Test Results

The simple Node.js test should show:

```
✅ All critical tests passed!
Total tests run: 43
Errors: 0
Warnings: 0
```

### Browser Test Results

The browser test will save results to localStorage and show:

- Page load status
- Chatbot functionality
- Form validation
- Link/image status
- Responsive design issues
- Accessibility warnings

### Manual Test Results

Use the checklist to track:

- ✅ PASSED TESTS
- ❌ FAILED TESTS
- ⚠️ WARNINGS
- 🔧 ISSUES FOUND
- 📋 NOTES

## 🛠️ Troubleshooting

### If Tests Fail

1. **Check the development server:**

   ```bash
   pnpm dev
   ```

2. **Check for console errors:**

   - Open browser dev tools
   - Look at Console tab
   - Check Network tab for failed requests

3. **Check API endpoints:**

   - `/api/chatbot` - Chatbot functionality
   - `/api/contact` - Contact form
   - `/api/geolocation` - Location services

4. **Check environment variables:**
   - `OPENAI_API_KEY` - Required for chatbot
   - Other API keys as needed

### Common Fixes

1. **Chatbot not working:**

   - Check OpenAI API key
   - Check token limits
   - Check network connectivity

2. **Form not submitting:**

   - Check form validation
   - Check API endpoint
   - Check email configuration

3. **Images not loading:**

   - Check file paths
   - Check file permissions
   - Check image formats

4. **Links broken:**
   - Check URL paths
   - Check external site availability
   - Check target attributes

## 📞 Support

If you encounter issues:

1. Check the test results for specific errors
2. Review the troubleshooting section
3. Check the browser console for errors
4. Verify all dependencies are installed
5. Ensure the development server is running

---

_Last updated: December 2024_
_Version: 1.0_
