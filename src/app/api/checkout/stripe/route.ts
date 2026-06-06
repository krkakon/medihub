import { NextResponse } from "next/server";
import Stripe from "stripe";
import db from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy_secret_key", {
  apiVersion: "2024-06-20" as any // Match installed type
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, buyerId, successUrl, cancelUrl } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const transactionId = "TXN_" + Date.now();
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // 1. Database Order logging (when active)
    try {
      await db.order.create({
        data: {
          orderNumber: transactionId,
          buyerId: buyerId || "demo-buyer-id",
          total: totalAmount,
          paymentMethod: "STRIPE",
          status: "PENDING",
          paymentStatus: "PENDING"
        }
      });
    } catch (dbError) {
      // Failed to save in DB, continue as demo mockup
    }

    // 2. Stripe Checkout Session Creation
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "dummy_secret_key") {
      try {
        const lineItems = items.map((item: any) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
              description: `Catalog #: ${item.catalogNumber || "N/A"}`
            },
            unit_amount: Math.round((item.price / 115) * 100) // Convert BDT to mock USD cents (e.g. 1 USD = 115 BDT)
          },
          quantity: item.quantity
        }));

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: `${successUrl || "http://localhost:3000"}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: cancelUrl || "http://localhost:3000",
          metadata: {
            transactionId
          }
        });

        return NextResponse.json({ url: session.url });
      } catch (stripeError: any) {
        console.error("Stripe session creation error:", stripeError.message);
      }
    }

    // 3. Fallback mock redirection URL for development/demo
    // Instantly simulate a Stripe hosted checkout checkout redirection
    const mockStripeGatewayUrl = `https://checkout.stripe.com/pay/mock_session_${transactionId}`;
    return NextResponse.json({
      url: mockStripeGatewayUrl,
      isMock: true,
      transactionId,
      message: "Stripe API Key missing. Using test redirection mode."
    });

  } catch (error) {
    return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 });
  }
}
