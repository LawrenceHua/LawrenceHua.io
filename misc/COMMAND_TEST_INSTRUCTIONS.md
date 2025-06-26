# Command Testing Instructions

## How to Test `/message` and `/meeting` Commands

Your chatbot now supports command-based contact requests. Here's how to test both flows:

## Test 1: `/message` Command Flow

### Expected Flow:

1. User types: `/message`
2. Bot responds: "I'll help you send a message to Lawrence! What's your email address for the message?"
3. User provides email: `john.recruiter@techcorp.com`
4. Bot responds: "Got it! What is your message?"
5. User provides message: `Hi Lawrence, I have an exciting opportunity at TechCorp that would be perfect for your background. Would love to discuss!`
6. Bot responds: "✅ **Message Sent Successfully!** I've forwarded your message to Lawrence. He'll get back to you soon! 📧"

**Expected Result**: Lawrence should receive 1 email with the contact message.

## Test 2: `/meeting` Command Flow

### Expected Flow:

1. User types: `/meeting`
2. Bot responds: "I'll help you schedule a meeting with Lawrence! What's your email address for the meeting?"
3. User provides email: `sarah.manager@innovate.co`
4. Bot responds: "Perfect! What is your message about the meeting?"
5. User provides meeting message: `I would like to discuss a senior data scientist position at Innovate Co. We are impressed with your experience.`
6. Bot responds: "Great! When would you like to schedule the meeting? Please provide a date and time (for example: "Monday June 24th at 2pm EST" or "Tomorrow at 10am")."
7. User provides time: `Tomorrow at 2pm EST would be perfect`
8. Bot responds: "✅ **Meeting Request Sent Successfully!** I've forwarded your meeting request to Lawrence with your preferred time. He'll reach out to confirm the meeting details!"

**Expected Result**: Lawrence should receive 1 email with the meeting request.

## How to Test:

1. **Open your portfolio website**: http://localhost:3000 (or whichever port is running)
2. **Open the chatbot** (floating chat icon or chat interface)
3. **Test the /message flow** by following Test 1 steps exactly
4. **Test the /meeting flow** by following Test 2 steps exactly

## Important Notes:

- **Commands are case-sensitive**: Use `/message` and `/meeting` exactly
- **Regular questions should NOT trigger contact**: Asking "tell me about Lawrence" should give normal responses
- **Step-by-step process**: Each command requires the user to provide information step by step
- **Email validation**: The system detects email addresses automatically
- **Expected outcome**: You should receive **2 emails total** - one from the message command and one from the meeting command

## Verification:

After completing both tests, check your email (the email configured for receiving chatbot messages) for:

1. ✅ Message from john.recruiter@techcorp.com about TechCorp opportunity
2. ✅ Meeting request from sarah.manager@innovate.co about Innovate Co position

If both emails arrive, the command system is working perfectly! 🎉
