/**
 * Tour Analytics Test
 * Tests tour initiation, tracking, and analytics display
 */

const { chromium } = require('playwright');

async function testTourAnalytics() {
  console.log('🎯 Testing Tour Analytics...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Step 1: Testing tour on main portfolio page...');
    
    // Navigate to main portfolio
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Look for tour elements
    const tourResults = await findAndTestTour(page);
    
    console.log('Step 2: Checking analytics dashboard for tour data...');
    
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
    
    // Check tours tab
    await page.click('button:has-text("tours")');
    await page.waitForTimeout(1000);
    
    const tourData = await getTourAnalyticsData(page);
    
    console.log('\n📊 TOUR ANALYTICS RESULTS:');
    console.log('=' * 30);
    console.log(`✅ Tour trigger found: ${tourResults.triggerFound ? 'YES' : 'NO'}`);
    console.log(`✅ Tour can be started: ${tourResults.canStart ? 'YES' : 'NO'}`);
    console.log(`✅ Tour data in analytics: ${tourData.hasData ? 'YES' : 'NO'}`);
    
    if (tourData.hasData) {
      console.log(`   • Tour starts: ${tourData.starts}`);
      console.log(`   • Tour completions: ${tourData.completions}`);
      console.log(`   • Completion rate: ${tourData.rate}%`);
      console.log(`   • CTA actions: ${tourData.ctaActions}`);
    }
    
    // Overall assessment
    const overallWorking = tourResults.triggerFound && tourData.hasData;
    console.log(`\n🎯 Overall tour analytics: ${overallWorking ? 'WORKING' : 'NEEDS ATTENTION'}`);
    
    if (!overallWorking) {
      console.log('\n🔧 RECOMMENDATIONS:');
      if (!tourResults.triggerFound) {
        console.log('• Add tour trigger buttons/elements to portfolio');
        console.log('• Ensure PMTour component is properly imported and used');
      }
      if (!tourData.hasData) {
        console.log('• Check Firebase tour_events collection exists');
        console.log('• Verify tour event tracking is implemented');
        console.log('• Test tour functionality and check console for errors');
      }
    }
    
  } catch (error) {
    console.error('❌ Tour analytics test failed:', error);
  } finally {
    await browser.close();
  }
}

async function findAndTestTour(page) {
  try {
    // Look for common tour trigger elements
    const tourSelectors = [
      '[data-tour]',
      '[data-testid*="tour"]',
      'button:has-text("Tour")',
      'button:has-text("Guide")',
      '.tour-trigger',
      '.pm-tour',
      '[class*="tour"]'
    ];
    
    let triggerFound = false;
    let canStart = false;
    
    for (const selector of tourSelectors) {
      const element = await page.$(selector);
      if (element) {
        triggerFound = true;
        console.log(`  Found tour element: ${selector}`);
        
        // Try to click it
        try {
          await element.click();
          await page.waitForTimeout(1000);
          
          // Check if tour started (look for tour overlay/popup)
          const tourOverlay = await page.$('.tour-overlay, .tour-popup, [data-tour-active="true"]');
          if (tourOverlay) {
            canStart = true;
            console.log('  ✅ Tour started successfully');
            
            // Try to close tour
            const closeButton = await page.$('button:has-text("Close"), .close-button, [data-close="tour"]');
            if (closeButton) {
              await closeButton.click();
            }
          }
          break;
        } catch (error) {
          console.log(`  ⚠️ Could not click tour element: ${error.message}`);
        }
      }
    }
    
    if (!triggerFound) {
      console.log('  ❌ No tour trigger elements found');
    }
    
    return { triggerFound, canStart };
    
  } catch (error) {
    console.log(`  ❌ Error testing tour: ${error.message}`);
    return { triggerFound: false, canStart: false };
  }
}

async function getTourAnalyticsData(page) {
  try {
    // Look for tour metrics
    const starts = await getTextContent(page, '.tour-starts, [data-metric="tour-starts"]');
    const completions = await getTextContent(page, '.tour-completions, [data-metric="tour-completions"]');
    const rate = await getTextContent(page, '.completion-rate, [data-metric="completion-rate"]');
    const ctaActions = await getTextContent(page, '.tour-cta-actions, [data-metric="tour-cta-actions"]');
    
    // Check if we have any tour data
    const hasData = starts !== null || completions !== null || rate !== null;
    
    return {
      hasData,
      starts: starts || 0,
      completions: completions || 0,
      rate: rate || 0,
      ctaActions: ctaActions || 0
    };
    
  } catch (error) {
    console.log(`  ❌ Error getting tour data: ${error.message}`);
    return { hasData: false };
  }
}

async function getTextContent(page, selector) {
  try {
    const text = await page.textContent(selector);
    if (text) {
      const number = parseInt(text.replace(/[^\d]/g, ''));
      return isNaN(number) ? null : number;
    }
    return null;
  } catch (error) {
    return null;
  }
}

if (require.main === module) {
  testTourAnalytics();
}

module.exports = { testTourAnalytics }; 