#!/bin/bash

# Analytics Dashboard Test Runner
# Run comprehensive tests for all analytics features

echo "🚀 Analytics Dashboard Test Suite"
echo "================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    exit 1
fi

# Set environment variables
export BASE_URL=${BASE_URL:-"http://localhost:3000"}
export ANALYTICS_PASSWORD=${ANALYTICS_PASSWORD:-"your-analytics-password"}

echo "🔧 Configuration:"
echo "   Base URL: $BASE_URL"
echo "   Password: $ANALYTICS_PASSWORD"
echo ""

# Check if the server is running
echo "🌐 Checking if server is running..."
if curl -s "$BASE_URL" > /dev/null; then
    echo "✅ Server is running at $BASE_URL"
else
    echo "❌ Server is not running at $BASE_URL"
    echo "Please start your development server first:"
    echo "   npm run dev"
    exit 1
fi

# Install test dependencies if needed
echo "📦 Installing test dependencies..."
if [ ! -d "node_modules/playwright" ]; then
    npm install playwright @playwright/test
fi

# Run specific test suites based on arguments
case "${1:-all}" in
    "scroll")
        echo "🖱️  Running scrolling tests only..."
        node -e "
        const { AnalyticsTestSuite } = require('./tests/analytics-test-suite.js');
        (async () => {
            const suite = new AnalyticsTestSuite();
            await suite.setup();
            await suite.testScrolling();
            await suite.generateReport();
            await suite.cleanup();
        })();
        "
        ;;
    "tour")
        echo "🎯 Running tour analytics tests only..."
        node -e "
        const { AnalyticsTestSuite } = require('./tests/analytics-test-suite.js');
        (async () => {
            const suite = new AnalyticsTestSuite();
            await suite.setup();
            await suite.testTourAnalytics();
            await suite.generateReport();
            await suite.cleanup();
        })();
        "
        ;;
    "dates")
        echo "📅 Running date range tests only..."
        node -e "
        const { AnalyticsTestSuite } = require('./tests/analytics-test-suite.js');
        (async () => {
            const suite = new AnalyticsTestSuite();
            await suite.setup();
            await suite.testDateRangeFiltering();
            await suite.generateReport();
            await suite.cleanup();
        })();
        "
        ;;
    "sessions")
        echo "💬 Running chat session tests only..."
        node -e "
        const { AnalyticsTestSuite } = require('./tests/analytics-test-suite.js');
        (async () => {
            const suite = new AnalyticsTestSuite();
            await suite.setup();
            await suite.testChatSessionLimits();
            await suite.generateReport();
            await suite.cleanup();
        })();
        "
        ;;
    "all"|*)
        echo "🧪 Running all analytics tests..."
        node tests/analytics-test-suite.js
        ;;
esac

echo ""
echo "🎉 Analytics tests completed!"
echo "Check the test results above and any generated report files." 