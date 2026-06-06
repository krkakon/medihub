import { NextResponse } from "next/server";
import db from "@/lib/db";

const MOCK_TENDERS = [
  {
    id: "t1",
    institution: "Dhaka Medical College Hospital",
    location: "Dhaka · Govt.",
    type: "Hospital",
    typeClass: "inst-h",
    productRequired: "HBsAg Rapid Test Cassettes (CE-IVD)",
    quantity: "50,000 tests",
    deadline: "closes in 3 days",
    bidsCount: 12,
    bestBid: "৳14.50/test"
  },
  {
    id: "t2",
    institution: "BUET Biotechnology Dept.",
    location: "Dhaka · University",
    type: "University",
    typeClass: "inst-u",
    productRequired: "Real-Time PCR System (96-well, 4-channel)",
    quantity: "2 units + 1-yr AMC",
    deadline: "closes in 9 days",
    bidsCount: 5,
    bestBid: "৳18–24L"
  },
  {
    id: "t3",
    institution: "Popular Diagnostic Centre",
    location: "Dhanmondi · Private Lab",
    type: "Diagnostic Lab",
    typeClass: "inst-l",
    productRequired: "Cobas e411 Reagent Cassettes — multi-assay",
    quantity: "Qty: Bulk · 6-mo contract",
    deadline: "closes in 2 days",
    bidsCount: 8,
    bestBid: "cold-chain req."
  }
];

export async function GET() {
  try {
    const dbTenders = await db.tender.findMany({
      include: {
        institution: true,
        bids: true
      }
    });

    if (dbTenders.length > 0) {
      const formatted = dbTenders.map((t) => ({
        id: t.id,
        institution: t.institution.institutionName || t.institution.email,
        location: t.institution.designation || "Dhaka",
        type: t.institution.role === "BUYER" ? "Hospital" : "Distributor",
        typeClass: t.institution.role === "BUYER" ? "inst-h" : "inst-u",
        productRequired: t.productRequired,
        quantity: t.quantity,
        deadline: `Closes ${t.deadline.toLocaleDateString()}`,
        bidsCount: t.bids.length,
        bestBid: t.bids.length > 0 ? `৳${Math.min(...t.bids.map(b => b.quotedPrice))}` : "No bids yet"
      }));
      return NextResponse.json(formatted);
    }
  } catch (error) {
    // Database query failed, return mock data
  }

  return NextResponse.json(MOCK_TENDERS);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenderId, sellerId, quotedPrice, deliveryTime, warranty, notes } = body;

    if (!tenderId || !quotedPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
      const newBid = await db.bid.create({
        data: {
          tenderId,
          sellerId: sellerId || "demo-seller-id",
          quotedPrice: parseFloat(quotedPrice),
          deliveryTime: deliveryTime || "3-5 days",
          warranty,
          notes
        }
      });
      return NextResponse.json(newBid, { status: 201 });
    } catch (dbError) {
      // Return simulated success
      return NextResponse.json({
        id: "bid_" + Date.now(),
        tenderId,
        sellerId: sellerId || "demo-seller-id",
        quotedPrice: parseFloat(quotedPrice),
        deliveryTime: deliveryTime || "3-5 days",
        warranty,
        notes,
        status: "SUBMITTED"
      }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
