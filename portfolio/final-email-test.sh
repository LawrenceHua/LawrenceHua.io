#!/bin/bash

echo "🚀 Starting Final Email Test Suite"
echo "=================================================="
echo "This will generate 5 emails to lawrencehua2@gmail.com"
echo ""

# Test 1: First Chatbot Conversation - AI Product Manager Role
echo "🧪 Test 1: Chatbot Conversation #1 - AI Product Manager Role"
echo "Simulating a recruiter conversation that should trigger email..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/chatbot-new \
  -F "message=Hi Lawrence! I'm Sarah from TechCorp. We're looking for an AI Product Manager to lead our machine learning initiatives. I saw your portfolio and was impressed by your experience with AI products. Can you tell me more about your experience with product strategy and AI implementation?" \
  -F "history=[]")

if echo "$RESPONSE" | grep -q '"response"'; then
    echo "✅ Chatbot conversation #1 completed"
    echo "Response length: $(echo "$RESPONSE" | grep -o '"response":"[^"]*"' | wc -c) characters"
else
    echo "❌ Chatbot conversation #1 failed"
    echo "Response: $RESPONSE"
fi

echo ""
sleep 2

# Test 2: Second Chatbot Conversation - Startup CTO Role
echo "🧪 Test 2: Chatbot Conversation #2 - Startup CTO Role"
echo "Simulating a startup founder conversation..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/chatbot-new \
  -F "message=Lawrence, I'm Mike, founder of AIStartup. We're a Series A company building AI-powered analytics tools. I need a CTO who can both code and understand product strategy. Your background in both software development and product management is exactly what we need. What's your experience with scaling engineering teams and making technical decisions?" \
  -F "history=[]")

if echo "$RESPONSE" | grep -q '"response"'; then
    echo "✅ Chatbot conversation #2 completed"
    echo "Response length: $(echo "$RESPONSE" | grep -o '"response":"[^"]*"' | wc -c) characters"
else
    echo "❌ Chatbot conversation #2 failed"
    echo "Response: $RESPONSE"
fi

echo ""
sleep 2

# Test 3: Third Chatbot Conversation - Enterprise Software Role
echo "🧪 Test 3: Chatbot Conversation #3 - Enterprise Software Role"
echo "Simulating an enterprise recruiter conversation..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/chatbot-new \
  -F "message=Hello Lawrence, I'm Jennifer from EnterpriseSoft. We're hiring for a Senior Software Engineer position working on our AI platform. I noticed you have experience with both frontend and backend development, plus AI integration. Can you walk me through your technical architecture decisions and how you approach complex system design?" \
  -F "history=[]")

if echo "$RESPONSE" | grep -q '"response"'; then
    echo "✅ Chatbot conversation #3 completed"
    echo "Response length: $(echo "$RESPONSE" | grep -o '"response":"[^"]*"' | wc -c) characters"
else
    echo "❌ Chatbot conversation #3 failed"
    echo "Response: $RESPONSE"
fi

echo ""
sleep 2

# Test 4: Meeting Request via Chatbot
echo "🧪 Test 4: Meeting Request via Chatbot"
echo "Simulating a meeting request through the chatbot..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/chatbot-new \
  -F "message=I would like to schedule a meeting with Lawrence. My name is Sarah Johnson and my email is sarah.johnson@techcorp.com. I am interested in discussing the AI Product Manager position at TechCorp. We can do a video call or meet in person if you are available in the Bay Area." \
  -F "history=[]")

if echo "$RESPONSE" | grep -q '"response"'; then
    echo "✅ Meeting request via chatbot completed"
    echo "Response length: $(echo "$RESPONSE" | grep -o '"response":"[^"]*"' | wc -c) characters"
else
    echo "❌ Meeting request via chatbot failed"
    echo "Response: $RESPONSE"
fi

echo ""
sleep 2

# Test 5: Image Upload via Chatbot
echo "🧪 Test 5: Image Upload via Chatbot"
echo "Simulating an image upload through the chatbot..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/chatbot-new \
  -F "message=Can you analyze this image for me?" \
  -F "history=[]" \
  -F "files=@/Users/lawrencehua/Desktop/LawrenceHua.io/expired_solutions_logo.jpeg")

if echo "$RESPONSE" | grep -q '"response"'; then
    echo "✅ Image upload via chatbot completed"
    echo "Response length: $(echo "$RESPONSE" | grep -o '"response":"[^"]*"' | wc -c) characters"
else
    echo "❌ Image upload via chatbot failed"
    echo "Response: $RESPONSE"
fi

echo ""
sleep 2

# Test 6: Contact Form Message
echo "🧪 Test 6: Contact Form Message"
echo "Simulating a contact form submission..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Michael Chen",
    "email": "michael.chen@startup.ai",
    "subject": "Senior Software Engineer Position",
    "message": "Hi Lawrence, I came across your portfolio and was impressed by your work. We are looking for a senior software engineer with AI experience to join our team. Your background in both product management and software development is exactly what we need. Would you be interested in learning more about this opportunity?"
  }')

if echo "$RESPONSE" | grep -q '"message":"Email sent successfully"'; then
    echo "✅ Contact form message sent successfully"
    echo "Email ID: $(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)"
else
    echo "❌ Contact form message failed"
    echo "Response: $RESPONSE"
fi

echo ""
sleep 2

# Test 7: Meeting Request via Contact Form
echo "🧪 Test 7: Meeting Request via Contact Form"
echo "Simulating a meeting request through the contact form..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "David Rodriguez",
    "email": "david.rodriguez@enterprise.com",
    "subject": "Meeting Request - CTO Position",
    "message": "Lawrence, I am the VP of Engineering at EnterpriseSoft. I would like to schedule a meeting to discuss the CTO position we have available. Your experience with AI and product management is exactly what we are looking for. Can we schedule a call next week?",
    "meeting": true
  }')

if echo "$RESPONSE" | grep -q '"message":"Email sent successfully"'; then
    echo "✅ Meeting request via contact form sent successfully"
    echo "Email ID: $(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)"
else
    echo "❌ Meeting request via contact form failed"
    echo "Response: $RESPONSE"
fi

echo ""
echo "=================================================="
echo "📊 FINAL EMAIL TEST RESULTS"
echo "=================================================="
echo "🎯 Generated emails to lawrencehua2@gmail.com:"
echo "   1. Chatbot conversation #1 (AI Product Manager)"
echo "   2. Chatbot conversation #2 (Startup CTO)"
echo "   3. Chatbot conversation #3 (Enterprise Software)"
echo "   4. Meeting request via chatbot (Sarah Johnson)"
echo "   5. Image upload via chatbot (Expired Solutions logo)"
echo "   6. Contact form message (Michael Chen)"
echo "   7. Meeting request via contact form (David Rodriguez)"
echo ""
echo "📧 Expected emails:"
echo "   - 3 chatbot conversation emails (if chatbot sends emails)"
echo "   - 1 meeting request email from chatbot"
echo "   - 1 image analysis email from chatbot"
echo "   - 1 contact form email"
echo "   - 1 meeting request email from contact form"
echo ""
echo "✅ Test suite completed!" 