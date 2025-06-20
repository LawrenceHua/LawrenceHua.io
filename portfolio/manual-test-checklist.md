# Portfolio Manual Test Checklist

## 🚀 Quick Start

1. Start the development server: `pnpm dev`
2. Open http://localhost:3000
3. Follow this checklist systematically

---

## 📋 Test Categories

### 1. **Page Load & Navigation** ✅

- [ ] **Homepage loads without errors**

  - [ ] No console errors in browser dev tools
  - [ ] All sections visible (Hero, About, Experience, etc.)
  - [ ] Responsive design works on mobile/tablet/desktop

- [ ] **Navigation works**
  - [ ] All internal links work (About, Experience, Projects, etc.)
  - [ ] External links open in new tabs (GitHub, LinkedIn, etc.)
  - [ ] Back button works properly

### 2. **AI Chatbot Functionality** 🤖

- [ ] **Chatbot opens/closes**

  - [ ] Click chatbot button → opens modal
  - [ ] Click close button → closes modal
  - [ ] Click outside modal → closes modal (desktop only)

- [ ] **Basic messaging works**

  - [ ] Type message → send → receive response
  - [ ] Test messages:
    - [ ] "Hello"
    - [ ] "What are Lawrence's skills?"
    - [ ] "Tell me about Lawrence's experience"
    - [ ] "What projects has Lawrence worked on?"

- [ ] **Girlfriend Easter Egg** 💕

  - [ ] Ask: "Who is Lawrence's favorite person?"
  - [ ] Should ask for password
  - [ ] Try wrong password → get mentor response
  - [ ] Try correct password: "August 21, 2024"
  - [ ] Should activate love mode + show poem
  - [ ] "Stop the cringe" button works

- [ ] **File upload functionality**
  - [ ] Click paperclip → file picker opens
  - [ ] Select image file (< 5MB) → preview shows
  - [ ] Select large file (> 5MB) → error message
  - [ ] Send file with message → works properly

### 3. **Contact Form** 📧

- [ ] **Form validation**

  - [ ] Try submit empty form → validation errors
  - [ ] Try submit without email → validation error
  - [ ] Try invalid email → validation error
  - [ ] Fill all fields correctly → form submits

- [ ] **Form submission**
  - [ ] Submit valid form → success message
  - [ ] Check email received (if configured)
  - [ ] Form resets after submission

### 4. **Meeting Scheduling** 📅

- [ ] **Schedule buttons work**
  - [ ] Find "Schedule Meeting" or similar button
  - [ ] Click → opens scheduling tool (Calendly, etc.)
  - [ ] External link opens in new tab
  - [ ] Scheduling interface loads properly

### 5. **Links & External Resources** 🔗

- [ ] **Internal links**

  - [ ] Resume download link works
  - [ ] All navigation links work
  - [ ] Project links work

- [ ] **External links**
  - [ ] GitHub profile link
  - [ ] LinkedIn profile link
  - [ ] Email links (mailto:)
  - [ ] All open in new tabs

### 6. **Images & Media** 🖼️

- [ ] **Profile images**

  - [ ] Lawrence's profile picture loads
  - [ ] Company logos load
  - [ ] Project images load
  - [ ] No broken image placeholders

- [ ] **Responsive images**
  - [ ] Images scale properly on mobile
  - [ ] No horizontal scrolling issues
  - [ ] Images maintain aspect ratio

### 7. **Analytics Page** 📊

- [ ] **Password protection**

  - [ ] Navigate to /analytics
  - [ ] Should show password prompt
  - [ ] Wrong password → access denied
  - [ ] Correct password → access granted

- [ ] **Analytics functionality** (if accessed)
  - [ ] Dashboard loads
  - [ ] Charts render properly
  - [ ] Data displays correctly
  - [ ] Export/download features work

### 8. **Performance & Errors** ⚡

- [ ] **Console errors**

  - [ ] Open browser dev tools
  - [ ] Check Console tab for errors
  - [ ] Check Network tab for failed requests
  - [ ] No 404 or 500 errors

- [ ] **Loading performance**
  - [ ] Page loads within 3 seconds
  - [ ] Images load progressively
  - [ ] No long loading spinners

### 9. **Mobile Experience** 📱

- [ ] **Responsive design**

  - [ ] Test on mobile browser
  - [ ] All elements fit screen
  - [ ] Touch interactions work
  - [ ] No horizontal scrolling

- [ ] **Mobile-specific features**
  - [ ] Chatbot works on mobile
  - [ ] Contact form usable on mobile
  - [ ] Links work on mobile

### 10. **Accessibility** ♿

- [ ] **Keyboard navigation**

  - [ ] Tab through all interactive elements
  - [ ] Enter/Space activates buttons
  - [ ] Focus indicators visible

- [ ] **Screen reader compatibility**
  - [ ] Alt text on images
  - [ ] Proper heading structure
  - [ ] Form labels associated

---

## 🐛 Common Issues to Check

### **Chatbot Issues**

- [ ] "Failed to get response" errors
- [ ] Messages not sending
- [ ] No AI responses
- [ ] File upload not working

### **Form Issues**

- [ ] Form not submitting
- [ ] Validation not working
- [ ] No success/error messages
- [ ] Email not received

### **Image Issues**

- [ ] Broken image links
- [ ] Slow image loading
- [ ] Wrong image sizes
- [ ] Missing alt text

### **Link Issues**

- [ ] 404 errors on internal links
- [ ] External links not opening
- [ ] Wrong target attributes
- [ ] Broken social media links

---

## 📝 Test Results Template

```
Test Date: _______________
Tester: _________________
Browser: ________________
Device: _________________

✅ PASSED TESTS:
-

❌ FAILED TESTS:
-

⚠️ WARNINGS:
-

🔧 ISSUES FOUND:
-

📋 NOTES:
-
```

---

## 🚨 Critical Issues (Fix Immediately)

- [ ] Page doesn't load
- [ ] Chatbot completely broken
- [ ] Contact form not working
- [ ] Major layout issues
- [ ] Security vulnerabilities

## 🔧 Minor Issues (Fix When Possible)

- [ ] Minor styling issues
- [ ] Slow loading times
- [ ] Accessibility improvements
- [ ] Performance optimizations

---

## 🎯 Testing Tips

1. **Test systematically** - Go through each section in order
2. **Test edge cases** - Try unusual inputs, large files, etc.
3. **Test on different devices** - Desktop, tablet, mobile
4. **Test with different browsers** - Chrome, Firefox, Safari
5. **Document everything** - Keep detailed notes of issues found
6. **Test user flows** - Complete full user journeys
7. **Check error handling** - What happens when things go wrong?

---

## 🔄 Regression Testing

After any changes, re-run these critical tests:

- [ ] Chatbot basic functionality
- [ ] Contact form submission
- [ ] Page load performance
- [ ] Mobile responsiveness
- [ ] No console errors

---

_Last updated: December 2024_
_Version: 1.0_
