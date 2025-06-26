/**
 * Date Range Analytics Test
 * Tests 24h vs 7d vs 30d data filtering
 */

const { chromium } = require('playwright');

async function testDateRangeFiltering() {
  console.log('📅 Testing Date Range Filtering...');
  
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
    
    console.log('Testing time range variations...');
    
    // Test 24 hours
    await page.selectOption('select', '1d');
    await page.waitForTimeout(2000);
    const data24h = await getMetrics(page);
    console.log('📊 24h data:', data24h);
    
    // Test 7 days
    await page.selectOption('select', '7d');
    await page.waitForTimeout(2000);
    const data7d = await getMetrics(page);
    console.log('📊 7d data:', data7d);
    
    // Test 30 days
    await page.selectOption('select', '30d');
    await page.waitForTimeout(2000);
    const data30d = await getMetrics(page);
    console.log('📊 30d data:', data30d);
    
    // Test custom range
    await page.selectOption('select', 'custom');
    await page.waitForTimeout(500);
    
    const daysInput = await page.$('input[type="number"]');
    if (daysInput) {
      await daysInput.fill('14');
      await page.waitForTimeout(2000);
      const dataCustom = await getMetrics(page);
      console.log('📊 Custom 14d data:', dataCustom);
    }
    
    // Verify data differences
    const hasVariation = (
      data24h.sessions !== data7d.sessions ||
      data7d.sessions !== data30d.sessions ||
      data24h.pageViews !== data30d.pageViews
    );
    
    console.log(`✅ Date range filtering: ${hasVariation ? 'WORKING' : 'NEEDS FIX'}`);
    console.log('Expected: 24h ≤ 7d ≤ 30d data amounts');
    
    if (hasVariation) {
      console.log('✅ Date filtering is working correctly!');
    } else {
      console.log('❌ Date filtering may not be working - all ranges show same data');
    }
    
  } catch (error) {
    console.error('❌ Date range test failed:', error);
  } finally {
    await browser.close();
  }
}

async function getMetrics(page) {
  try {
    const sessions = await page.textContent('.chat-sessions .text-2xl') || '0';
    const pageViews = await page.textContent('.page-views .text-2xl') || '0';
    const visitors = await page.textContent('.unique-visitors .text-2xl') || '0';
    
    return {
      sessions: parseInt(sessions),
      pageViews: parseInt(pageViews),
      visitors: parseInt(visitors)
    };
  } catch (error) {
    return { sessions: 0, pageViews: 0, visitors: 0 };
  }
}

if (require.main === module) {
  testDateRangeFiltering();
}

module.exports = { testDateRangeFiltering }; 