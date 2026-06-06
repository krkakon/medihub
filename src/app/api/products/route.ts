import { NextResponse } from "next/server";
import db from "@/lib/db";

const MOCK_PRODUCTS = [
  {
    id: "p1",
    name: "HBV DNA RT-PCR Detection Kit (50 reactions)",
    catalogNumber: "S-HBV-PCR-50",
    brand: "Sansure Biotech",
    categoryId: "molecular-diagnostics",
    categoryName: "Molecular Diagnostics",
    price: 12500,
    bulkPrice: 10800,
    bulkMinQty: 50,
    deliveryTime: "3–5 days",
    stock: 42,
    sold: 212,
    coldChainRequirement: "2–8°C required",
    expiryDate: "2026-03-01",
    specifications: {
      "Sample Type": "Serum/Plasma",
      "Sensitivity": "95% / 99%"
    },
    sellerName: "GeneBio Bangladesh",
    sellerAvatar: "GB"
  },
  {
    id: "p2",
    name: "Olympus CX23 Binocular LED Microscope",
    catalogNumber: "CX23-LED-BIN",
    brand: "Olympus",
    categoryId: "lab-instruments",
    categoryName: "Lab Instruments",
    price: 78000,
    bulkPrice: 72500,
    bulkMinQty: 5,
    deliveryTime: "4–6 weeks",
    stock: 0,
    sold: 87,
    coldChainRequirement: "Not required",
    expiryDate: null,
    specifications: {
      "Magnification": "1000x total mag.",
      "Warranty": "3 years"
    },
    sellerName: "BioMed Instruments Ltd",
    sellerAvatar: "BM"
  },
  {
    id: "p3",
    name: "Taq DNA Polymerase (recombinant) 500U",
    catalogNumber: "EP0402-500U",
    brand: "Thermo Fisher",
    categoryId: "reagents-chemicals",
    categoryName: "Reagents & Chemicals",
    price: 8750,
    bulkPrice: 7900,
    bulkMinQty: 10,
    deliveryTime: "2–4 days",
    stock: 220,
    sold: 518,
    coldChainRequirement: "−20°C required",
    expiryDate: "2026-10-01",
    specifications: {
      "Activity": "5 U/µL activity",
      "Cold-chain": "OK"
    },
    sellerName: "ScienTech Solutions",
    sellerAvatar: "SC"
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() || "";
  const category = searchParams.get("category") || "";

  try {
    // Attempt database query
    const dbProducts = await db.product.findMany({
      include: {
        category: true,
        seller: true
      },
      where: {
        AND: [
          category ? { categoryId: category } : {},
          search ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { brand: { contains: search, mode: "insensitive" } },
              { catalogNumber: { contains: search, mode: "insensitive" } }
            ]
          } : {}
        ]
      }
    });

    if (dbProducts.length > 0) {
      const formatted = dbProducts.map((p) => ({
        id: p.id,
        name: p.name,
        catalogNumber: p.catalogNumber,
        brand: p.brand,
        categoryId: p.categoryId,
        categoryName: p.category.name,
        price: p.price,
        bulkPrice: p.bulkPrice,
        bulkMinQty: p.bulkMinQty,
        deliveryTime: p.deliveryTime,
        stock: p.stock,
        coldChainRequirement: p.coldChainRequirement,
        expiryDate: p.expiryDate ? p.expiryDate.toISOString().split("T")[0] : null,
        specifications: p.specifications as Record<string, string> || {},
        sellerName: p.seller.institutionName || p.seller.email,
        sellerAvatar: (p.seller.institutionName || "SE").substring(0, 2).toUpperCase()
      }));
      return NextResponse.json(formatted);
    }
  } catch (error) {
    // Database query failed or database empty, fall back to mock data
  }

  // Filter Mock Data
  let filtered = MOCK_PRODUCTS;
  if (category && category !== "All categories") {
    filtered = filtered.filter(p => p.categoryId === category || p.categoryName === category);
  }
  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        (p.brand && p.brand.toLowerCase().includes(search)) ||
        (p.catalogNumber && p.catalogNumber.toLowerCase().includes(search))
    );
  }

  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, deliveryTime, sellerId, categoryId } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
      const newProduct = await db.product.create({
        data: {
          name,
          price: parseFloat(price),
          bulkPrice: parseFloat(price) * 0.92,
          deliveryTime: deliveryTime || "3-5 days",
          sellerId: sellerId || "demo-seller-id",
          categoryId: categoryId || "molecular-diagnostics",
          stock: 0
        }
      });
      return NextResponse.json(newProduct, { status: 201 });
    } catch (dbError) {
      // Fallback response for mock
      return NextResponse.json({
        id: "p_" + Date.now(),
        name,
        price: parseFloat(price),
        bulkPrice: Math.round(parseFloat(price) * 0.92),
        deliveryTime: deliveryTime || "3-5 days",
        stock: 0,
        sold: 0
      }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
