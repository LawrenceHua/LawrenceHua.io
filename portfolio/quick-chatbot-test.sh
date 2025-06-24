#!/bin/bash

# Chatbot Performance Test Script
echo "🚀 Quick Chatbot Performance Test"
echo "================================="

BASE_URL="http://localhost:3003"
API_URL="$BASE_URL/api/chatbot"

# Check if server is running
echo "⏳ Checking server status..."
if curl -s "$BASE_URL/api/version" > /dev/null; then
    VERSION=$(curl -s "$BASE_URL/api/version" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Server running! Version: $VERSION"
else
    echo "❌ Server not accessible at $BASE_URL"
    exit 1
fi

echo ""

# Test scenarios
declare -a tests=(
    "Quick Message Request|I want to work with Lawrence on a project"
    "Quick Meeting Request|Can we schedule a meeting to discuss opportunities?"
    "Skills Question|What are Lawrence's main technical skills?"
    "Experience Question|Tell me about Lawrence's work experience"
    "Project Question|What projects has Lawrence worked on?"
    "AI Question|Tell me about Lawrence's AI experience"
    "Contact Intent|I'd like to contact Lawrence"
    "Complex Analysis|Compare Lawrence's skills to typical product manager requirements"
)

total_time=0
test_count=0
passed_tests=0

echo "🧪 Running Chatbot Tests..."
echo "=========================="

for test in "${tests[@]}"; do
    IFS='|' read -r test_name test_input <<< "$test"
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
        # Extract response text length
        response_length=$(echo "$response_body" | wc -c)
        echo "📏 Response Length: $response_length chars"
        
        # Check if response contains actual content
        if echo "$response_body" | grep -q '"response"'; then
            echo "✅ PASSED - Got valid response"
            ((passed_tests++))
            
            # Extract and display preview
            preview=$(echo "$response_body" | grep -o '"response":"[^"]*"' | cut -d'"' -f4 | head -c 100)
            echo "📖 Preview: \"$preview...\""
        else
            echo "❌ FAILED - No response content"
        fi
    else
        echo "❌ FAILED - HTTP $http_status"
        echo "Error: $response_body"
    fi
    
    total_time=$((total_time + response_time))
    ((test_count++))
    
    # Brief pause between tests
    sleep 1
done

# Calculate averages
if [ $test_count -gt 0 ]; then
    average_time=$((total_time / test_count))
else
    average_time=0
fi

success_rate=0
if [ $test_count -gt 0 ]; then
    success_rate=$((passed_tests * 100 / test_count))
fi

echo ""
echo "📊 PERFORMANCE SUMMARY"
echo "====================="
echo "📋 Total Tests: $test_count"
echo "✅ Passed: $passed_tests"
echo "❌ Failed: $((test_count - passed_tests))"
echo "🎯 Success Rate: ${success_rate}%"
echo "⏱️  Total Time: ${total_time}ms"
echo "📈 Average Response Time: ${average_time}ms"

# Performance analysis
echo ""
echo "🎯 OPTIMIZATION TARGET"
echo "====================="
target_time=$((average_time / 2))
echo "🚀 Current Average: ${average_time}ms"
echo "🎯 Target (50% faster): ${target_time}ms"
echo "💡 Need to reduce by: $((average_time - target_time))ms per request"

echo ""
echo "✅ Quick test complete!" 