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
    // Replace dashes with bullet points
    .replace(/^- /gm, "• ")
    .replace(/\n- /g, "\n• ")
    .replace(/<br>- /g, "<br>• ");

  // Replace custom button tags with actual clickable buttons (mobile-responsive)
  formatted = formatted
    .replace(
      /<button-experience>(.*?)<\/button-experience>/g,
      '<button onclick="window.chatbotButtonClick(\'experience\')" class="inline-flex items-center px-2 py-1 sm:px-1.5 sm:py-0.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-md font-medium text-sm sm:text-xs shadow hover:shadow-md transition-all duration-200 mx-1 my-1 sm:mx-0.5 sm:my-0.5 cursor-pointer min-h-[32px] sm:min-h-auto touch-manipulation">$1</button>'
    )
    .replace(
      /<button-skills>(.*?)<\/button-skills>/g,
      '<button onclick="window.chatbotButtonClick(\'skills\')" class="inline-flex items-center px-2 py-1 sm:px-1.5 sm:py-0.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-md font-medium text-sm sm:text-xs shadow hover:shadow-md transition-all duration-200 mx-1 my-1 sm:mx-0.5 sm:my-0.5 cursor-pointer min-h-[32px] sm:min-h-auto touch-manipulation">$1</button>'
    )
    .replace(
      /<button-projects>(.*?)<\/button-projects>/g,
      '<button onclick="window.chatbotButtonClick(\'projects\')" class="inline-flex items-center px-2 py-1 sm:px-1.5 sm:py-0.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-md font-medium text-sm sm:text-xs shadow hover:shadow-md transition-all duration-200 mx-1 my-1 sm:mx-0.5 sm:my-0.5 cursor-pointer min-h-[32px] sm:min-h-auto touch-manipulation">$1</button>'
    )
    .replace(
      /<button-funfact>(.*?)<\/button-funfact>/g,
      '<button onclick="window.chatbotButtonClick(\'funfact\')" class="inline-flex items-center px-2 py-1 sm:px-1.5 sm:py-0.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-md font-medium text-sm sm:text-xs shadow hover:shadow-md transition-all duration-200 mx-1 my-1 sm:mx-0.5 sm:my-0.5 cursor-pointer min-h-[32px] sm:min-h-auto touch-manipulation">$1</button>'
    )
    .replace(
      /<button-message>(.*?)<\/button-message>/g,
      '<button onclick="window.chatbotButtonClick(\'message\')" class="inline-flex items-center px-2 py-1 sm:px-1.5 sm:py-0.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md font-medium text-sm sm:text-xs shadow hover:shadow-md transition-all duration-200 mx-1 my-1 sm:mx-0.5 sm:my-0.5 cursor-pointer min-h-[32px] sm:min-h-auto touch-manipulation">$1</button>'
    )
    .replace(
      /<button-meeting>(.*?)<\/button-meeting>/g,
      '<button onclick="window.chatbotButtonClick(\'meeting\')" class="inline-flex items-center px-2 py-1 sm:px-1.5 sm:py-0.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-md font-medium text-sm sm:text-xs shadow hover:shadow-md transition-all duration-200 mx-1 my-1 sm:mx-0.5 sm:my-0.5 cursor-pointer min-h-[32px] sm:min-h-auto touch-manipulation">$1</button>'
    )
    .replace(
      /<button-upload>(.*?)<\/button-upload>/g,
      '<button onclick="window.chatbotButtonClick(\'upload\')" class="inline-flex items-center px-2 py-1 sm:px-1.5 sm:py-0.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-md font-medium text-sm sm:text-xs shadow hover:shadow-md transition-all duration-200 mx-1 my-1 sm:mx-0.5 sm:my-0.5 cursor-pointer min-h-[32px] sm:min-h-auto touch-manipulation">$1</button>'
    )
    .replace(
      /<button-expired>(.*?)<\/button-expired>/g,
      "<button onclick=\"window.open('https://expiredsolutions.com', '_blank')\" class=\"inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer\">$1</button>"
    )
    .replace(
      /<button-tutora>(.*?)<\/button-tutora>/g,
      "<button onclick=\"window.open('https://www.tutoraprep.com/', '_blank')\" class=\"inline-flex items-center px-2 py-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer\">$1</button>"
    )
    .replace(
      /<button-pmhappyhour>(.*?)<\/button-pmhappyhour>/g,
      "<button onclick=\"window.open('https://www.notion.so/pmhappyhour/PM-Happy-Hour-37b20a5dc2ea481e8e3437a95811e54b', '_blank')\" class=\"inline-flex items-center px-2 py-1 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer\">$1</button>"
    )
    .replace(
      /<button-pmhappyhour-work>(.*?)<\/button-pmhappyhour-work>/g,
      "<button onclick=\"window.open('https://drive.google.com/drive/folders/1FtSQeY0fkwUsOa2SeMbfyk4ivYcj9AUs?usp=drive_link', '_blank')\" class=\"inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer\">$1</button>"
    )
    .replace(
      /<button-pmhh-projects>(.*?)<\/button-pmhh-projects>/g,
      "<button onclick=\"window.open('https://drive.google.com/drive/folders/1FtSQeY0fkwUsOa2SeMbfyk4ivYcj9AUs?usp=sharing', '_blank')\" class=\"inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer\">$1</button>"
    )
    .replace(
      /<button-mturk>(.*?)<\/button-mturk>/g,
      "<button onclick=\"window.open('https://www.mturk.com/', '_blank')\" class=\"inline-flex items-center px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer\">$1</button>"
    )
    .replace(
      /<button-generate-question>(.*?)<\/button-generate-question>/g,
      '<button onclick="window.chatbotButtonClick(\'generate-question\')" class="inline-flex items-center px-2 py-1 sm:px-1.5 sm:py-0.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-md font-medium text-sm sm:text-xs shadow hover:shadow-md transition-all duration-200 mx-1 my-1 sm:mx-0.5 sm:my-0.5 cursor-pointer min-h-[32px] sm:min-h-auto touch-manipulation">$1</button>'
    )
    .replace(
      /<button-linkedin>(.*?)<\/button-linkedin>/g,
      "<button onclick=\"window.open('https://www.linkedin.com/in/lawrencehua/', '_blank')\" class=\"inline-flex items-center px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer\">$1</button>"
    )
    .replace(
      /<button-resume>(.*?)<\/button-resume>/g,
      "<button onclick=\"window.open('/Lawrence_Hua_Resume_June_2025.pdf', '_blank')\" class=\"inline-flex items-center px-2 py-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer\">$1</button>"
    )
    .replace(
      /<button-testimonials>(.*?)<\/button-testimonials>/g,
      "<button onclick=\"(() => { const testimonialsSection = document.getElementById('testimonials'); if (testimonialsSection) { testimonialsSection.scrollIntoView({ behavior: 'smooth' }); alert('Check out what people say about working with Lawrence!'); } else { alert('Testimonials section not found. Please scroll down to see testimonials.'); } })()\" class=\"inline-flex items-center px-2 py-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer\">$1</button>"
    )
    .replace(
      /<button-about>(.*?)<\/button-about>/g,
      "<button onclick=\"(() => { const aboutSection = document.getElementById('about'); if (aboutSection) { aboutSection.scrollIntoView({ behavior: 'smooth' }); alert('Learn more about Lawrence\\'s background and journey!'); } else { alert('About section not found. Please scroll down to learn more about Lawrence.'); } })()\" class=\"inline-flex items-center px-2 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer\">$1</button>"
    )
    .replace(
      /<button-netflix>(.*?)<\/button-netflix>/g,
      "<button onclick=\"window.open('https://docs.google.com/presentation/d/1G8CHLYjhbST7aTZ-ghWIaQ38CgRdV86MnioyHiZanTM/edit?slide=id.g31d10e42dea_0_0#slide=id.g31d10e42dea_0_0', '_blank')\" class=\"inline-flex items-center px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer\">$1</button>"
    );

  // Handle special scroll-to-projects button that closes chatbot
  formatted = formatted.replace(
    /<button-projects-scroll>(.*?)<\/button-projects-scroll>/g,
    "<button onclick=\"window.scrollToProjectsAndClose && window.scrollToProjectsAndClose()\" class=\"inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-200 mx-0.5 my-1 cursor-pointer\">$1</button>"
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