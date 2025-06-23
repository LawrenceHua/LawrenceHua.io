#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
TEST_EMAIL="lhua@andrew.cmu.edu"
TEST_NAME="Lawrence Test User"

echo -e "${BLUE}🚀 Starting Focused Email API Tests${NC}"
echo -e "${YELLOW}📧 Lawrence's Email: EMAIL_NAME (lawrencehua2@gmail.com)${NC}"
echo -e "${YELLOW}📧 Test User Email: ${TEST_EMAIL}${NC}"
echo "============================================================"

# Test 1: Contact API (Message) - This will send 2 emails total
echo -e "\n${BLUE}🔍 Test 1: Contact API (Message)...${NC}"
response1=$(curl -s -o response1.json -w "%{http_code}" -X POST "$BASE_URL/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "'$TEST_NAME'",
    "email": "'$TEST_EMAIL'",
    "subject": "Test Message from '$TEST_NAME'",
    "message": "This is a test message to verify the contact API works properly with user confirmation emails. Should send 1 email to Lawrence and 1 confirmation to user."
  }')

status_code1="$response1"
response_body1=$(cat response1.json 2>/dev/null || echo "No response")

if [ "$status_code1" = "200" ]; then
  echo -e "${GREEN}✅ Contact Message API Success (HTTP $status_code1)${NC}"
  echo -e "${GREEN}   📧 Expected: 1 email to Lawrence + 1 confirmation to user${NC}"
  userEmailSent1=$(echo "$response_body1" | grep -o '"userEmailSent":[^,}]*' | cut -d':' -f2 | tr -d ' ')
  echo -e "${GREEN}   📧 User Email Sent: $userEmailSent1${NC}"
else
  echo -e "${RED}❌ Contact Message API Failed (HTTP $status_code1)${NC}"
  echo -e "${RED}   Response: $response_body1${NC}"
fi

# Test 2: Meeting Request API - This will send 2 emails total  
echo -e "\n${BLUE}🔍 Test 2: Meeting Request API...${NC}"
response2=$(curl -s -o response2.json -w "%{http_code}" -X POST "$BASE_URL/api/meeting-request" \
  -H "Content-Type: application/json" \
  -d '{
    "requesterName": "'$TEST_NAME'",
    "requesterEmail": "'$TEST_EMAIL'",
    "company": "CMU Test Company", 
    "position": "Test Position",
    "message": "This is a test meeting request to verify the API works properly with user confirmation emails. I would like to schedule a 30-minute meeting to discuss opportunities.",
    "conversationContext": "Test conversation context from chatbot interaction"
  }')

status_code2="$response2"
response_body2=$(cat response2.json 2>/dev/null || echo "No response")

if [ "$status_code2" = "200" ]; then
  echo -e "${GREEN}✅ Meeting Request API Success (HTTP $status_code2)${NC}"
  echo -e "${GREEN}   📧 Expected: 1 email to Lawrence + 1 confirmation to user${NC}"
  userEmailSent2=$(echo "$response_body2" | grep -o '"userEmailSent":[^,}]*' | cut -d':' -f2 | tr -d ' ')
  echo -e "${GREEN}   📧 User Email Sent: $userEmailSent2${NC}"
else
  echo -e "${RED}❌ Meeting Request API Failed (HTTP $status_code2)${NC}"
  echo -e "${RED}   Response: $response_body2${NC}"
fi

# Test 3: Send Image API - This will send 2 emails total
echo -e "\n${BLUE}🔍 Test 3: Send Image API...${NC}"

# Create a small test image file
echo "Creating test image..."
echo -e "\x89\x50\x4e\x47\x0d\x0a\x1a\x0a\x00\x00\x00\x0d\x49\x48\x44\x52\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\x0a\x49\x44\x41\x54\x78\x9c\x63\x00\x01\x00\x00\x05\x00\x01\x0d\x0a\x2d\xb4\x00\x00\x00\x00\x49\x45\x4e\x44\xae\x42\x60\x82" > test-image.png

response3=$(curl -s -o response3.json -w "%{http_code}" -X POST "$BASE_URL/api/send-image" \
  -F "image=@test-image.png" \
  -F "message=This is a test image upload to verify the send-image API works properly with user confirmation emails." \
  -F "email=$TEST_EMAIL" \
  -F "name=$TEST_NAME")

status_code3="$response3"
response_body3=$(cat response3.json 2>/dev/null || echo "No response")

if [ "$status_code3" = "200" ]; then
  echo -e "${GREEN}✅ Send Image API Success (HTTP $status_code3)${NC}"
  echo -e "${GREEN}   📧 Expected: 1 email to Lawrence + 1 confirmation to user${NC}"
  userEmailSent3=$(echo "$response_body3" | grep -o '"userEmailSent":[^,}]*' | cut -d':' -f2 | tr -d ' ')
  echo -e "${GREEN}   📧 User Email Sent: $userEmailSent3${NC}"
else
  echo -e "${RED}❌ Send Image API Failed (HTTP $status_code3)${NC}"
  echo -e "${RED}   Response: $response_body3${NC}"
fi

# Clean up test files
rm -f test-image.png response1.json response2.json response3.json

# Summary
echo -e "\n============================================================"
echo -e "${BLUE}📊 TEST SUMMARY${NC}"
echo -e "============================================================"

passed=0
[ "$status_code1" = "200" ] && ((passed++))
[ "$status_code2" = "200" ] && ((passed++))
[ "$status_code3" = "200" ] && ((passed++))

if [ $passed -eq 3 ]; then
  echo -e "${GREEN}🎉 ALL TESTS PASSED! (3/3)${NC}"
  echo -e "\n${YELLOW}📧 Email Results Summary:${NC}"
  echo -e "${YELLOW}   Lawrence (lawrencehua2@gmail.com): 3 emails total${NC}"
  echo -e "${YELLOW}     - 1 Contact message${NC}"
  echo -e "${YELLOW}     - 1 Meeting request${NC}" 
  echo -e "${YELLOW}     - 1 Image upload${NC}"
  echo -e "\n${YELLOW}   User ($TEST_EMAIL): 3 confirmation emails total${NC}"
  echo -e "${YELLOW}     - 1 Message confirmation${NC}"
  echo -e "${YELLOW}     - 1 Meeting confirmation${NC}"
  echo -e "${YELLOW}     - 1 Image confirmation${NC}"
else
  echo -e "${RED}⚠️  SOME TESTS FAILED ($passed/3)${NC}"
fi

echo -e "\n${BLUE}💡 Next Steps:${NC}"
echo -e "${BLUE}   1. Check Lawrence's email (lawrencehua2@gmail.com) for 3 emails${NC}"
echo -e "${BLUE}   2. Check test user email ($TEST_EMAIL) for 3 confirmation emails${NC}"
echo -e "${BLUE}   3. Verify '24-48 hours' and EMAIL_NAME branding in confirmations${NC}"
echo -e "${BLUE}   4. Confirm 'What Happens Next' section formatting${NC}" 