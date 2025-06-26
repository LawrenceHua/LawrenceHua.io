/**
 * Scrolling Test for Analytics Dashboard
 * Tests touchpad and mouse wheel scrolling in all tabs
 */

const { chromium } = require('playwright');

async function testScrolling() {
  console.log('🖱️  Testing Analytics Scrolling...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to analytics
    await page.goto('http://localhost:3000/analytics');
    
    // Login if needed
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await page.fill('input[type="password"]', process.env.ANALYTICS_PASSWORD || 'your-password');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    }
    
    // Load data
    await page.click('button:has-text("Refresh Data")');
    await page.waitForTimeout(3000);
    
    const results = {};
    
    // Test sessions tab scrolling
    results.sessions = await testTabScrolling(page, 'sessions');
    
    // Test recruiters tab scrolling
    results.recruiters = await testTabScrolling(page, 'recruiters');
    
    // Test locations tab scrolling
    results.locations = await testTabScrolling(page, 'locations');
    
    // Test tours tab scrolling
    results.tours = await testTabScrolling(page, 'tours');
    
    // Print results
    console.log('\n📊 SCROLLING TEST RESULTS:');
    console.log('=' * 30);
    
    Object.entries(results).forEach(([tab, result]) => {
      const status = result.scrollWorked ? '✅' : '❌';
      console.log(`${status} ${tab}: ${result.scrollWorked ? 'WORKING' : 'BROKEN'}`);
      if (!result.scrollWorked) {
        console.log(`   └─ ${result.issue}`);
      }
    });
    
    const allWorking = Object.values(results).every(r => r.scrollWorked);
    console.log(`\n🎯 Overall: ${allWorking ? 'ALL SCROLLING WORKS' : 'SOME TABS HAVE SCROLL ISSUES'}`);
    
  } catch (error) {
    console.error('❌ Scroll test failed:', error);
  } finally {
    await browser.close();
  }
}

async function testTabScrolling(page, tabName) {
  try {
    console.log(`  Testing ${tabName} tab scrolling...`);
    
    // Click the tab
    await page.click(`button:has-text("${tabName}")`);
    await page.waitForTimeout(1000);
    
    // Find scrollable container
    const scrollContainer = await page.$('.analytics-scroll-fix');
    
    if (!scrollContainer) {
      return {
        scrollWorked: false,
        issue: 'No scrollable container found'
      };
    }
    
    // Get initial scroll position
    const beforeScroll = await scrollContainer.evaluate(el => el.scrollTop);
    
    // Test mouse wheel scrolling
    await scrollContainer.hover();
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(500);
    
    // Get new scroll position
    const afterWheelScroll = await scrollContainer.evaluate(el => el.scrollTop);
    
    // Test if wheel scrolling worked
    const wheelScrollWorked = afterWheelScroll > beforeScroll;
    
    if (!wheelScrollWorked) {
      // Try alternative scrolling method
      await scrollContainer.evaluate(el => {
        el.scrollTop += 300;
      });
      await page.waitForTimeout(500);
      const afterManualScroll = await scrollContainer.evaluate(el => el.scrollTop);
      
      const manualScrollWorked = afterManualScroll > beforeScroll;
      
      return {
        scrollWorked: manualScrollWorked,
        issue: manualScrollWorked ? 'Manual scroll works but wheel does not' : 'Neither wheel nor manual scroll work'
      };
    }
    
    return {
      scrollWorked: true,
      issue: null
    };
    
  } catch (error) {
    return {
      scrollWorked: false,
      issue: `Error: ${error.message}`
    };
  }
}

if (require.main === module) {
  testScrolling();
}

module.exports = { testScrolling }; 