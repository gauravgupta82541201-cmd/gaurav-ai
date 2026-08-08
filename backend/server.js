import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 3000);

const model =
  process.env.GEMINI_MODEL || 'gemini-3.6-flash';

const timezone =
  process.env.TZ || 'Asia/Kolkata';

const client = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    })
  : null;

app.use(
  express.json({
    limit: '64kb'
  })
);

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
// HEALTH CHECK
// =====================================

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    aiConfigured: Boolean(client),
    model,
    timezone,
    indiaDateTime: indiaDateTime()
  });
});


// =====================================
// AI CHAT
// =====================================

app.post('/api/chat', async (req, res) => {

  // API key check
  if (!client) {
    return res.status(503).json({
      error:
        'GEMINI_API_KEY is not configured on the server.'
    });
  }


  // Clean messages
  const safeMessages =
    cleanMessages(
      req.body?.messages
    );


  // Validate request
  if (
    !safeMessages.length ||
    safeMessages.at(-1).role !== 'user'
  ) {
    return res.status(400).json({
      error:
        'A user message is required.'
    });
  }


  try {

    // Gemini conversation format
    const contents =
      safeMessages.map((message) => ({
        role:
          message.role === 'assistant'
            ? 'model'
            : 'user',

        parts: [
          {
            text: message.content
          }
        ]
      }));


    // =================================
    // GEMINI REQUEST
    // =================================

    const response =
      await client.models.generateContent({

        model,

        contents,

        config: {

          systemInstruction: `

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

8. If the user asks:
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

        `
        }
      });


    // =================================
    // GET AI REPLY
    // =================================

    const reply =
      response?.text?.trim();


    if (!reply) {

      return res.status(502).json({
        error:
          'AI returned an empty response.'
      });

    }


    // Server logs
    console.log(
      `[CHAT] ${safeMessages.at(-1).content}`
    );

    console.log(
      `[AI] ${reply}`
    );


    // Send response
    return res.json({
      reply
    });


  } catch (error) {

    console.error(
      '[Gemini]',
      error?.status || '',
      error?.message || error
    );


    // =================================
    // GEMINI QUOTA ERROR
    // =================================

    const errorStatus =
      Number(error?.status);


    if (errorStatus === 429) {

      return res.status(429).json({

        error:
          'Gemini ka free quota abhi khatam hai. Thodi der baad dobara try karo.'

      });

    }


    // =================================
    // OTHER ERRORS
    // =================================

    const status =
      Number.isInteger(errorStatus) &&
      errorStatus >= 400 &&
      errorStatus < 600

        ? errorStatus

        : 502;


    return res.status(status).json({

      error:
        'Gemini request failed. API key, model, quota ya server logs check karo.'

    });

  }

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
    `Model: ${model}`
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