// Sends a message to a Telegram chat using the Bot API.
// Usage: node send.mjs <message>
// Requires: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID env vars

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
  console.error(
    "Error: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables must be set."
  );
  process.exit(1);
}

const message = process.argv.slice(2).join(" ");
if (!message) {
  console.error("Error: No message provided.");
  console.error("Usage: node send.mjs <message>");
  process.exit(1);
}

const url = `https://api.telegram.org/bot${token}/sendMessage`;

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    chat_id: chatId,
    text: message,
    parse_mode: "Markdown",
  }),
});

const data = await res.json();

if (!data.ok) {
  console.error("Telegram API error:", data.description);
  process.exit(1);
}

console.log("Message sent successfully.");
