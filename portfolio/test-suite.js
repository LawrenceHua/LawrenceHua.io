const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

class PortfolioTestSuite {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.baseUrl = "http://localhost:3000";
  }

  async log(message, type = "INFO") {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}`;
    console.log(logMessage);
    this.testResults.push(logMessage);
  }

  async init() {
    try {
      this.browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 720 },
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      this.page = await this.browser.newPage();

      // Set user agent to avoid bot detection
      await this.page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      this.log("Browser initialized successfully");
    } catch (error) {
      this.log(`Failed to initialize browser: ${error.message}`, "ERROR");
      throw error;
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.log("Browser closed");
    }
  }

  async navigateToPage(url = "/") {
    try {
      await this.page.goto(`${this.baseUrl}${url}`, {
        waitUntil: "networkidle2",
      });
      this.log(`Navigated to ${url}`);
      return true;
    } catch (error) {
      this.log(`Failed to navigate to ${url}: ${error.message}`, "ERROR");
      return false;
    }
  }

  async testPageLoad() {
    this.log("=== Testing Page Load ===");

    const success = await this.navigateToPage("/");
    if (!success) return false;

    // Check if page loaded properly
    const title = await this.page.title();
    this.log(`Page title: ${title}`);

    // Check for critical elements
    const criticalElements = ["h1", "main", "nav", "footer"];

    for (const selector of criticalElements) {
      const element = await this.page.$(selector);
      if (element) {
        this.log(`✓ Found ${selector} element`);
      } else {
        this.log(`✗ Missing ${selector} element`, "WARNING");
      }
    }

    return true;
  }

  async testChatbotFunctionality() {
    this.log("=== Testing Chatbot Functionality ===");

    // Wait for chatbot to be available
    await this.page
      .waitForSelector('[data-testid="chatbot-button"]', { timeout: 5000 })
      .catch(() =>
        this.log(
          "Chatbot button not found, looking for alternative selectors",
          "WARNING"
        )
      );

    // Try to find chatbot button with different selectors
    const chatbotSelectors = [
      '[data-testid="chatbot-button"]',
      'button[title*="chat"]',
      'button[aria-label*="chat"]',
      ".chatbot-button",
      'button:has-text("Chat")',
    ];

    let chatbotButton = null;
    for (const selector of chatbotSelectors) {
      try {
        chatbotButton = await this.page.$(selector);
        if (chatbotButton) {
          this.log(`Found chatbot button with selector: ${selector}`);
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (!chatbotButton) {
      this.log("Could not find chatbot button", "ERROR");
      return false;
    }

    // Click chatbot button
    await chatbotButton.click();
    this.log("Clicked chatbot button");

    // Wait for chatbot to open
    await this.page.waitForTimeout(1000);

    // Test basic message sending
    const testMessages = [
      "Hello",
      "What are Lawrence's skills?",
      "Tell me about Lawrence's experience",
    ];

    for (const message of testMessages) {
      await this.testChatbotMessage(message);
      await this.page.waitForTimeout(2000); // Wait between messages
    }

    // Test girlfriend easter egg
    await this.testGirlfriendEasterEgg();

    return true;
  }

  async testChatbotMessage(message) {
    try {
      // Find input field
      const inputSelector = 'textarea, input[type="text"], .chatbot-input';
      await this.page.waitForSelector(inputSelector, { timeout: 5000 });

      const input = await this.page.$(inputSelector);
      if (!input) {
        this.log(`Could not find input field for message: ${message}`, "ERROR");
        return false;
      }

      // Type message
      await input.type(message);
      this.log(`Typed message: ${message}`);

      // Find send button
      const sendButton = await this.page.$(
        'button[type="submit"], .send-button, button:has-text("Send")'
      );
      if (sendButton) {
        await sendButton.click();
        this.log(`Sent message: ${message}`);

        // Wait for response
        await this.page.waitForTimeout(3000);

        // Check for response
        const responses = await this.page.$$(
          '.message-bubble, .chat-message, [data-role="assistant"]'
        );
        if (responses.length > 0) {
          this.log(`✓ Received response for: ${message}`);
        } else {
          this.log(`✗ No response received for: ${message}`, "WARNING");
        }
      } else {
        this.log(`Could not find send button for message: ${message}`, "ERROR");
      }

      return true;
    } catch (error) {
      this.log(
        `Error testing chatbot message "${message}": ${error.message}`,
        "ERROR"
      );
      return false;
    }
  }

  async testGirlfriendEasterEgg() {
    this.log("=== Testing Girlfriend Easter Egg ===");

    try {
      // Test password request
      await this.testChatbotMessage("Who is Lawrence's favorite person?");
      await this.page.waitForTimeout(2000);

      // Check if password prompt appears
      const pageContent = await this.page.content();
      if (pageContent.includes("password") || pageContent.includes("🤐")) {
        this.log("✓ Password prompt appeared");
      } else {
        this.log("✗ Password prompt did not appear", "WARNING");
      }

      // Test with correct password
      await this.testChatbotMessage("August 21, 2024");
      await this.page.waitForTimeout(3000);

      // Check if love mode activated
      const loveModeElements = await this.page.$$(
        '.loveMode, .love-mode, [class*="love"]'
      );
      if (loveModeElements.length > 0) {
        this.log("✓ Love mode activated");
      } else {
        this.log("✗ Love mode not activated", "WARNING");
      }

      return true;
    } catch (error) {
      this.log(
        `Error testing girlfriend easter egg: ${error.message}`,
        "ERROR"
      );
      return false;
    }
  }

  async testContactForm() {
    this.log("=== Testing Contact Form ===");

    try {
      // Find contact form
      const formSelectors = [
        'form[action*="contact"]',
        'form[data-testid="contact-form"]',
        ".contact-form",
        'form:has-text("Get in Touch")',
      ];

      let contactForm = null;
      for (const selector of formSelectors) {
        try {
          contactForm = await this.page.$(selector);
          if (contactForm) {
            this.log(`Found contact form with selector: ${selector}`);
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      if (!contactForm) {
        this.log("Could not find contact form", "WARNING");
        return false;
      }

      // Fill out form
      const testData = {
        name: "Test User",
        email: "test@example.com",
        subject: "Test Message",
        message: "This is a test message from the automated test suite.",
      };

      // Fill name field
      const nameInput = await this.page.$(
        'input[name="name"], input[placeholder*="name"], #name'
      );
      if (nameInput) {
        await nameInput.type(testData.name);
        this.log("Filled name field");
      }

      // Fill email field
      const emailInput = await this.page.$(
        'input[name="email"], input[type="email"], input[placeholder*="email"], #email'
      );
      if (emailInput) {
        await emailInput.type(testData.email);
        this.log("Filled email field");
      }

      // Fill subject field
      const subjectInput = await this.page.$(
        'input[name="subject"], input[placeholder*="subject"], #subject'
      );
      if (subjectInput) {
        await subjectInput.type(testData.subject);
        this.log("Filled subject field");
      }

      // Fill message field
      const messageInput = await this.page.$(
        'textarea[name="message"], textarea[placeholder*="message"], #message'
      );
      if (messageInput) {
        await messageInput.type(testData.message);
        this.log("Filled message field");
      }

      // Submit form
      const submitButton = await this.page.$(
        'button[type="submit"], input[type="submit"], .submit-button'
      );
      if (submitButton) {
        await submitButton.click();
        this.log("Submitted contact form");

        // Wait for response
        await this.page.waitForTimeout(3000);

        // Check for success message
        const pageContent = await this.page.content();
        if (
          pageContent.includes("success") ||
          pageContent.includes("sent") ||
          pageContent.includes("thank")
        ) {
          this.log("✓ Contact form submitted successfully");
        } else {
          this.log("✗ Contact form submission may have failed", "WARNING");
        }
      } else {
        this.log("Could not find submit button", "ERROR");
      }

      return true;
    } catch (error) {
      this.log(`Error testing contact form: ${error.message}`, "ERROR");
      return false;
    }
  }

  async testMeetingScheduling() {
    this.log("=== Testing Meeting Scheduling ===");

    try {
      // Look for scheduling-related elements
      const schedulingSelectors = [
        'button:has-text("Schedule")',
        'button:has-text("Meeting")',
        'button:has-text("Book")',
        'a[href*="calendly"]',
        'a[href*="calendar"]',
        ".schedule-button",
        ".meeting-button",
      ];

      let schedulingElement = null;
      for (const selector of schedulingSelectors) {
        try {
          schedulingElement = await this.page.$(selector);
          if (schedulingElement) {
            this.log(`Found scheduling element with selector: ${selector}`);
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      if (!schedulingElement) {
        this.log("Could not find scheduling elements", "WARNING");
        return false;
      }

      // Click scheduling element
      await schedulingElement.click();
      this.log("Clicked scheduling element");

      // Wait for navigation or modal
      await this.page.waitForTimeout(2000);

      // Check if we navigated to external site or opened modal
      const currentUrl = this.page.url();
      if (
        currentUrl.includes("calendly") ||
        currentUrl.includes("calendar") ||
        currentUrl.includes("meet")
      ) {
        this.log(`✓ Navigated to scheduling page: ${currentUrl}`);
      } else {
        this.log(
          "Scheduling element clicked but no navigation detected",
          "INFO"
        );
      }

      return true;
    } catch (error) {
      this.log(`Error testing meeting scheduling: ${error.message}`, "ERROR");
      return false;
    }
  }

  async testLinks() {
    this.log("=== Testing Links ===");

    try {
      // Get all links on the page
      const links = await this.page.$$eval("a[href]", (elements) =>
        elements.map((el) => ({
          href: el.href,
          text: el.textContent?.trim() || "",
          target: el.target || "_self",
        }))
      );

      this.log(`Found ${links.length} links to test`);

      const brokenLinks = [];
      const workingLinks = [];

      for (const link of links) {
        try {
          // Skip external links for now (we'll test them separately)
          if (
            link.href.startsWith("http") &&
            !link.href.includes("localhost")
          ) {
            this.log(`Skipping external link: ${link.href}`);
            continue;
          }

          // Test internal links
          if (link.href.includes("localhost") || link.href.startsWith("/")) {
            const response = await this.page.goto(link.href, {
              waitUntil: "networkidle2",
            });
            if (response && response.ok()) {
              workingLinks.push(link.href);
              this.log(`✓ Working link: ${link.href}`);
            } else {
              brokenLinks.push(link.href);
              this.log(`✗ Broken link: ${link.href}`, "ERROR");
            }
          }
        } catch (error) {
          brokenLinks.push(link.href);
          this.log(
            `✗ Error testing link ${link.href}: ${error.message}`,
            "ERROR"
          );
        }
      }

      this.log(
        `Link test results: ${workingLinks.length} working, ${brokenLinks.length} broken`
      );
      return brokenLinks.length === 0;
    } catch (error) {
      this.log(`Error testing links: ${error.message}`, "ERROR");
      return false;
    }
  }

  async testImages() {
    this.log("=== Testing Images ===");

    try {
      // Get all images on the page
      const images = await this.page.$$eval("img", (elements) =>
        elements.map((el) => ({
          src: el.src,
          alt: el.alt || "",
          width: el.width,
          height: el.height,
        }))
      );

      this.log(`Found ${images.length} images to test`);

      const brokenImages = [];
      const workingImages = [];

      for (const image of images) {
        try {
          // Check if image loads
          const response = await this.page.goto(image.src, {
            waitUntil: "networkidle2",
          });
          if (response && response.ok()) {
            workingImages.push(image.src);
            this.log(`✓ Working image: ${image.src}`);
          } else {
            brokenImages.push(image.src);
            this.log(`✗ Broken image: ${image.src}`, "ERROR");
          }
        } catch (error) {
          brokenImages.push(image.src);
          this.log(
            `✗ Error testing image ${image.src}: ${error.message}`,
            "ERROR"
          );
        }
      }

      this.log(
        `Image test results: ${workingImages.length} working, ${brokenImages.length} broken`
      );
      return brokenImages.length === 0;
    } catch (error) {
      this.log(`Error testing images: ${error.message}`, "ERROR");
      return false;
    }
  }

  async testAnalyticsPage() {
    this.log("=== Testing Analytics Page ===");

    try {
      // Navigate to analytics page
      const success = await this.navigateToPage("/analytics");
      if (!success) return false;

      // Check if password protection is working
      const pageContent = await this.page.content();
      if (
        pageContent.includes("password") ||
        pageContent.includes("protected")
      ) {
        this.log("✓ Analytics page is password protected");

        // Try to access with wrong password
        const passwordInput = await this.page.$('input[type="password"]');
        if (passwordInput) {
          await passwordInput.type("wrongpassword");
          this.log("Entered wrong password");

          const submitButton = await this.page.$('button[type="submit"]');
          if (submitButton) {
            await submitButton.click();
            this.log("Submitted wrong password");

            await this.page.waitForTimeout(2000);

            // Check if access was denied
            const newContent = await this.page.content();
            if (
              newContent.includes("incorrect") ||
              newContent.includes("wrong")
            ) {
              this.log("✓ Wrong password correctly rejected");
            } else {
              this.log("✗ Wrong password not rejected", "WARNING");
            }
          }
        }
      } else {
        this.log("✗ Analytics page not password protected", "WARNING");
      }

      return true;
    } catch (error) {
      this.log(`Error testing analytics page: ${error.message}`, "ERROR");
      return false;
    }
  }

  async runAllTests() {
    this.log("🚀 Starting Portfolio Test Suite");
    this.log(`Testing URL: ${this.baseUrl}`);

    try {
      await this.init();

      // Run all tests
      const tests = [
        this.testPageLoad(),
        this.testChatbotFunctionality(),
        this.testContactForm(),
        this.testMeetingScheduling(),
        this.testLinks(),
        this.testImages(),
        this.testAnalyticsPage(),
      ];

      await Promise.all(tests);

      this.log("✅ All tests completed");

      // Save test results to file
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `test-results-${timestamp}.txt`;
      fs.writeFileSync(filename, this.testResults.join("\n"));
      this.log(`Test results saved to: ${filename}`);
    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, "ERROR");
    } finally {
      await this.cleanup();
    }
  }
}

// Run the test suite
if (require.main === module) {
  const testSuite = new PortfolioTestSuite();
  testSuite.runAllTests().catch(console.error);
}

module.exports = PortfolioTestSuite;
