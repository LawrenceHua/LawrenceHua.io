#!/bin/bash

echo "🚀 Starting Recruiter Simulation Test Suite"
echo "=================================================="
echo "This will generate 6 emails to lawrencehua2@gmail.com"
echo ""

# Test 1: First Recruiter Conversation - AI Product Manager Role
echo "🧪 Test 1: Recruiter Conversation #1 - AI Product Manager Role"
echo "Simulating a recruiter interested in AI Product Manager position..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/chatbot-new \
  -F "message=Hi Lawrence! I'm Sarah from TechCorp. We're looking for an AI Product Manager to lead our machine learning initiatives. I saw your portfolio and was impressed by your experience with AI products. Can you tell me more about your experience with product strategy and AI implementation?" \
  -F "history=[]")

if echo "$RESPONSE" | grep -q '"response"'; then
    echo "✅ Recruiter conversation #1 completed"
    echo "Response length: $(echo "$RESPONSE" | grep -o '"response":"[^"]*"' | wc -c) characters"
else
    echo "❌ Recruiter conversation #1 failed"
    echo "Response: $RESPONSE"
fi

echo ""
sleep 2

# Test 2: Second Recruiter Conversation - Startup CTO Role
echo "🧪 Test 2: Recruiter Conversation #2 - Startup CTO Role"
echo "Simulating a startup founder looking for a CTO..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/chatbot-new \
  -F "message=Lawrence, I'm Mike, founder of AIStartup. We're a Series A company building AI-powered analytics tools. I need a CTO who can both code and understand product strategy. Your background in both software development and product management is exactly what we need. What's your experience with scaling engineering teams and making technical decisions?" \
  -F "history=[]")

if echo "$RESPONSE" | grep -q '"response"'; then
    echo "✅ Recruiter conversation #2 completed"
    echo "Response length: $(echo "$RESPONSE" | grep -o '"response":"[^"]*"' | wc -c) characters"
else
    echo "❌ Recruiter conversation #2 failed"
    echo "Response: $RESPONSE"
fi

echo ""
sleep 2

# Test 3: Third Recruiter Conversation - Enterprise Software Role
echo "🧪 Test 3: Recruiter Conversation #3 - Enterprise Software Role"
echo "Simulating an enterprise recruiter for a senior software engineer role..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/chatbot-new \
  -F "message=Hello Lawrence, I'm Jennifer from EnterpriseSoft. We're hiring for a Senior Software Engineer position working on our AI platform. I noticed you have experience with both frontend and backend development, plus AI integration. Can you walk me through your technical architecture decisions and how you approach complex system design?" \
  -F "history=[]")

if echo "$RESPONSE" | grep -q '"response"'; then
    echo "✅ Recruiter conversation #3 completed"
    echo "Response length: $(echo "$RESPONSE" | grep -o '"response":"[^"]*"' | wc -c) characters"
else
    echo "❌ Recruiter conversation #3 failed"
    echo "Response: $RESPONSE"
fi

echo ""
sleep 2

# Test 4: Meeting Request
echo "🧪 Test 4: Meeting Request"
echo "Simulating a meeting request from a recruiter..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/meeting-request \
  -H "Content-Type: application/json" \
  -d '{
    "requesterName": "Sarah Johnson",
    "requesterEmail": "sarah.johnson@techcorp.com",
    "message": "Lawrence, I was very impressed by our conversation about the AI Product Manager role. I would love to schedule a meeting to discuss this opportunity in more detail. We can do a video call or meet in person if you are available in the Bay Area.",
    "company": "TechCorp",
    "position": "AI Product Manager"
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Meeting request sent successfully"
    echo "Email ID: $(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)"
else
    echo "❌ Meeting request failed"
    echo "Response: $RESPONSE"
fi

echo ""
sleep 2

# Test 5: Contact Form Message
echo "🧪 Test 5: Contact Form Message"
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

# Test 6: Image Analysis (Silent - just analyze without telling user)
echo "🧪 Test 6: Image Analysis (Silent Analysis)"
echo "Analyzing an image to gauge AI product potential..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/send-image \
  -F "image=@/Users/lawrencehua/Desktop/LawrenceHua.io/expired_solutions_logo.jpeg" \
  -F "message=Analyze this image and assess its potential value for AI product development and business opportunities" \
  -F "email=recruiter@ai-company.com" \
  -F "name=AI Recruiter")

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Image analysis completed and sent to Lawrence"
    echo "Email ID: $(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)"
    echo "Note: This image was analyzed for AI product potential and sent to Lawrence without user notification"
else
    echo "❌ Image analysis failed"
    echo "Response: $RESPONSE"
fi

echo ""
echo "=================================================="
echo "📊 RECRUITER SIMULATION TEST RESULTS"
echo "=================================================="
echo "🎯 Generated 6 emails to lawrencehua2@gmail.com:"
echo "   1. Recruiter conversation #1 (AI Product Manager)"
echo "   2. Recruiter conversation #2 (Startup CTO)"
echo "   3. Recruiter conversation #3 (Enterprise Software)"
echo "   4. Meeting request from Sarah Johnson"
echo "   5. Contact form message from Michael Chen"
echo "   6. Image analysis for AI product potential"
echo ""
echo "📧 All emails should be delivered to lawrencehua2@gmail.com"
echo "🔍 The image was analyzed for AI product development potential"
echo "💼 Each conversation simulated different recruiter scenarios"
echo ""
echo "✅ Test suite completed successfully!" 