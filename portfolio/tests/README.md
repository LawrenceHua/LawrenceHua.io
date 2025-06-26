# Analytics Dashboard Test Suite

This test suite provides comprehensive testing for the analytics dashboard functionality.

## Overview

The test suite includes:

1. **Scrolling Tests** - Verify touchpad and mouse wheel scrolling works in all tabs
2. **Tour Analytics Tests** - Test tour functionality and analytics tracking
3. **Date Range Tests** - Verify time filtering (24h vs 7d vs 30d)
4. **Chat Session Tests** - Verify session limits and recent chat loading
5. **General Feature Tests** - Test analytics assistant, modals, etc.

## Quick Start

### Prerequisites

```bash
# Install dependencies
npm install playwright @playwright/test

# Start your development server
npm run dev
```

### Environment Setup

```bash
# Set environment variables
export BASE_URL="http://localhost:3000"
export ANALYTICS_PASSWORD="your-analytics-password"
```

### Running Tests

```bash
# Run all tests
./tests/run-analytics-tests.sh

# Run specific test categories
./tests/run-analytics-tests.sh scroll    # Scrolling only
./tests/run-analytics-tests.sh tour     # Tour analytics only
./tests/run-analytics-tests.sh dates    # Date ranges only
./tests/run-analytics-tests.sh sessions # Chat sessions only
```

### Individual Test Files

```bash
# Run individual test files
node tests/scroll-test.js
node tests/date-range-test.js
node tests/tour-analytics-test.js
node tests/analytics-test-suite.js
```

## Test Categories

### 1. Scrolling Tests (`scroll-test.js`)

Tests that scrollable containers work properly:
- Sessions tab scrolling
- Recruiters tab scrolling  
- Locations tab scrolling
- Tours tab scrolling

**Expected Issues Fixed:**
- Touchpad scrolling now works
- Mouse wheel scrolling responsive
- Containers properly sized

### 2. Tour Analytics Tests (`tour-analytics-test.js`)

Tests tour functionality and tracking:
- Tour trigger elements exist
- Tours can be initiated
- Tour events are tracked to Firebase
- Analytics display tour data

**Expected Issues Fixed:**
- Tour events now tracked to `tour_events` collection
- Analytics dashboard shows tour metrics
- Tour completion rates calculated

### 3. Date Range Tests (`date-range-test.js`)

Tests time filtering functionality:
- 24 hours vs 7 days vs 30 days show different data
- Custom date ranges work
- Data is properly filtered by timestamp

**Expected Issues Fixed:**
- Time range filtering works correctly
- Different ranges show appropriate data amounts
- 30 days of data accessible

### 4. Analytics Test Suite (`analytics-test-suite.js`)

Comprehensive test covering all features:
- Chat session limits (250 most recent)
- Analytics assistant functionality
- Modal interactions
- Data refresh functionality

## Key Improvements Made

### Scrolling Fixes
- Enhanced CSS for scroll containers
- Fixed touchpad scrolling issues
- Improved scrollbar styling
- Force browser scroll container recognition

### Tour Analytics Implementation
- Added Firebase tracking to PMTour component
- Track tour_start, tour_step, tour_complete, tour_abandon, tour_cta_action events
- Display tour metrics in analytics dashboard
- Calculate completion rates and popular steps

### Data Management
- Limited chat messages to 5000 for performance
- Limited sessions to 250 most recent
- Improved time range filtering
- Fixed Firebase read optimization

### UI Improvements
- Responsive layout for all screen sizes
- Fixed container heights with viewport units
- Better mobile scrolling experience
- Improved tab navigation

## Test Results

The test suite generates detailed reports including:
- Pass/fail status for each test
- Specific error details for failures
- Performance metrics
- Recommendations for fixes

Results are saved to `portfolio/tests/analytics-test-results-{timestamp}.json`

## Common Issues and Solutions

### Scrolling Not Working
- Check that `.analytics-scroll-fix` class is applied
- Verify containers have proper height constraints
- Ensure no CSS conflicts blocking scroll

### Tour Analytics Missing
- Verify PMTour component is imported and used
- Check Firebase tour_events collection exists
- Test tour functionality in browser console

### Date Filtering Issues
- Check Firebase timestamp field formatting
- Verify query limits and ordering
- Test with different date ranges manually

### Performance Issues
- Monitor Firebase read counts
- Check if data limits are appropriate
- Verify scroll container optimization

## Contributing

To add new tests:

1. Create test file in `tests/` directory
2. Follow existing test patterns
3. Add to main test suite if appropriate
4. Update this README

## Troubleshooting

### Tests Fail to Start
- Ensure development server is running
- Check environment variables are set
- Verify Playwright is installed

### Authentication Issues
- Set correct ANALYTICS_PASSWORD
- Check if password is required in your environment
- Verify analytics route is accessible

### Network Issues
- Check BASE_URL is correct
- Ensure no firewall blocking requests
- Verify API routes are working

For more help, check the console output during test runs for detailed error messages. 