import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 3000);

const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const timezone = process.env.TZ || 'Asia/Kolkata';

const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

const openRouterKey = process.env.OPENROUTER_API_KEY || '';

const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || 'openrouter/free';

app.use(express.json({ limit: '64kb' }));

app.use(
  express.static(
    path.join(__dirname, '../frontend')
  )
);


// =====================================
// INDIA DATE & TIME
// =====================================

function indiaDateTime() {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(new Date());
}


// =====================================
// CLEAN CHAT MESSAGES
// =====================================

function cleanMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter(
      (message) =>
        (
          message?.role === 'user' ||
          message?.role === 'assistant'
        ) &&
        typeof message?.content === 'string' &&
        message.content.trim()
    )
    .slice(-12)
    .map((message) => ({
      role: message.role,
      content: message.content
        .trim()
        .slice(0, 4000)
    }));
}


// =====================================
// SYSTEM PROMPT
// =====================================

function systemPrompt() {
  return `
You are Gaurav AI, a smart, friendly and practical personal AI assistant for Gaurav.

Current India date and time:
${indiaDateTime()}

IMPORTANT RULES:

1. Answer the user's latest question directly.

2. Always understand the complete conversation context.

3. Never answer only with a greeting when the user has asked a real question.

4. If the user speaks Hinglish, reply naturally in Hinglish.

5. If the user speaks Hindi, reply in Hindi/Hinglish.

6. If the user speaks English, reply in English.

7. For date and time questions, use the current India date and time provided above.

8. If the user asks about:
   - aaj
   - today
   - kal
   - tomorrow
   - yesterday
   - current date
   - current time

   give the correct India date/time.

9. Help with:
   - HTML
   - CSS
   - JavaScript
   - Node.js
   - Websites
   - Games
   - AI
   - Coding
   - Mathematics
   - General knowledge
   - Explanations
   - Ideas
   - Planning
   - Everyday questions

10. For coding questions, provide working code and clearly mention the file where it belongs.

11. Keep normal answers clear and reasonably concise.

12. If the user asks for detailed information, provide a detailed answer.

13. Never claim that you changed a file, started a server, stopped a server, sent something, or performed an external action unless the application actually performed it.

14. If the user's request is unclear, ask one short clarification.

15. Be friendly, practical and natural.

16. Your name is Gaurav AI.
`;
}


// =====================================
// GEMINI CHAT
// =====================================

async function askGemini(safeMessages) {
  if (!geminiClient) {
    throw new Error('GEMINI_NOT_CONFIGURED');
  }

  const contents = safeMessages.map((message) => ({
    role: message.role === 'assistant'
      ? 'model'
      : 'user',

    parts: [
      {
        text: message.content
      }
    ]
  }));

  const response =
    await geminiClient.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: systemPrompt()
      }
    });

  const reply = response?.text?.trim();

  if (!reply) {
    throw new Error('GEMINI_EMPTY_RESPONSE');
  }

  return reply;
}


// =====================================
// OPENROUTER FALLBACK
// =====================================

async function askOpenRouter(safeMessages) {
  if (!openRouterKey) {
    throw new Error('OPENROUTER_NOT_CONFIGURED');
  }

  const messages = [
    {
      role: 'system',
      content: systemPrompt()
    },

    ...safeMessages.map((message) => ({
      role: message.role,
      content: message.content
    }))
  ];

  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',

      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer':
          'https://gaurav-ai-3vwp.onrender.com',
        'X-Title': 'Gaurav AI'
      },

      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        max_tokens: 1000
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data?.error?.message ||
      `OpenRouter request failed (${response.status})`
    );

    error.status = response.status;

    throw error;
  }

  const reply =
    data?.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error(
      'OPENROUTER_EMPTY_RESPONSE'
    );
  }

  return reply;
}


// =====================================
// HEALTH CHECK
// =====================================

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,

    aiConfigured: Boolean(
      geminiClient || openRouterKey
    ),

    geminiConfigured:
      Boolean(geminiClient),

    openRouterConfigured:
      Boolean(openRouterKey),

    model,

    openRouterModel:
      OPENROUTER_MODEL,

    timezone,

    indiaDateTime:
      indiaDateTime()
  });
});


// =====================================
// AI CHAT
// =====================================

app.post('/api/chat', async (req, res) => {

  const safeMessages =
    cleanMessages(
      req.body?.messages
    );

  if (
    !safeMessages.length ||
    safeMessages.at(-1).role !== 'user'
  ) {
    return res.status(400).json({
      error:
        'A user message is required.'
    });
  }


  // ===================================
  // TRY GEMINI FIRST
  // ===================================

  if (geminiClient) {

    try {

      const reply =
        await askGemini(
          safeMessages
        );

      console.log(
        `[GEMINI] ${safeMessages.at(-1).content}`
      );

      console.log(
        `[AI] ${reply}`
      );

      return res.json({
        reply,
        provider: 'gemini'
      });

    } catch (error) {

      console.error(
        '[Gemini]',
        error?.status || '',
        error?.message || error
      );

      console.log(
        '[FALLBACK] Gemini failed. Trying OpenRouter...'
      );
    }
  }


  // ===================================
  // TRY OPENROUTER FALLBACK
  // ===================================

  if (openRouterKey) {

    try {

      const reply =
        await askOpenRouter(
          safeMessages
        );

      console.log(
        `[OPENROUTER] ${safeMessages.at(-1).content}`
      );

      console.log(
        `[AI] ${reply}`
      );

      return res.json({
        reply,
        provider: 'openrouter'
      });

    } catch (error) {

      console.error(
        '[OpenRouter]',
        error?.status || '',
        error?.message || error
      );
    }
  }


  // ===================================
  // NO AI AVAILABLE
  // ===================================

  return res.status(503).json({

    error:
      'Gaurav AI abhi available nahi hai. Gemini quota/API aur OpenRouter backup check karo.'

  });

});


// =====================================
// FRONTEND FALLBACK
// =====================================

app.get(/.*/, (_req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      '../frontend/index.html'
    )
  );

});


// =====================================
// START SERVER
// =====================================

app.listen(port, () => {

  console.log(
    '================================='
  );

  console.log(
    '       GAURAV AI SERVER'
  );

  console.log(
    '================================='
  );

  console.log(
    `Server: http://localhost:${port}`
  );

  console.log(
    `Gemini Model: ${model}`
  );

  console.log(
    `OpenRouter Model: ${OPENROUTER_MODEL}`
  );

  console.log(
    `Gemini: ${
      geminiClient
        ? 'CONFIGURED'
        : 'NOT CONFIGURED'
    }`
  );

  console.log(
    `OpenRouter: ${
      openRouterKey
        ? 'CONFIGURED'
        : 'NOT CONFIGURED'
    }`
  );

  console.log(
    `Timezone: ${timezone} (IST)`
  );

  console.log(
    `India Time: ${indiaDateTime()}`
  );

  console.log(
    '================================='
  );

});
