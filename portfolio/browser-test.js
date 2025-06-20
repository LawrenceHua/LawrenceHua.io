// Browser Test Suite for Portfolio Website
// Run this in the browser console on http://localhost:3000

class BrowserTestSuite {
  constructor() {
    this.results = [];
    this.errors = [];
    this.warnings = [];
    this.startTime = Date.now();
  }

  log(message, type = "INFO") {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] [${type}] ${message}`;
    console.log(logMessage);
    this.results.push(logMessage);
  }

  async testPageLoad() {
    this.log("=== Testing Page Load ===");

    // Check if page loaded
    if (document.readyState === "complete") {
      this.log("✓ Page fully loaded");
    } else {
      this.log("⚠ Page still loading", "WARNING");
    }

    // Check for critical elements
    const criticalElements = ["h1", "main", "nav", "footer"];
    for (const selector of criticalElements) {
      const element = document.querySelector(selector);
      if (element) {
        this.log(`✓ Found ${selector} element`);
      } else {
        this.log(`✗ Missing ${selector} element`, "ERROR");
        this.errors.push(`Missing ${selector} element`);
      }
    }

    // Check for console errors
    const originalError = console.error;
    const errors = [];
    console.error = (...args) => {
      errors.push(args.join(" "));
      originalError.apply(console, args);
    };

    // Wait a bit for any errors to appear
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (errors.length > 0) {
      this.log(`⚠ Found ${errors.length} console errors`, "WARNING");
      errors.forEach((error) => this.log(`  - ${error}`, "WARNING"));
    } else {
      this.log("✓ No console errors found");
    }

    console.error = originalError;
  }

  async testChatbotFunctionality() {
    this.log("=== Testing Chatbot Functionality ===");

    // Find chatbot button
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
        chatbotButton = document.querySelector(selector);
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
      this.errors.push("Chatbot button not found");
      return false;
    }

    // Click chatbot button
    chatbotButton.click();
    this.log("Clicked chatbot button");

    // Wait for chatbot to open
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if chatbot modal is visible
    const modalSelectors = [
      ".chatbot-modal",
      ".modal",
      '[role="dialog"]',
      ".chat-container",
    ];

    let modalVisible = false;
    for (const selector of modalSelectors) {
      const modal = document.querySelector(selector);
      if (
        modal &&
        (modal.style.display !== "none" || modal.classList.contains("open"))
      ) {
        this.log(`✓ Chatbot modal visible with selector: ${selector}`);
        modalVisible = true;
        break;
      }
    }

    if (!modalVisible) {
      this.log("✗ Chatbot modal not visible", "ERROR");
      this.errors.push("Chatbot modal not visible");
      return false;
    }

    // Test message sending
    await this.testChatbotMessage("Hello");

    return true;
  }

  async testChatbotMessage(message) {
    try {
      // Find input field
      const inputSelectors = [
        "textarea",
        'input[type="text"]',
        ".chatbot-input",
        ".message-input",
      ];

      let input = null;
      for (const selector of inputSelectors) {
        input = document.querySelector(selector);
        if (input) break;
      }

      if (!input) {
        this.log(`Could not find input field for message: ${message}`, "ERROR");
        return false;
      }

      // Type message
      input.value = message;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      this.log(`Typed message: ${message}`);

      // Find send button
      const sendSelectors = [
        'button[type="submit"]',
        ".send-button",
        'button:has-text("Send")',
        ".chatbot-send",
      ];

      let sendButton = null;
      for (const selector of sendSelectors) {
        sendButton = document.querySelector(selector);
        if (sendButton) break;
      }

      if (sendButton) {
        sendButton.click();
        this.log(`Sent message: ${message}`);

        // Wait for response
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Check for response
        const responseSelectors = [
          ".message-bubble",
          ".chat-message",
          '[data-role="assistant"]',
          ".bot-message",
        ];

        let responseFound = false;
        for (const selector of responseSelectors) {
          const responses = document.querySelectorAll(selector);
          if (responses.length > 0) {
            this.log(`✓ Received response for: ${message}`);
            responseFound = true;
            break;
          }
        }

        if (!responseFound) {
          this.log(`✗ No response received for: ${message}`, "WARNING");
          this.warnings.push(`No response for: ${message}`);
        }
      } else {
        this.log(`Could not find send button for message: ${message}`, "ERROR");
        this.errors.push(`Send button not found for: ${message}`);
      }

      return true;
    } catch (error) {
      this.log(
        `Error testing chatbot message "${message}": ${error.message}`,
        "ERROR"
      );
      this.errors.push(`Chatbot message error: ${error.message}`);
      return false;
    }
  }

  async testContactForm() {
    this.log("=== Testing Contact Form ===");

    // Find contact form
    const formSelectors = [
      'form[action*="contact"]',
      'form[data-testid="contact-form"]',
      ".contact-form",
      'form:has-text("Get in Touch")',
    ];

    let contactForm = null;
    for (const selector of formSelectors) {
      contactForm = document.querySelector(selector);
      if (contactForm) {
        this.log(`Found contact form with selector: ${selector}`);
        break;
      }
    }

    if (!contactForm) {
      this.log("Could not find contact form", "WARNING");
      this.warnings.push("Contact form not found");
      return false;
    }

    // Test form validation
    const submitButton = contactForm.querySelector(
      'button[type="submit"], input[type="submit"]'
    );
    if (submitButton) {
      // Try to submit empty form
      submitButton.click();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check for validation errors
      const errorSelectors = [
        ".error",
        ".validation-error",
        "[data-error]",
        ".form-error",
      ];

      let validationErrors = [];
      for (const selector of errorSelectors) {
        const errors = document.querySelectorAll(selector);
        if (errors.length > 0) {
          validationErrors.push(
            ...Array.from(errors).map((e) => e.textContent)
          );
        }
      }

      if (validationErrors.length > 0) {
        this.log(
          `✓ Form validation working (${validationErrors.length} errors shown)`
        );
      } else {
        this.log("⚠ Form validation may not be working", "WARNING");
        this.warnings.push("Form validation not detected");
      }
    }

    return true;
  }

  async testLinks() {
    this.log("=== Testing Links ===");

    const links = Array.from(document.querySelectorAll("a[href]"));
    this.log(`Found ${links.length} links to test`);

    const brokenLinks = [];
    const workingLinks = [];

    for (const link of links) {
      const href = link.href;

      // Skip external links for now
      if (href.startsWith("http") && !href.includes("localhost")) {
        this.log(`Skipping external link: ${href}`);
        continue;
      }

      // Test internal links
      if (href.includes("localhost") || href.startsWith("/")) {
        try {
          const response = await fetch(href, { method: "HEAD" });
          if (response.ok) {
            workingLinks.push(href);
            this.log(`✓ Working link: ${href}`);
          } else {
            brokenLinks.push(href);
            this.log(`✗ Broken link: ${href} (${response.status})`, "ERROR");
          }
        } catch (error) {
          brokenLinks.push(href);
          this.log(`✗ Error testing link ${href}: ${error.message}`, "ERROR");
        }
      }
    }

    this.log(
      `Link test results: ${workingLinks.length} working, ${brokenLinks.length} broken`
    );

    if (brokenLinks.length > 0) {
      this.errors.push(`${brokenLinks.length} broken links found`);
    }

    return brokenLinks.length === 0;
  }

  async testImages() {
    this.log("=== Testing Images ===");

    const images = Array.from(document.querySelectorAll("img"));
    this.log(`Found ${images.length} images to test`);

    const brokenImages = [];
    const workingImages = [];

    for (const img of images) {
      const src = img.src;

      if (src) {
        try {
          const response = await fetch(src, { method: "HEAD" });
          if (response.ok) {
            workingImages.push(src);
            this.log(`✓ Working image: ${src}`);
          } else {
            brokenImages.push(src);
            this.log(`✗ Broken image: ${src} (${response.status})`, "ERROR");
          }
        } catch (error) {
          brokenImages.push(src);
          this.log(`✗ Error testing image ${src}: ${error.message}`, "ERROR");
        }
      }
    }

    this.log(
      `Image test results: ${workingImages.length} working, ${brokenImages.length} broken`
    );

    if (brokenImages.length > 0) {
      this.errors.push(`${brokenImages.length} broken images found`);
    }

    return brokenImages.length === 0;
  }

  async testResponsiveDesign() {
    this.log("=== Testing Responsive Design ===");

    const viewports = [
      { width: 1920, height: 1080, name: "Desktop" },
      { width: 768, height: 1024, name: "Tablet" },
      { width: 375, height: 667, name: "Mobile" },
    ];

    for (const viewport of viewports) {
      // Simulate viewport change
      window.innerWidth = viewport.width;
      window.innerHeight = viewport.height;
      window.dispatchEvent(new Event("resize"));

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check for horizontal scrolling
      const hasHorizontalScroll =
        document.documentElement.scrollWidth > window.innerWidth;

      if (hasHorizontalScroll) {
        this.log(
          `⚠ Horizontal scrolling detected on ${viewport.name}`,
          "WARNING"
        );
        this.warnings.push(`Horizontal scroll on ${viewport.name}`);
      } else {
        this.log(`✓ No horizontal scrolling on ${viewport.name}`);
      }
    }

    // Reset to original size
    window.innerWidth = 1920;
    window.innerHeight = 1080;
    window.dispatchEvent(new Event("resize"));
  }

  async testAccessibility() {
    this.log("=== Testing Accessibility ===");

    // Check for alt text on images
    const images = Array.from(document.querySelectorAll("img"));
    const imagesWithoutAlt = images.filter((img) => !img.alt);

    if (imagesWithoutAlt.length > 0) {
      this.log(
        `⚠ ${imagesWithoutAlt.length} images without alt text`,
        "WARNING"
      );
      this.warnings.push(`${imagesWithoutAlt.length} images missing alt text`);
    } else {
      this.log("✓ All images have alt text");
    }

    // Check for proper heading structure
    const headings = Array.from(
      document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    );
    const headingLevels = headings.map((h) => parseInt(h.tagName.charAt(1)));

    let hasProperStructure = true;
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] - headingLevels[i - 1] > 1) {
        hasProperStructure = false;
        break;
      }
    }

    if (hasProperStructure) {
      this.log("✓ Proper heading structure");
    } else {
      this.log("⚠ Improper heading structure", "WARNING");
      this.warnings.push("Improper heading structure");
    }

    // Check for focus indicators
    const focusableElements = document.querySelectorAll(
      "button, a, input, textarea, select"
    );
    let hasFocusStyles = false;

    for (const element of focusableElements) {
      if (
        getComputedStyle(element).outline !== "none" ||
        getComputedStyle(element).boxShadow !== "none"
      ) {
        hasFocusStyles = true;
        break;
      }
    }

    if (hasFocusStyles) {
      this.log("✓ Focus indicators present");
    } else {
      this.log("⚠ No focus indicators detected", "WARNING");
      this.warnings.push("No focus indicators");
    }
  }

  async runAllTests() {
    this.log("🚀 Starting Browser Test Suite");
    this.log(`Testing URL: ${window.location.href}`);

    try {
      await this.testPageLoad();
      await this.testChatbotFunctionality();
      await this.testContactForm();
      await this.testLinks();
      await this.testImages();
      await this.testResponsiveDesign();
      await this.testAccessibility();

      // Summary
      const endTime = Date.now();
      const duration = (endTime - this.startTime) / 1000;

      this.log("=== Test Summary ===");
      this.log(`Total tests run: ${this.results.length}`);
      this.log(`Errors: ${this.errors.length}`);
      this.log(`Warnings: ${this.warnings.length}`);
      this.log(`Duration: ${duration.toFixed(2)} seconds`);

      if (this.errors.length > 0) {
        this.log("❌ ERRORS FOUND:", "ERROR");
        this.errors.forEach((error) => this.log(`  - ${error}`, "ERROR"));
      }

      if (this.warnings.length > 0) {
        this.log("⚠️ WARNINGS:", "WARNING");
        this.warnings.forEach((warning) =>
          this.log(`  - ${warning}`, "WARNING")
        );
      }

      if (this.errors.length === 0) {
        this.log("✅ All critical tests passed!", "SUCCESS");
      } else {
        this.log("❌ Some tests failed. Please fix the errors above.", "ERROR");
      }

      // Save results to localStorage
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const testResults = {
        timestamp,
        results: this.results,
        errors: this.errors,
        warnings: this.warnings,
        duration,
      };

      localStorage.setItem(
        "portfolio-test-results",
        JSON.stringify(testResults)
      );
      this.log("Test results saved to localStorage");
    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, "ERROR");
    }
  }
}

// Create and run the test suite
const testSuite = new BrowserTestSuite();
testSuite.runAllTests();

// Export for manual use
window.PortfolioTestSuite = BrowserTestSuite;
