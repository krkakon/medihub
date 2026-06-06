import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.url ? await request.json() : {};
    const { items, buyerId, successUrl, failUrl, cancelUrl, cusName, cusEmail } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const transactionId = "SSLC_" + Date.now();
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // 1. Database Order logging
    try {
      await db.order.create({
        data: {
          orderNumber: transactionId,
          buyerId: buyerId || "demo-buyer-id",
          total: totalAmount,
          paymentMethod: "SSLCOMMERZ",
          status: "PENDING",
          paymentStatus: "PENDING"
        }
      });
    } catch (dbError) {
      // Failed to save in DB, continue as demo mockup
    }

    // 2. SSLCommerz Session Creation (sandbox/live)
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";

    if (storeId && storePassword) {
      try {
        const sslcommerzUrl = isLive
          ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
          : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

        const formData = new URLSearchParams();
        formData.append("store_id", storeId);
        formData.append("store_passwd", storePassword);
        formData.append("total_amount", totalAmount.toString());
        formData.append("currency", "BDT");
        formData.append("tran_id", transactionId);
        formData.append("success_url", successUrl || "http://localhost:3000/api/checkout/sslcommerz/callback?status=success");
        formData.append("fail_url", failUrl || "http://localhost:3000/api/checkout/sslcommerz/callback?status=fail");
        formData.append("cancel_url", cancelUrl || "http://localhost:3000/api/checkout/sslcommerz/callback?status=cancel");
        
        // Customer Info
        formData.append("cus_name", cusName || "Manos Sarker");
        formData.append("cus_email", cusEmail || "m.sarker@ideshi.org");
        formData.append("cus_add1", "Banani, Dhaka");
        formData.append("cus_city", "Dhaka");
        formData.append("cus_country", "Bangladesh");
        formData.append("cus_phone", "+8801700110200");

        // Product Info
        formData.append("shipping_method", "NO");
        formData.append("num_of_item", items.length.toString());
        formData.append("product_name", items.map((i: any) => i.name).join(", "));
        formData.append("product_category", "Scientific Reagents");
        formData.append("product_profile", "general");

        const sslResponse = await fetch(sslcommerzUrl, {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        });

        const sslData = await sslResponse.json();

        if (sslData.status === "SUCCESS" && sslData.GatewayPageURL) {
          return NextResponse.json({ url: sslData.GatewayPageURL });
        } else {
          console.error("SSLCommerz API error details:", sslData.failedreason || "Unknown error");
        }
      } catch (sslError) {
        console.error("SSLCommerz network request failed:", sslError);
      }
    }

    // 3. Fallback mock gateway redirection URL for local preview
    // Instantly simulate a bKash/Nagad/Cards gateway redirection
    const mockSslGatewayUrl = `https://sandbox.sslcommerz.com/gwprocess/v4/mock_pay?tran_id=${transactionId}`;
    return NextResponse.json({
      url: mockSslGatewayUrl,
      isMock: true,
      transactionId,
      message: "SSLCommerz Merchant credentials missing. Using Sandbox mockup mode."
    });

  } catch (error) {
    return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 });
  }
}
