const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize the official Stripe backend architecture
// It safely loads your secret developer account token key securely from an isolated environment file
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// Enable Cross-Origin Resource Sharing so your Vercel frontend can pass data requests to this server
app.use(cors());
app.use(express.json());

// ENDPOINT: Secure Card Intent Handshake Handler
app.post('/api/checkout/stripe-intent', async (req, res) => {
  try {
    const { amount } = req.body; // Expecting ticket value passed in raw pence (e.g., 21500)

    // Create a PaymentIntent model configuration container inside Stripe's processing cloud
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 21500,
      currency: 'gbp', // Setting currency to British Pounds matching your ticket visual screens
      automatic_payment_methods: {
        enabled: true, // This automatically forces Google Pay & Apple Pay to display alongside raw card inputs if supported by the user's phone!
      },
    });

    // Send the isolated ephemeral Client Secret string back to your React frontend instance
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error('Stripe Engine PaymentIntent Allocation Failure:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Ticketmaster Checkout API Node Running Live on Port: ${PORT}`));