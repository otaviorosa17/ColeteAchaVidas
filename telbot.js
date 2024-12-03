// Import required libraries
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();  // Load environment variables from .env file

// Your Telegram Bot Token from environment variable
const token = process.env.BOT_KEY;  // Replace with your Telegram bot token, or set in .env

// Initialize the Telegram bot
const bot = new TelegramBot(token, { polling: true });

// Define the API endpoint to forward messages to
const apiUrl = 'https://ubiquitous-funicular-v5x95x9p5wwc6gv4-3000.app.github.dev/api/msg'; // Replace with your actual API URL

// Listen for incoming messages from users
bot.on('message', (msg) => {
    // Extract message text from the incoming message
    const text = msg.text;

    // Extract the chat ID from the incoming message
    const chatId = msg.chat.id;

    // Display the chat ID in the console
    console.log('Chat ID:', chatId);

    // Check if the message contains text
    if (!text) {
        bot.sendMessage(chatId, 'Please send a text message.');
        return;
    }

    // Log the received message
    console.log('Received message:', text);

    // Forward the message to your API
    axios.post(apiUrl, { msg: text })
        .then(response => {
            console.log("API Response: ", response.data);
            // Send a confirmation message to the user
            bot.sendMessage(chatId, 'Message forwarded successfully!');
        })
        .catch(error => {
            console.error("Error forwarding message:", error);
            // Send a failure message to the user
            bot.sendMessage(chatId, `Failed to forward message. Error: ${error.message}`);
        });

    // Send the chat ID back to the user
    bot.sendMessage(chatId, 'Your chat ID is: ' + chatId);
});
