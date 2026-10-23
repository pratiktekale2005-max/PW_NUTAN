const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const key = process.env.GEMINI_API_KEY;
console.log('Testing with key:', key ? `${key.substring(0, 6)}...${key.substring(key.length - 4)}` : 'NONE');

const genAI = new GoogleGenerativeAI(key);

async function testModel(modelName) {
  const start = Date.now();
  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' }
    });
    const prompt = 'Respond with JSON: {"status": "ONLINE", "message": "AegisPulse verified"}';
    const res = await model.generateContent(prompt);
    const latency = Date.now() - start;
    console.log(`✅ [${modelName}] SUCCEEDED in ${latency}ms:`, res.response.text().trim());
    return true;
  } catch (err) {
    const latency = Date.now() - start;
    console.log(`❌ [${modelName}] FAILED in ${latency}ms (Status: ${err.status || 'unknown'}):`, err.message);
    return false;
  }
}

async function main() {
  const candidates = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
  for (const m of candidates) {
    await testModel(m);
  }
}

main();
