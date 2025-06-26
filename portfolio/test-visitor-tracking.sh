#!/bin/bash

# Test configuration
BASE_URL="http://localhost:3001"
TEST_SESSION_ID="visitor-test-$(date +%s)"

echo "🌍 Testing Visitor Location Tracking..."
echo "📍 Testing against: $BASE_URL"
echo "🆔 Test Session ID: $TEST_SESSION_ID"

echo ""
echo "🔄 Testing Visitor Location API..."

# Test visitor location tracking
echo "Testing visitor location tracking..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/track-visitor-location" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "'$TEST_SESSION_ID'",
    "userAgent": "Test Browser for Visitor Tracking",
    "referrer": "https://google.com",
    "pathname": "/test-page"
  }')

HTTP_CODE="${RESPONSE: -3}"
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Visitor location tracking successful"
  echo "📊 Response: ${RESPONSE%???}"
else
  echo "❌ Visitor location tracking failed (HTTP: $HTTP_CODE)"
  echo "📄 Response: ${RESPONSE%???}"
fi

echo ""
echo "✨ Visitor tracking test complete!"
echo "💡 Look for messages like:"
echo "   - \"🌍 Visitor location tracked: Minneapolis, United States\""
