const GroqSDK = require('groq-sdk');

const GroqClientCtor =
  typeof GroqSDK === 'function' ? GroqSDK : GroqSDK.Groq || GroqSDK.default;

let groqClientInstance = null;

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    return null;
  }

  if (!GroqClientCtor) {
    console.warn('Groq SDK unavailable; skipping AI features.');
    return null;
  }

  if (!groqClientInstance) {
    groqClientInstance = new GroqClientCtor({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  return groqClientInstance;
}

module.exports = {
  getGroqClient,
};
