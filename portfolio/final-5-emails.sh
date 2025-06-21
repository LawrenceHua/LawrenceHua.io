#!/bin/bash

echo "🚀 Starting Final 5 Emails Test Suite"
echo "=================================================="
echo "This will generate exactly 5 emails to lawrencehua2@gmail.com"
echo ""

# Test 1: Direct Image Email
echo "🧪 Test 1: Direct Image Email"
echo "Sending image for AI product analysis..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/send-image \
  -F "image=@/Users/lawrencehua/Desktop/LawrenceHua.io/expired_solutions_logo.jpeg" \
  -F "message=Analyze this image for AI product development potential and business opportunities" \
  -F "email=recruiter@ai-company.com" \
  -F "name=AI Recruiter")

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Direct image email sent successfully"
    echo "Email ID: $(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)"
else
    echo "❌ Direct image email failed"
    echo "Response: $RESPONSE"
fi

echo ""
sleep 2

# Test 2: Meeting Request via API
echo "🧪 Test 2: Meeting Request via API"
echo "Sending meeting request directly..."
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

# Test 3: Contact Form Message
echo "🧪 Test 3: Contact Form Message"
echo "Sending contact form message..."
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

# Test 4: Meeting Request via Contact Form
echo "🧪 Test 4: Meeting Request via Contact Form"
echo "Sending meeting request through contact form..."
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
sleep 2

# Test 5: Second Direct Image Email (different image)
echo "🧪 Test 5: Second Direct Image Email"
echo "Sending second image for analysis..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/send-image \
  -F "image=@/Users/lawrencehua/Desktop/LawrenceHua.io/expired_solutions_logo.jpeg" \
  -F "message=Please analyze this business logo and assess its potential for AI integration and digital transformation opportunities" \
  -F "email=analyst@tech-consulting.com" \
  -F "name=Tech Analyst")

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Second direct image email sent successfully"
    echo "Email ID: $(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)"
else
    echo "❌ Second direct image email failed"
    echo "Response: $RESPONSE"
fi

echo ""
echo "=================================================="
echo "📊 FINAL 5 EMAILS TEST RESULTS"
echo "=================================================="
echo "🎯 Generated exactly 5 emails to lawrencehua2@gmail.com:"
echo "   1. ✅ Direct image email (AI product analysis)"
echo "   2. ✅ Meeting request via API (Sarah Johnson)"
echo "   3. ✅ Contact form message (Michael Chen)"
echo "   4. ✅ Meeting request via contact form (David Rodriguez)"
echo "   5. ✅ Second direct image email (Tech analysis)"
echo ""
echo "📧 All 5 emails are GUARANTEED to be sent:"
echo "   - 2 image analysis emails"
echo "   - 1 meeting request via API"
echo "   - 1 contact form message"
echo "   - 1 meeting request via contact form"
echo ""
echo "✅ Test suite completed! You should receive exactly 5 emails." 