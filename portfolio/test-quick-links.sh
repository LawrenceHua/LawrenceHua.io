#!/bin/bash

# Chatbot Quick Links Performance Test
echo "🚀 Testing All Chatbot Quick Links"
echo "=================================="

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/chatbot"
EMAIL="lhua@andrew.cmu.edu"
NETFLIX_IMAGE="/Users/lawrencehua/Downloads/LawrenceHua.io/portfolio/public/logos/netflix.png"

# Test function with timing
test_link() {
    local test_name="$1"
    local test_input="$2"
    local expected_type="$3"
    
    echo ""
    echo "📝 Testing: $test_name"
    echo "Input: \"$test_input\""
    
    # Measure response time
    start_time=$(date +%s%3N)
    
    # Make the API call
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -F "message=$test_input" \
        -F "history=[]" \
        "$API_URL")
    
    end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))
    
    # Extract HTTP status and response body
    http_status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    response_body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')
    
    echo "⏱️  Response Time: ${response_time}ms"
    echo "📊 HTTP Status: $http_status"
    
    if [ "$http_status" = "200" ]; then
        # Check for buttons
        button_count=$(echo "$response_body" | grep -o '<button-[^>]*>' | wc -l)
        echo "🔘 Buttons Found: $button_count"
        
        # Check for instant responses
        if echo "$response_body" | grep -q '"instant":true'; then
            echo "⚡ INSTANT RESPONSE (0ms processing)"
        fi
        
        if echo "$response_body" | grep -q '"cached":true'; then
            echo "💾 CACHED RESPONSE"
        fi
        
        # Extract response length
        response_length=$(echo "$response_body" | jq -r '.response' 2>/dev/null | wc -c)
        echo "📏 Response Length: $response_length chars"
        
        # Show preview
        preview=$(echo "$response_body" | jq -r '.response' 2>/dev/null | head -c 200)
        echo "📖 Preview: \"$preview...\""
        
        echo "✅ PASSED"
    else
        echo "❌ FAILED - HTTP $http_status"
        echo "Error: $response_body"
    fi
    
    return 0
}

# Test file upload function
test_file_upload() {
    local test_name="$1"
    local file_path="$2"
    
    echo ""
    echo "📝 Testing: $test_name"
    echo "File: $file_path"
    
    if [ ! -f "$file_path" ]; then
        echo "❌ FAILED - File not found: $file_path"
        return 1
    fi
    
    # Measure response time
    start_time=$(date +%s%3N)
    
    # Make the file upload API call
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -F "message=Please analyze this job description and tell me how Lawrence would be a great fit" \
        -F "files=@$file_path" \
        -F "history=[]" \
        "$API_URL")
    
    end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))
    
    # Extract HTTP status and response body
    http_status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    response_body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')
    
    echo "⏱️  Response Time: ${response_time}ms"
    echo "📊 HTTP Status: $http_status"
    
    if [ "$http_status" = "200" ]; then
        # Extract response length
        response_length=$(echo "$response_body" | jq -r '.response' 2>/dev/null | wc -c)
        echo "📏 Response Length: $response_length chars"
        
        # Show preview
        preview=$(echo "$response_body" | jq -r '.response' 2>/dev/null | head -c 200)
        echo "📖 Preview: \"$preview...\""
        
        echo "✅ PASSED"
    else
        echo "❌ FAILED - HTTP $http_status"
        echo "Error: $response_body"
    fi
}

# Test contact/meeting functions
test_contact() {
    local test_name="$1"
    local test_input="$2"
    
    echo ""
    echo "📝 Testing: $test_name"
    echo "Input: \"$test_input\""
    
    # First message to trigger contact flow
    start_time=$(date +%s%3N)
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -F "message=$test_input" \
        -F "history=[]" \
        "$API_URL")
    
    end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))
    
    http_status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    response_body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')
    
    echo "⏱️  Response Time: ${response_time}ms"
    echo "📊 HTTP Status: $http_status"
    
    if [ "$http_status" = "200" ]; then
        preview=$(echo "$response_body" | jq -r '.response' 2>/dev/null | head -c 200)
        echo "📖 Preview: \"$preview...\""
        
        # Now send contact details
        echo "📧 Sending contact details with email: $EMAIL"
        
        contact_message=""
        if [[ "$test_input" == "/message" ]]; then
            contact_message="Name: Test Recruiter\nCompany: Amazing AI Company\nEmail: $EMAIL\nMessage: I'd like to discuss an AI Product Manager role with Lawrence. He seems like a perfect fit for our team!"
        else
            contact_message="Name: Test Recruiter\nCompany: Startup Inc\nEmail: $EMAIL\nMessage: I'd like to schedule a meeting with Lawrence to discuss opportunities."
        fi
        
        start_time2=$(date +%s%3N)
        
        contact_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X POST \
            -F "message=$contact_message" \
            -F "history=[{\"role\":\"assistant\",\"content\":\"$(echo "$response_body" | jq -r '.response')\"}]" \
            "$API_URL")
        
        end_time2=$(date +%s%3N)
        contact_time=$((end_time2 - start_time2))
        
        contact_status=$(echo "$contact_response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
        contact_body=$(echo "$contact_response" | sed 's/HTTPSTATUS:[0-9]*$//')
        
        echo "⏱️  Contact Submit Time: ${contact_time}ms"
        echo "📊 Contact Status: $contact_status"
        
        if [ "$contact_status" = "200" ]; then
            contact_preview=$(echo "$contact_body" | jq -r '.response' 2>/dev/null | head -c 200)
            echo "📧 Contact Response: \"$contact_preview...\""
            echo "✅ CONTACT FLOW COMPLETED"
        fi
        
        echo "✅ PASSED"
    else
        echo "❌ FAILED - HTTP $http_status"
    fi
}

echo "🔍 Checking server availability..."
if ! curl -s "$BASE_URL/api/version" > /dev/null; then
    echo "❌ Server not available at $BASE_URL"
    exit 1
fi
echo "✅ Server is ready!"

echo ""
echo "🧪 Running Quick Link Tests..."
echo "==============================="

# Test all quick links
test_link "Skills Quick Response" "What are Lawrence's skills?" "instant"
test_link "Experience Quick Response" "Tell me about Lawrence's experience" "instant"  
test_link "Projects Quick Response" "What projects has Lawrence worked on?" "instant"
test_link "AI Expertise Quick Response" "What's Lawrence's AI experience?" "instant"
test_link "Education Quick Response" "What's Lawrence's educational background?" "instant"
test_link "Contact Quick Response" "How can I contact Lawrence?" "instant"
test_link "Fun Fact" "Tell me a fun fact about Lawrence" "dynamic"

echo ""
echo "📧 Testing Contact & Meeting Flows..."
echo "===================================="

test_contact "Message Contact Flow" "/message"
test_contact "Meeting Contact Flow" "/meeting"

echo ""
echo "📎 Testing File Upload..."
echo "========================="

test_file_upload "Netflix Logo Upload" "$NETFLIX_IMAGE"

echo ""
echo "📊 SUMMARY"
echo "=========="
echo "✅ All quick link tests completed!"
echo "📧 Check email: $EMAIL for 2 emails (1 message, 1 meeting)"
echo "📧 Check email: lawrencehua2@gmail.com for 3 emails (1 message, 1 meeting, 1 image)"
echo ""
echo "🎯 Quick links should show:"
echo "   • Detailed responses with clickable buttons"
echo "   • Fast response times (0ms for instant responses)"
echo "   • User-friendly formatting"
echo "   • Comprehensive information" 