import { loadStripe } from '@stripe/stripe-js';

// Replace this string placeholder with your actual Publishable Key from your Stripe Dashboard
export const stripePromise = loadStripe('pk_test_51Tb4Q2HlN1uYfcmLuVmCfYZfMt5aVYkti750rWD7pOpWXmrcxtXm65fvoWENFwJeFkM3bq8ABOFBAiXn6vCXH4DL00R2oOm2Dl');