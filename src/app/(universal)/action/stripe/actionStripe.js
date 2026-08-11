'use server';

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Store in .env.local

// export async function createPaymentIntent({ amount }) {
//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount, // e.g., 2000 = $20
//       currency: 'usd',
//       automatic_payment_methods: { enabled: true },
//     });

//     return {
//       clientSecret: paymentIntent.client_secret,
//     };
//   } catch (err) {
//     console.error(err);
//     return { error: err.message };
//   }
// }



export async function createPaymentIntent({
    amount,
    customer,
  }
//   : {
//     amount: number;
//     customer: {
//       name: string;
//       email: string;
//       phone: string;
//       address: {
//         line1: string;
//         line2?: string;
//         city: string;
//         state: string;
//         postal_code: string;
//         country: string;
//       };
//     };
//   }
) {
    try {
      // Step 1: Create a Customer
      const stripeCustomer = await stripe.customers.create({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      });
  
      // Step 2: Create a PaymentIntent and link it to the customer
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'EUR',
        customer: stripeCustomer.id,
        shipping: {
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
        },
        receipt_email: customer.email,
        metadata: {
          customer_name: customer.name,
          customer_email: customer.email,
        },
      });
  
      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      return { error: error.message };
    }
  }