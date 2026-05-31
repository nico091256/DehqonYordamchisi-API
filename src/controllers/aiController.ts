import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * @openapi
 * /api/ai/chat:
 *   post:
 *     tags: [AI]
 *     summary: Chat with Dehqon AI agronomic assistant
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [messages]
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [role, content]
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, model]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: Success response from Gemini AI
 */
export const chatWithAI = async (req: AuthRequest, res: Response) => {
  const { messages } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: 'Invalid messages array provided' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing from environment variables');
    return res.status(500).json({ message: 'AI configuration error on the server' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: "Siz o'zbekistonlik dehqonlar va xaridorlarga yordam beradigan professional sun'iy intellekt yordamchisiz. Ismingiz: Dehqon AI. Siz qishloq xo'jaligi, ekinlar, sug'orish, o'g'itlar, o'simliklar parvarishi, bozor narxlari va dehqonchilik bo'yicha foydali va amaliy maslahatlar berasiz. Har doim o'zbek tilida, do'stona, samimiy va professional tonda javob bering. Foydalanuvchiga to'liq va amaliy ko'rsatmalar taqdim eting.",
    });

    // Format chat history according to Gemini SDK guidelines
    const formattedHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const latestMessage = messages[messages.length - 1].content;

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(latestMessage);
    const responseText = result.response.text();

    return res.json({ response: responseText });
  } catch (error: any) {
    console.error('Error in chatWithAI controller:', error);
    return res.status(500).json({
      message: 'Failed to generate response from Dehqon AI',
      error: error.message || error,
    });
  }
};
