const express = require('express');
const twilio = require('twilio');
const axios = require('axios'); // Used to make HTTP requests
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.use(express.urlencoded({ extended: true })); // Parse incoming form data

// Handle incoming SMS
app.post('/sms', (req, res) => {
    const { Body } = req.body; // Get the body of the SMS
    const regex = /latitude\s*([\d.-]+)\s*longitude\s*([\d.-]+)/i; // A simple regex to capture lat and long
    const match = Body.match(regex);

    if (match) {
        const latitude = parseFloat(match[1]);
        const longitude = parseFloat(match[2]);

        // Send the location to your website using GET method
        axios.get(`https://ubiquitous-funicular-v5x95x9p5wwc6gv4-3000.app.github.dev/api/location?latitude=${latitude}&longitude=${longitude}`)
            .then(response => {
                console.log('Location successfully sent to website');
                // Respond to Twilio with a message
                res.set('Content-Type', 'text/xml');
                res.send(`
                    <Response>
                        <Message>Location received and sent successfully!</Message>
                    </Response>
                `);
            })
            .catch(error => {
                console.error('Error sending location:', error);
                res.set('Content-Type', 'text/xml');
                res.send(`
                    <Response>
                        <Message>There was an error processing the location!</Message>
                    </Response>
                `);
            });
    } else {
        // If the message doesn't contain valid lat/lng
        res.set('Content-Type', 'text/xml');
        res.send(`
            <Response>
                <Message>Invalid location format. Please send latitude and longitude as "latitude <lat> longitude <long>".</Message>
            </Response>
        `);
    }
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
