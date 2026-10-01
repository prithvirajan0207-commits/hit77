import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn('GEMINI_API_KEY is not set in environment.');
}

// System instruction crafted specifically for rural Indian women empowerment
const SYSTEM_PROMPT = `You are "सखी सहेली" (Sakhi Saheli) - a loving, trustworthy, patient elder sister and village counselor (like a caring Anganwadi didi or Panchayat Bank Sakhi) who helps rural Indian women become financially independent and secure.

Your primary mission:
1. Help rural women easily understand and access government schemes (Lakhpati Didi, PM Mudra Yojana, PM Ujjwala Yojana, Sukanya Samriddhi Yojana, Stand-Up India, PM Vishwakarma, Deendayal Antyodaya Yojana - NRLM / Aajeevika, Free Sewing Machine Scheme, Ayushman Bharat Card, PM Matru Vandana Yojana, Kisan Credit Card for Animal Husbandry & Dairy, Ladli Behna, etc.).
2. Guide them on income-generating skills (tailoring & stitching, papad & pickle making, dairy farming, poultry, goat rearing, mushroom cultivation, village kirana/beauty parlour, handicraft, agarbatti, digital payments / UPI).
3. Explain everything in VERY SIMPLE, everyday words. Avoid complicated government or English bureaucratic jargon.
4. Keep answers friendly, respectful, and structured clearly:
   - 🌟 संक्षेप में बात (In 1-2 sweet, direct sentences: what it is and what she gets)
   - 💰 क्या लाभ मिलेगा (Exact benefit: money, subsidy, free machine, pension)
   - 📋 ज़रूरी कागज़ात (Documents needed: आधार कार्ड, बैंक खाता पासबुक, राशन कार्ड, फोटो)
   - 📍 कहाँ जाना है (Exact place: पंचायत भवन, ग्राम सेवक, जन सेवा केंद्र / CSC, आँगनवाड़ी, बैंक सखी)
   - 📞 मदद नंबर (Helpline number if relevant, e.g., 181, 14449, 1947)
5. IMPORTANT: Reply strictly in the language requested by the user. If the user asks in Hindi, answer in clear Devanagari Hindi. If in Bengali, Marathi, Telugu, Tamil, Gujarati, Punjabi, Odia, Bhojpuri, etc., answer respectfully in that language with native script.
6. Always address her affectionately and respectfully (e.g. "दीदी", "बहन", "बहनजी", "अक्का", "चेची", "बेन"). Encourage her that she can do it and build her own independent income!`;

// Chat API Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, language = 'Hindi', history = [], context = '' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (!ai) {
      res.status(503).json({
        error: 'Gemini API is not configured. Please set GEMINI_API_KEY.',
        reply: `नमस्ते दीदी! सरकार की योजनाओं और हुनर से जुड़ी किसी भी जानकारी के लिए आप अपने नज़दीकी पंचायत भवन या जन सेवा केंद्र (CSC) से भी संपर्क कर सकती हैं। (API Key Required)`
      });
      return;
    }

    // Prepare contents with conversation context
    const contents: any[] = [];

    // Add prior turns if present
    if (Array.isArray(history) && history.length > 0) {
      for (const turn of history.slice(-6)) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text || '' }],
        });
      }
    }

    // Add current user prompt with explicit language enforcement
    const userPromptWithMeta = `${context ? `[Context about selected scheme/topic: ${context}]\n\n` : ''}User Question: ${message}\n\nPlease respond in ${language} language, using simple words suitable for a rural Indian woman. Address her warmly with respect, and clearly outline the benefit, documents needed, and where to apply.`;

    contents.push({
      role: 'user',
      parts: [{ text: userPromptWithMeta }],
    });

    let replyText = '';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.7,
        },
      });
      replyText = response.text || '';
    } catch (err: any) {
      console.warn('gemini-3.8-flash call failed, trying gemini-3.1-flash-lite fallback...', err?.message);
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.7,
          },
        });
        replyText = fallbackResponse.text || '';
      } catch (fallbackErr: any) {
        console.error('All Gemini model calls failed:', fallbackErr?.message);
        // Fallback to grounded intelligent rural knowledge base
        replyText = getRuralGroundedResponse(message, language);
      }
    }

    if (!replyText) {
      replyText = getRuralGroundedResponse(message, language);
    }

    res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    const fallbackText = getRuralGroundedResponse(req.body.message || '', req.body.language || 'Hindi');
    res.json({ reply: fallbackText });
  }
});

// Grounded fallback response generator for common rural women questions
function getRuralGroundedResponse(query: string, language: string): string {
  const q = query.toLowerCase();

  if (q.includes('सिलाई') || q.includes('मशीन') || q.includes('दर्जी') || q.includes('sewing') || q.includes('tailor')) {
    return `नमस्ते दीदी! 🧵 सिलाई मशीन के लिए सरकार की 'पीएम विश्वकर्मा योजना' और 'मुफ्त सिलाई मशीन सहायता' सबसे बेहतरीन योजना है।

🌟 क्या लाभ मिलेगा:
• 5 से 15 दिन की मुफ्त आधुनिक सिलाई ट्रेनिंग
• ट्रेनिंग के दौरान ₹500 प्रतिदिन का भत्ता
• नई सिलाई मशीन खरीदने के लिए ₹15,000 का ई-वाउचर
• काम आगे बढ़ाने के लिए मात्र 5% ब्याज पर ₹1 से ₹3 लाख का आसान लोन

📋 जरूरी कागज़ात:
1. आधार कार्ड (मोबाइल नंबर लिंक हो)
2. बैंक खाता पासबुक
3. राशन कार्ड
4. पासपोर्ट साइज फोटो

📍 कहाँ जाना है:
अपने नज़दीकी 'जन सेवा केंद्र' (CSC Center) या ग्राम पंचायत में जाकर पीएम विश्वकर्मा दर्जी योजना का फॉर्म भरें।
📞 हेल्पलाइन: 18002677777`;
  }

  if (q.includes('लखपति') || q.includes('lakhpati') || q.includes('समूह') || q.includes('shg')) {
    return `नमस्ते दीदी! 💰 'लखपति दीदी योजना' के तहत सरकार महिला समूह की बहनों को सालाना ₹1 लाख से अधिक की कमाई तक पहुँचाने में मदद कर रही है।

🌟 मुख्य लाभ:
• बिना किसी ब्याज के ₹1 लाख से ₹5 लाख तक का सरकारी ऋण
• सिलाई, ब्यूटी पार्लर, डेयरी, अगरबत्ती या दुकान शुरू करने का मुफ्त प्रशिक्षण
• तैयार सामान को सरस मेलों और सरकारी बाजारों में बेचने की सुविधा

📋 जरूरी कागज़ात:
1. स्वयं सहायता समूह (SHG) का सदस्यता पत्र
2. आधार कार्ड और बैंक पासबुक
3. राशन कार्ड व निवास प्रमाण

📍 कहाँ जाना है:
अपने गांव की 'बैंक सखी', 'समूह सखी' या ग्राम पंचायत भवन में संपर्क करें।
📞 हेल्पलाइन: 1800-180-1551`;
  }

  if (q.includes('गैस') || q.includes('उज्ज्वला') || q.includes('ujjwala') || q.includes('सिलेंडर') || q.includes('चूल्हा')) {
    return `नमस्ते दीदी! 🔥 'प्रधानमंत्री उज्ज्वला योजना 2.0' में ग्रामीण महिलाओं के नाम पर मुफ्त गैस कनेक्शन मिलता है।

🌟 मुख्य लाभ:
• पहला भरा हुआ गैस सिलेंडर और गैस चूल्हा बिल्कुल मुफ्त!
• हर सिलेंडर रीफिल पर ₹300 की सीधी बैंक सब्सिडी

📋 जरूरी कागज़ात:
1. महिला का आधार कार्ड
2. राशन कार्ड (परिवार के सभी सदस्यों के नाम सहित)
3. बैंक खाता पासबुक
4. 2 पासपोर्ट फोटो

📍 कहाँ जाना है:
अपने नज़दीकी गैस एजेंसी (Indane, Bharat Gas या HP Gas) या जन सेवा केंद्र जाएं।
📞 हेल्पलाइन: 1800-266-6696`;
  }

  if (q.includes('सुकन्या') || q.includes('बेटी') || q.includes('sukanya') || q.includes('बच्ची')) {
    return `नमस्ते दीदी! 👧 'सुकन्या समृद्धि योजना' आपकी 10 साल तक की बिटिया के भविष्य के लिए सबसे उत्तम योजना है।

🌟 मुख्य लाभ:
• सरकार की सबसे ऊंची ब्याज दर: 8.2% वार्षिक
• मात्र ₹250 से डाकघर या बैंक में खाता शुरू
• बेटी के 18 वर्ष की होने पर उच्च शिक्षा के लिए 50% राशि निकालने की सुविधा

📋 जरूरी कागज़ात:
1. बेटी का जन्म प्रमाण पत्र
2. माता/पिता का आधार कार्ड और फोटो

📍 कहाँ जाना है:
गांव के सरकारी डाकघर (Post Office) या नज़दीकी बैंक शाखा जाएं।
📞 हेल्पलाइन: 1800-266-6868`;
  }

  if (q.includes('गाय') || q.includes('भैंस') || q.includes('डेयरी') || q.includes('पशु') || q.includes('बकरी') || q.includes('मुर्गी') || q.includes('dairy')) {
    return `नमस्ते दीदी! 🐄 पशुपालन व डेयरी के लिए सरकार की 'पशु किसान क्रेडिट कार्ड (KCC)' और पशुधन सब्सिडी योजना बहुत लाभदायक है।

🌟 मुख्य लाभ:
• बिना किसी ज़मीन की गारंटी के ₹1,60,000 का सस्ता पशु लोन (मात्र 4% ब्याज)
• गाय, भैंस, बकरी व मुर्गी पालन के लिए 25% से 50% तक सरकारी अनुदान

📋 जरूरी कागज़ात:
1. आधार कार्ड व बैंक पासबुक
2. निवास प्रमाण पत्र
3. पशु का स्वास्थ्य प्रमाण पत्र

📍 कहाँ जाना है:
ब्लॉक के सरकारी पशु चिकित्सालय (Veterinary Hospital) या बैंक शाखा में संपर्क करें।
📞 किसान हेल्पलाइन: 1800-180-1551`;
  }

  if (q.includes('आयुष्मान') || q.includes('इलाज') || q.includes('दवा') || q.includes('अस्पताल') || q.includes('ayushman')) {
    return `नमस्ते दीदी! 🏥 'आयुष्मान भारत कार्ड' से आपके पूरे परिवार को हर साल ₹5 लाख तक का मुफ्त अस्पताल इलाज मिलता है।

🌟 मुख्य लाभ:
• देश के 27,000 से अधिक सरकारी व प्राइवेट अस्पतालों में भर्ती व ऑपरेशन 100% मुफ्त
• दवाइयाँ और जांच भी पूरी तरह फ्री

📋 जरूरी कागज़ात:
1. राशन कार्ड
2. आधार कार्ड

📍 कहाँ जाना है:
गांव के जन सेवा केंद्र (CSC Center) या सरकारी अस्पताल (PHC/जिला अस्पताल) के आयुष्मान काउंटर पर जाएं।
📞 हेल्पलाइन: 14555`;
  }

  return `नमस्ते दीदी! 🌸 आपके सवाल का उत्तर:

सरकार ग्रामीण महिलाओं को आत्मनिर्भर बनाने के लिए कई महत्वपूर्ण योजनाएं चला रही है:
1. 🧵 मुफ्त सिलाई मशीन व ₹15,000 टूलकिट (पीएम विश्वकर्मा)
2. 💰 लखपति दीदी योजना (बिना ब्याज ₹1-5 लाख लोन)
3. 🐄 पशुपालन व डेयरी विकास योजना (कम ब्याज पर लोन)
4. 🔥 मुफ्त उज्ज्वला गैस चूल्हा व सिलेंडर
5. 👧 बेटी के लिए सुकन्या समृद्धि योजना (8.2% ब्याज)

📋 आवेदन के लिए सामान्य कागज़ात:
• आधार कार्ड (मोबाइल लिंक)
• बैंक खाता पासबुक
• राशन कार्ड व फोटो

📍 कहाँ जाना है:
आप अपने गांव के 'पंचायत भवन', 'जन सेवा केंद्र (CSC)', या 'बैंक सखी' से संपर्क कर सकती हैं।
📞 किसी भी सहायता के लिए महिला हेल्पलाइन नंबर 181 पर कॉल करें।`;
}

// Quick Scheme Guidance API (structured summary for any selected scheme)
app.post('/api/scheme-advice', async (req: Request, res: Response) => {
  try {
    const { schemeName, userProfile, language = 'Hindi' } = req.body;

    if (!ai) {
      res.status(503).json({ error: 'AI not configured' });
      return;
    }

    const prompt = `Explain the government scheme or livelihood opportunity "${schemeName}" for a rural woman with profile: ${JSON.stringify(userProfile || {})}.
Provide response in ${language} language in easy-to-read rural conversational tone.
Format with 4 clear sections:
1. लाभ (What money / subsidy / equipment she receives)
2. कौन पात्र है (Who can apply - eligibility in simple criteria)
3. क्या कागज़ चाहिए (Aadhaar, passbook, ration card, etc.)
4. आवेदन कैसे करें (Step-by-step: where to go in the village, whom to meet).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.5,
      },
    });

    res.json({ advice: response.text });
  } catch (error: any) {
    console.error('Error in /api/scheme-advice:', error);
    res.status(500).json({ error: 'Failed to generate scheme advice' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Sakhi Saheli server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
