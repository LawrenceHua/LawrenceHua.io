#!/bin/bash

echo "🚀 Starting Email Test Suite (curl-based)"
echo "=================================================="

# Test 1: Direct Image Email
echo ""
echo "🧪 Testing Direct Image Email"
RESPONSE=$(curl -s -X POST http://localhost:3001/api/send-image \
  -F "image=@/Users/lawrencehua/Desktop/LawrenceHua.io/expired_solutions_logo.jpeg" \
  -F "message=Test image email from curl test script" \
  -F "email=test@example.com" \
  -F "name=Test User")

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Direct image email test passed"
    echo "Email ID: $(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)"
    IMAGE_SUCCESS=true
else
    echo "❌ Direct image email test failed"
    echo "Response: $RESPONSE"
    IMAGE_SUCCESS=false
fi

# Test 2: Meeting Request Email
echo ""
echo "🧪 Testing Meeting Request Email"
RESPONSE=$(curl -s -X POST http://localhost:3001/api/meeting-request \
  -H "Content-Type: application/json" \
  -d '{
    "requesterName": "Test User",
    "requesterEmail": "test@example.com",
    "message": "This is a test meeting request from curl test script",
    "company": "Test Company",
    "position": "Software Engineer"
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Meeting request test passed"
    echo "Email ID: $(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)"
    MEETING_SUCCESS=true
else
    echo "❌ Meeting request test failed"
    echo "Response: $RESPONSE"
    MEETING_SUCCESS=false
fi

# Test 3: Contact Form Email
echo ""
echo "🧪 Testing Contact Form Email"
RESPONSE=$(curl -s -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Contact Form from Curl Test Script",
    "message": "This is a test message from the contact form curl test script"
  }')

if echo "$RESPONSE" | grep -q '"message":"Email sent successfully"'; then
    echo "✅ Contact form test passed"
    echo "Email ID: $(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)"
    CONTACT_SUCCESS=true
else
    echo "❌ Contact form test failed"
    echo "Response: $RESPONSE"
    CONTACT_SUCCESS=false
fi

# Summary
echo ""
echo "=================================================="
echo "📊 EMAIL TEST RESULTS SUMMARY"
echo "=================================================="

PASSED=0
TOTAL=3

if [ "$IMAGE_SUCCESS" = true ]; then
    PASSED=$((PASSED + 1))
fi

if [ "$MEETING_SUCCESS" = true ]; then
    PASSED=$((PASSED + 1))
fi

if [ "$CONTACT_SUCCESS" = true ]; then
    PASSED=$((PASSED + 1))
fi

FAILED=$((TOTAL - PASSED))
SUCCESS_RATE=$(echo "scale=1; $PASSED * 100 / $TOTAL" | bc)

echo "✅ Passed: $PASSED/$TOTAL"
echo "❌ Failed: $FAILED/$TOTAL"
echo "📈 Success Rate: ${SUCCESS_RATE}%"

if [ $PASSED -eq $TOTAL ]; then
    echo ""
    echo "🎉 ALL EMAIL TESTS PASSED!"
    echo "📧 You should receive 3 emails at lawrencehua2@gmail.com:"
    echo "   - One with the image attachment"
    echo "   - One with the meeting request"
    echo "   - One with the contact form message"
else
    echo ""
    echo "⚠️  Some email tests failed. Please check the logs above."
fi 