/**
 * Vercel Serverless Function: AI Chat API
 * Uses Google Gemini (free tier) to answer questions about Erdemt Bao
 *
 * Setup:
 * 1. Get API key: https://aistudio.google.com/apikey
 * 2. In Vercel: Project Settings → Environment Variables → Add GEMINI_API_KEY
 * 3. Deploy this repo to Vercel (or deploy api folder)
 */

const ALLOWED_ORIGINS = [
  'https://erdemtbao.github.io',
  'http://localhost:4000',
  'http://127.0.0.1:4000'
];

const SYSTEM_PROMPT = `You are Erdemt Bao's friendly AI assistant on his personal academic homepage. Answer questions about Erdemt based on the following context. Be concise, helpful, and professional. If asked something outside this context, politely say you can only answer about Erdemt. Respond in the same language as the question (Chinese or English).

## About Erdemt Bao
- Name: Erdemt Bao (包额尔德木图)
- Current: Second-year master's student at School of Mechanical Science and Engineering (MSE), Huazhong University of Science and Technology (HUST)
- Bachelor: Wuhan University of Technology (WHUT), School of Automation, June 2024
- Research interests: Embodied Intelligence, Robot Learning
- Focus: Vision-Language-Action (VLA) models, Imitation Learning, Robot Skill Learning
- Location: Wuhan, China
- Email: baoerdemt366@gmail.com
- GitHub: https://github.com/erdemtbao/
- Seeking: U.S. PhD programs for Fall 2027

## Recent News
- Nov 2025: WaveComm accepted to ICRA 2026
- Jun 2025: First prize in CVPR 2025 RoboTwin Dual-Arm Collaboration Challenge (Real-world Track)
- May 2025: Silver medal in RoboTwin Challenge (Simulation Round 1)

## Awards
- WHUT Top Ten Outstanding Students
- WHUT Top Ten Elite Teams
- CVPR 2025 RoboTwin: First Prize (Real-world), Second Prize (Simulation)
- MCM/ICM Meritorious Winner 2023
- CIMC 2022 National Grand Prize (3rd Place)

## Projects
- Awesome-Robot-Skill-Learning: Founder & Co-Project Lead (GitHub)
- Research intern at MIAA Lab, South China University of Technology (2025-2026)
- Pipeline inspection robot, PCB recycling robot (engineering projects)

## Education
- HUST MSE: Master, Sept 2024 – Jun 2027 (expected)
- WHUT: Bachelor in Automation, Sept 2020 – Jun 2024`;

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin || req.headers.referer || '';
  const allowOrigin = ALLOWED_ORIGINS.some(o => origin.startsWith(o)) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration: GEMINI_API_KEY not set' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const message = (body.message || '').trim();
  if (!message) {
    return res.status(400).json({ error: 'Missing message' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: message }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      let errMsg = 'AI service temporarily unavailable';
      try {
        const errJson = JSON.parse(errText);
        const detail = errJson?.error?.message ?? errJson?.error ?? errJson?.message ?? errText?.slice(0, 300);
        if (response.status === 400 && /API_KEY|api.key|invalid|permission/i.test(String(detail))) errMsg = 'API key invalid or missing. Check Vercel env vars and redeploy.';
        else if (response.status === 429) errMsg = 'Rate limit exceeded. Try again later.';
        else if (response.status === 403) errMsg = 'Gemini API access denied. Check API key and region restrictions.';
        else if (detail) errMsg = String(detail).slice(0, 500);
      } catch (_) {
        if (errText) errMsg = errText.slice(0, 300);
      }
      return res.status(502).json({ error: errMsg });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      return res.status(502).json({ error: 'No response from AI' });
    }

    return res.status(200).json({ reply: text });
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
