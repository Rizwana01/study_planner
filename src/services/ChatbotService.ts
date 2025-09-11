interface ChatResponse {
  patterns: string[];
  responses: string[];
}

export class ChatbotService {
  private static responses: ChatResponse[] = [
    {
      patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
      responses: [
        "Hello! Ready to crush your study goals today? 💪",
        "Hi there! I'm excited to help you study effectively! 📚",
        "Hey! Let's make today a productive study day! ✨"
      ]
    },
    {
      patterns: ['motivation', 'motivate', 'inspire', 'encourage'],
      responses: [
        "Remember, every expert was once a beginner! You're building your expertise one study session at a time. 🌟",
        "Your future self will thank you for the effort you put in today. Keep going! 🚀",
        "Small daily improvements lead to stunning long-term results. You've got this! 💫",
        "The fact that you're here studying shows your commitment to growth. That's already a win! 🏆"
      ]
    },
    {
      patterns: ['study tips', 'how to study', 'study better', 'study advice'],
      responses: [
        "Here are some proven study techniques:\n• 🍅 Use the Pomodoro Technique (25 min focus + 5 min break)\n• 📝 Practice active recall by testing yourself\n• 🔄 Use spaced repetition for long-term retention\n• 🎯 Set specific, achievable goals for each session",
        "Try these effective study strategies:\n• 🧠 Teach the concept to someone else (or imagine you are)\n• 🗂️ Create mind maps to visualize connections\n• 📚 Switch between different subjects to avoid fatigue\n• 🌅 Study during your peak energy hours",
        "Boost your study effectiveness with:\n• 📱 Remove distractions (put phone in another room)\n• 💡 Use the Feynman Technique: explain concepts simply\n• ✍️ Take handwritten notes for better retention\n• 🏃‍♂️ Take regular breaks to maintain focus"
      ]
    },
    {
      patterns: ['focus', 'concentration', 'distracted', 'cant focus'],
      responses: [
        "Struggling with focus? Try this:\n• 🎧 Use background music or white noise\n• 🧘 Do a 5-minute meditation before studying\n• 💧 Stay hydrated and maintain good posture\n• 🎯 Set a specific intention for your study session",
        "To improve concentration:\n• 📍 Study in the same place consistently\n• 🌡️ Keep your study space at a comfortable temperature\n• 🕐 Use time-blocking to dedicate specific periods to study\n• 🎪 Try the 'Two-Minute Rule': commit to just 2 minutes to build momentum",
        "Focus boosters that work:\n• 🍎 Eat brain-healthy snacks (nuts, fruits)\n• 💪 Do 10 jumping jacks to wake up your brain\n• 📖 Start with easier material to build confidence\n• 🔔 Use apps or timers to maintain study intervals"
      ]
    },
    {
      patterns: ['stressed', 'overwhelmed', 'anxious', 'pressure'],
      responses: [
        "Feeling overwhelmed is normal! Try these stress-busters:\n• 🌬️ Take deep breaths: inhale for 4, hold for 4, exhale for 4\n• 📝 Write down your worries to get them out of your head\n• 🧩 Break large tasks into smaller, manageable pieces\n• 🎮 Take regular breaks to prevent burnout",
        "When stress hits, remember:\n• 🌊 This feeling is temporary and will pass\n• 🎯 Focus on progress, not perfection\n• 💬 Talk to someone you trust about your concerns\n• 🛌 Prioritize sleep - your brain needs rest to function well",
        "Stress management tips:\n• 🏃‍♀️ Get some physical exercise to release tension\n• 🎵 Listen to calming music during breaks\n• 🙏 Practice gratitude - list 3 things you're thankful for\n• ⏰ Remember that you have more time than you think"
      ]
    },
    {
      patterns: ['time management', 'schedule', 'planning', 'organize'],
      responses: [
        "Smart time management strategies:\n• 📅 Use a planner or digital calendar\n• ⭐ Identify your 3 Most Important Tasks (MITs) daily\n• ⏰ Time-block your schedule with specific activities\n• 🔄 Review and adjust your plan weekly",
        "Get organized with these tips:\n• 🎯 Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)\n• 📊 Use the Eisenhower Matrix: Important vs Urgent\n• 🍅 Try time-boxing: assign fixed time periods to tasks\n• 📝 Keep a 'done' list to track your progress",
        "Time management hacks:\n• ⏰ Use the 'Two-Minute Rule': if it takes less than 2 minutes, do it now\n• 📱 Batch similar tasks together\n• 🚫 Learn to say no to non-essential activities\n• 🎯 Focus on outcomes, not just activities"
      ]
    },
    {
      patterns: ['procrastination', 'procrastinating', 'lazy', 'dont want to study'],
      responses: [
        "Beat procrastination with these tricks:\n• 🚀 Just start for 5 minutes - momentum builds naturally\n• 🍰 Use the 'Swiss Cheese' method: poke holes in big tasks\n• 🎁 Promise yourself a small reward after studying\n• 📍 Change your environment to a dedicated study space",
        "Overcome procrastination by:\n• 🔥 Identifying your 'why' - connect studies to your goals\n• 👥 Finding an accountability partner\n• 📊 Making the task smaller and less intimidating\n• ⚡ Using the '2-minute rule' to build momentum",
        "Anti-procrastination strategies:\n• 🎯 Clarify exactly what needs to be done\n• 🏆 Celebrate small wins along the way\n• 💡 Work during your peak energy times\n• 🚫 Eliminate decision fatigue by planning ahead"
      ]
    },
    {
      patterns: ['memory', 'remember', 'memorize', 'retention'],
      responses: [
        "Boost your memory with:\n• 🔄 Spaced repetition - review at increasing intervals\n• 🏠 Use the Memory Palace technique\n• 🎭 Create vivid, unusual mental images\n• 🔗 Connect new info to what you already know",
        "Memory enhancement tips:\n• ✍️ Write it down - the act of writing helps retention\n• 🗣️ Say it out loud - engage multiple senses\n• 🎵 Create songs or rhymes for important facts\n• 🧩 Use acronyms and mnemonics",
        "Improve retention by:\n• 🛌 Getting quality sleep - memories consolidate during sleep\n• 🏃‍♂️ Exercising regularly - it boosts brain function\n• 📚 Testing yourself frequently instead of just re-reading\n• 🎨 Using visual aids like diagrams and mind maps"
      ]
    },
    {
      patterns: ['thank you', 'thanks', 'appreciate'],
      responses: [
        "You're very welcome! Remember, I'm here whenever you need study support! 🤗",
        "Happy to help! Keep up the great work with your studies! 🌟",
        "My pleasure! You're doing amazing by investing in your education! 📚✨"
      ]
    },
    {
      patterns: ['bye', 'goodbye', 'see you', 'later'],
      responses: [
        "Goodbye! Go crush those study goals! You've got this! 💪📚",
        "See you later! Remember to take breaks and stay hydrated while studying! 🌟",
        "Bye for now! I believe in you - make every study session count! 🚀"
      ]
    }
  ];

  private static defaultResponses = [
    "That's interesting! Tell me more about your study challenges. I'm here to help! 🤔",
    "I understand. What specific aspect of studying would you like help with today? 📚",
    "Great question! Is there a particular subject or study technique you'd like to focus on? 💡",
    "I'm here to support your learning journey. What's your biggest study challenge right now? 🎯",
    "That's a good point! How can I help you study more effectively? ✨"
  ];

  static getResponse(input: string): string {
    const lowercaseInput = input.toLowerCase();
    
    // Find matching pattern
    for (const responseSet of this.responses) {
      for (const pattern of responseSet.patterns) {
        if (lowercaseInput.includes(pattern)) {
          const randomResponse = responseSet.responses[
            Math.floor(Math.random() * responseSet.responses.length)
          ];
          return randomResponse;
        }
      }
    }

    // Return default response if no pattern matches
    return this.defaultResponses[
      Math.floor(Math.random() * this.defaultResponses.length)
    ];
  }
}