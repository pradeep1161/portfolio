const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../models/db');

// Keyword-based fallback response engine
const getRuleBasedResponse = (message, portfolio) => {
  const msg = message.toLowerCase();
  const prof = portfolio.profile;

  if (msg.includes('project') || msg.includes('diabetic') || msg.includes('big-mart') || msg.includes('sales')) {
    const projectsText = portfolio.projects.map(p => 
      `- **${p.title}**: ${p.description}\n  *Tech Stack*: ${p.tech.join(', ')}\n  *Features*: ${p.features.join(', ')}`
    ).join('\n\n');
    return `Pradeep has built several notable projects, including:\n\n${projectsText}\n\nYou can click on the "Projects" section to see links to his code and live demos!`;
  }

  if (msg.includes('education') || msg.includes('college') || msg.includes('cgpa') || msg.includes('b.tech') || msg.includes('btech')) {
    const edu = portfolio.education[0];
    return `Pradeep is pursuing a **${edu.degree}** at **${edu.school}** (${edu.duration}). He currently holds a **${edu.grade}**.`;
  }

  if (msg.includes('skill') || msg.includes('language') || msg.includes('technology') || msg.includes('programming') || msg.includes('know')) {
    // Group skills by category
    const categories = {};
    portfolio.skills.forEach(s => {
      categories[s.category] = categories[s.category] || [];
      categories[s.category].push(s.name);
    });

    let skillsText = 'Pradeep is skilled in several areas:\n';
    Object.entries(categories).forEach(([cat, list]) => {
      skillsText += `- **${cat}**: ${list.join(', ')}\n`;
    });
    return skillsText;
  }

  if (msg.includes('experience') || msg.includes('work') || msg.includes('job') || msg.includes('internship')) {
    const exp = portfolio.experience[0];
    return `Currently, Pradeep is: **${exp.company}** for an **${exp.role}**.\n\nDescription: ${exp.description}`;
  }

  if (msg.includes('contact') || msg.includes('email') || msg.includes('phone') || msg.includes('reach') || msg.includes('linkedin')) {
    return `You can reach Pradeep Tallapally via:\n- **Email**: ${prof.email}\n- **Location**: ${prof.location}\n- **GitHub**: ${prof.socials.github}\n- **LinkedIn**: ${prof.socials.linkedin}\n\nFeel free to send a message using the contact form at the bottom of the page!`;
  }

  if (msg.includes('certification') || msg.includes('ibm') || msg.includes('smart interviews')) {
    const certs = portfolio.certifications.map(c => `- **${c.title}** from ${c.issuer} (${c.date})`).join('\n');
    return `Pradeep holds the following certifications:\n${certs}`;
  }

  if (msg.includes('achievement') || msg.includes('rank') || msg.includes('codechef')) {
    const achs = portfolio.achievements.map(a => `- **${a.title}**: ${a.detail}`).join('\n');
    return `Pradeep has achieved:\n${achs}`;
  }

  return `Hello! I am Pradeep's AI Assistant. I can tell you about his:\n- **Education** (CGPA, college)\n- **Skills** (Python, Machine Learning, Web)\n- **Projects** (Diabetic eye disease diagnosis system, Big-Mart sales prediction)\n- **Experience** (Currently seeking AI/ML internships)\n- **Certifications & Achievements**\n- **Contact Info**\n\nWhat would you like to know?`;
};

exports.handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const portfolio = await db.getPortfolio();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Use local rule-based engine
      const reply = getRuleBasedResponse(message, portfolio);
      return res.status(200).json({ reply });
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    // Support shorthand names like '3.f' and map to the SDK model name.
    const rawModel = process.env.GEMINI_MODEL;
    let modelName;
    if (rawModel) {
      const normalized = rawModel.toLowerCase();
      if (normalized === '3.f' || normalized === '3f' || normalized.includes('3.f') || normalized.includes('3f')) {
        modelName = 'gemini-3f-flash-latest';
        console.warn(`GEMINI_MODEL shorthand '${rawModel}' mapped to '${modelName}'.`);
      } else if (normalized === '2.5' || normalized === '2.5-flash' || normalized.includes('2.5')) {
        modelName = 'gemini-2.5-flash';
        console.warn(`GEMINI_MODEL shorthand '${rawModel}' mapped to '${modelName}'.`);
      } else {
        modelName = rawModel;
      }
    } else {
      modelName = 'gemini-3f-flash-latest';
      console.warn(`GEMINI_MODEL not set — defaulting to ${modelName}. Set GEMINI_MODEL to your preferred model.`);
    }

    const model = genAI.getGenerativeModel({ model: modelName });

    const systemPrompt = `
You are Pradeep Tallapally's professional AI Assistant. Your goal is to represent Pradeep and answer questions from recruiters, mentors, and website visitors.

Here is Pradeep's official portfolio data:
${JSON.stringify(portfolio, null, 2)}

Instructions:
1. Act as a friendly, helpful, and professional assistant. You may speak in the first person plural ("We built...", "Pradeep is...") or as his personal assistant.
2. Keep answers concise, factual, and strictly based on the provided portfolio data.
3. If asked about things not mentioned in the portfolio, politely state that you do not have that information, but invite the user to contact Pradeep directly using the contact details provided.
4. Highlight his key strengths: AI & Machine Learning, his B.Tech at CMR Technical Campus, his CGPA (7.74), and his featured projects (especially the "AI-Driven System for Early Diagnosis and Prevention of Diabetic Eye Diseases" which uses Deep Learning, EfficientNetV2-S, and Grad-CAM).
5. Always remain professional, polite, and constructive.
`;

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: "Hello, who are you?" }] },
        { role: 'model', parts: [{ text: "Hello! I am Pradeep Tallapally's AI portfolio assistant. I can help answer questions about his skills, education, experience, and projects. What would you like to know?" }] }
      ]
    });

    // We send both the system prompt rules and the user query to ensure Gemini responds accurately.
    const prompt = `${systemPrompt}\n\nUser Question: ${message}`;
    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    if (err && err.status === 404) {
      console.warn('Received 404 from Generative AI API. The configured model may not be available for this API version. Set GEMINI_MODEL to a valid model or consult the API provider.');
    }
    // If Gemini fails, fallback to rules engine
    try {
      const portfolio = await db.getPortfolio();
      const reply = getRuleBasedResponse(req.body.message, portfolio);
      return res.status(200).json({ reply, notice: 'Fallback triggered due to API error' });
    } catch (fallbackErr) {
      return res.status(500).json({ message: 'Error in chat handler', error: err.message });
    }
  }
};
