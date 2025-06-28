// Message formatting function with all button types and love mode support
export function formatMessage(
  content: string,
  isLoveMode: boolean = false,
  onButtonClick?: (type: string) => void
) {
  let formatted = content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>")
    // Replace dashes with proper bullet points with better spacing
    .replace(/^- /gm, "• ")
    .replace(/\n- /g, "\n• ")
    .replace(/<br>- /g, "<br>• ")
    // Improve spacing between paragraphs
    .replace(/<br><br>/g, "<br><div style='height: 6px;'></div><br>");

  // Replace custom button tags with consistent, mobile-responsive buttons
  const baseButtonClass = "inline-flex items-center px-3 py-1.5 sm:px-2 sm:py-1 bg-gradient-to-r text-white rounded-md font-medium text-sm sm:text-xs shadow-md hover:shadow-lg transition-all duration-200 mx-1 my-1 cursor-pointer min-h-[36px] sm:min-h-[32px] touch-manipulation";
  
  formatted = formatted
    .replace(
      /<button-experience>(.*?)<\/button-experience>/g,
      `<button onclick="window.chatbotButtonClick('experience')" class="${baseButtonClass} from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">$1</button>`
    )
    .replace(
      /<button-skills>(.*?)<\/button-skills>/g,
      `<button onclick="window.chatbotButtonClick('skills')" class="${baseButtonClass} from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">$1</button>`
    )
    .replace(
      /<button-projects>(.*?)<\/button-projects>/g,
      `<button onclick="window.chatbotButtonClick('projects')" class="${baseButtonClass} from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">$1</button>`
    )
    .replace(
      /<button-funfact>(.*?)<\/button-funfact>/g,
      `<button onclick="window.chatbotButtonClick('funfact')" class="${baseButtonClass} from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700">$1</button>`
    )
    .replace(
      /<button-message>(.*?)<\/button-message>/g,
      `<button onclick="window.chatbotButtonClick('message')" class="${baseButtonClass} from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">$1</button>`
    )
    .replace(
      /<button-meeting>(.*?)<\/button-meeting>/g,
      `<button onclick="window.chatbotButtonClick('meeting')" class="${baseButtonClass} from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">$1</button>`
    )
    .replace(
      /<button-upload>(.*?)<\/button-upload>/g,
      `<button onclick="window.chatbotButtonClick('upload')" class="${baseButtonClass} from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700">$1</button>`
    )
    .replace(
      /<button-generate-question>(.*?)<\/button-generate-question>/g,
      `<button onclick="window.chatbotButtonClick('generate-question')" class="${baseButtonClass} from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">$1</button>`
    )
    .replace(
      /<button-expired>(.*?)<\/button-expired>/g,
      `<button onclick="window.open('https://expiredsolutions.com', '_blank')" class="${baseButtonClass} from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">$1</button>`
    )
    .replace(
      /<button-tutora>(.*?)<\/button-tutora>/g,
      `<button onclick="window.open('https://www.tutoraprep.com/', '_blank')" class="${baseButtonClass} from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">$1</button>`
    )
    .replace(
      /<button-pmhappyhour>(.*?)<\/button-pmhappyhour>/g,
      `<button onclick="window.open('https://www.notion.so/pmhappyhour/PM-Happy-Hour-37b20a5dc2ea481e8e3437a95811e54b', '_blank')" class="${baseButtonClass} from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700">$1</button>`
    )
    .replace(
      /<button-pmhappyhour-work>(.*?)<\/button-pmhappyhour-work>/g,
      `<button onclick="window.open('https://drive.google.com/drive/folders/1FtSQeY0fkwUsOa2SeMbfyk4ivYcj9AUs?usp=drive_link', '_blank')" class="${baseButtonClass} from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">$1</button>`
    )
    .replace(
      /<button-pmhh-projects>(.*?)<\/button-pmhh-projects>/g,
      `<button onclick="window.open('https://drive.google.com/drive/folders/1FtSQeY0fkwUsOa2SeMbfyk4ivYcj9AUs?usp=sharing', '_blank')" class="${baseButtonClass} from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">$1</button>`
    )
    .replace(
      /<button-mturk>(.*?)<\/button-mturk>/g,
      `<button onclick="window.open('https://www.mturk.com/', '_blank')" class="${baseButtonClass} from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700">$1</button>`
    )
    .replace(
      /<button-linkedin>(.*?)<\/button-linkedin>/g,
      `<button onclick="window.open('https://www.linkedin.com/in/lawrencehua/', '_blank')" class="${baseButtonClass} from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">$1</button>`
    )
    .replace(
      /<button-resume>(.*?)<\/button-resume>/g,
      `<button onclick="window.open('/Lawrence_Hua_Resume_June_2025.pdf', '_blank')" class="${baseButtonClass} from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800">$1</button>`
    )
    .replace(
      /<button-testimonials>(.*?)<\/button-testimonials>/g,
      `<button onclick="(() => { const testimonialsSection = document.getElementById('testimonials'); if (testimonialsSection) { testimonialsSection.scrollIntoView({ behavior: 'smooth' }); } })()" class="${baseButtonClass} from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700">$1</button>`
    )
    .replace(
      /<button-about>(.*?)<\/button-about>/g,
      `<button onclick="(() => { const aboutSection = document.getElementById('about'); if (aboutSection) { aboutSection.scrollIntoView({ behavior: 'smooth' }); } })()" class="${baseButtonClass} from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">$1</button>`
    )
    .replace(
      /<button-netflix>(.*?)<\/button-netflix>/g,
      `<button onclick="window.open('https://docs.google.com/presentation/d/1G8CHLYjhbST7aTZ-ghWIaQ38CgRdV86MnioyHiZanTM/edit?slide=id.g31d10e42dea_0_0#slide=id.g31d10e42dea_0_0', '_blank')" class="${baseButtonClass} from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">$1</button>`
    );

  // Handle special scroll-to-projects button that closes chatbot
  formatted = formatted.replace(
    /<button-projects-scroll>(.*?)<\/button-projects-scroll>/g,
    `<button onclick="window.scrollToProjectsAndClose && window.scrollToProjectsAndClose()" class="${baseButtonClass} from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl">$1</button>`
  );

  // Wrap button groups for better display
  formatted = formatted.replace(
    /(<button[^>]*>.*?<\/button>(?:\s*<button[^>]*>.*?<\/button>)+)/g,
    '<div style="display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; align-items: center;">$1</div>'
  );

  // Special styling for typed commands - make them more visible and attractive
  formatted = formatted
    .replace(
      /`\/message`/g,
      '<span class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 mx-1">/message</span>'
    )
    .replace(
      /`\/meeting`/g,
      '<span class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 mx-1">/meeting</span>'
    );

  // Handle other code blocks (not commands)
  formatted = formatted.replace(
    /`([^\/][^`]*)`/g,
    '<code class="bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono text-sm border border-blue-200">$1</code>'
  );

  // Add love-themed styling if in love mode
  if (isLoveMode) {
    formatted = formatted
      .replace(
        /Myley/g,
        '<span class="text-pink-600 font-semibold">Myley</span>'
      )
      .replace(/love/g, '<span class="text-red-500 font-medium">love</span>')
      .replace(
        /beautiful/g,
        '<span class="text-purple-500 font-medium">beautiful</span>'
      )
      .replace(/sweet/g, '<span class="text-pink-500 font-medium">sweet</span>')
      .replace(/heart/g, '<span class="text-red-500">❤️</span>')
      .replace(/💕/g, '<span class="text-pink-500">💕</span>');
  }

  return formatted;
} 