"use server";
import { redirect } from "next/navigation";
import { handleError } from "../utils";
import { connectToDatabase } from "../database/mongoose";
import Transaction from "../database/models/transaction.model";
import { updatedCredits } from "./user.actions";
export async function checkoutCredits(transaction: CheckoutTransactionParams) {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const amount = Number(transaction.amount) * 100;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            unit_amount: amount,
            product_data: {
              name: transaction.plan,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        plan: transaction.plan,
        credits: transaction.credits,
        buyerId: transaction.buyerId,
      },
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
      cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
      payment_intent_data: {
        receipt_email: "customer@example.com",
        shipping: {
          name: "Customer X",
          address: {
            line1: "Address Line 1 X",
            line2: "Address Line 2 X",
            city: "City X",
            state: "State X",
            postal_code: "Postal Code X",
            country: "US",
          },
        },
      },
    });
    redirect(session.url);
  } catch (error) {
    console.error("Error during checkout:", error);
    throw error;
  }
}

export async function createTransaction(
  transaction: CheckoutTransactionParams
) {
  try {
    await connectToDatabase();
    const newTransaction = await Transaction.create({
      ...transaction,
      buyer: transaction.buyerId,
    });
    await updatedCredits(transaction.buyerId, transaction.credits);
    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    handleError(error);
  }
}
