"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// Product spec database for the comparison table
const specs: Record<string, {
  name: string;
  brand: string;
  cat: string;
  seller: string;
  price: string;
  bulk: string;
  delivery: string;
  stock: string;
  expiry: string;
  cold: string;
  sample: string;
  sens: string;
  icon: string;
  color: string;
}> = {
  p1: { name:'HBV DNA RT-PCR Detection Kit', brand:'Sansure Biotech', cat:'S-HBV-PCR-50', seller:'GeneBio Bangladesh', price:'৳12,500 / kit', bulk:'৳10,800 (50+)', delivery:'3–5 business days', stock:'In stock · 84 units', expiry:'Mar 2026', cold:'2–8°C required', sample:'Serum/Plasma', sens:'95% / 99%', icon:'fa-dna', color:'#991B1B'},
  p2: { name:'Olympus CX23 Binocular LED Microscope', brand:'Olympus', cat:'CX23-LED-BIN', seller:'BioMed Instruments Ltd', price:'৳78,000 / unit', bulk:'৳72,500 (5+)', delivery:'Indent · 4–6 weeks', stock:'On indent', expiry:'N/A', cold:'Not required', sample:'N/A', sens:'1000× total mag.', icon:'fa-microscope', color:'#92400E'},
  p3: { name:'Taq DNA Polymerase 500U', brand:'Thermo Fisher', cat:'EP0402-500U', seller:'ScienTech Solutions', price:'৳8,750 / vial', bulk:'৳7,900 (10+)', delivery:'2–4 business days', stock:'In stock · 220 units', expiry:'Oct 2026', cold:'−20°C required', sample:'N/A', sens:'5 U/µL activity', icon:'fa-vial', color:'#1E40AF'}
};

const translations = {
  en: {
    "nav.products": "Products",
    "nav.categories": "Categories",
    "nav.sellers": "Sellers",
    "nav.tender": "Tender Board",
    "nav.wizard": "Lab Setup Wizard",
    "nav.about": "About",
    "cta.buyer": "Buyer Login",
    "cta.seller": "Seller Portal"
  },
  bn: {
    "nav.products": "পণ্য",
    "nav.categories": "বিভাগ",
    "nav.sellers": "বিক্রেতা",
    "nav.tender": "টেন্ডার বোর্ড",
    "nav.wizard": "ল্যাব সেটআপ",
    "nav.about": "সম্পর্কে",
    "cta.buyer": "ক্রেতা লগইন",
    "cta.seller": "বিক্রেতা পোর্টাল"
  }
};

const labSetupTemplates: Record<string, string[]> = {
  'Molecular / PCR lab': ['Real-Time PCR system', 'Microcentrifuge', 'Micropipette set (P10-P1000)', 'Nucleic acid extraction kit', 'PCR master mix & primers', '-20C freezer', 'Filter tips & PCR tubes'],
  'Clinical microbiology': ['Binocular microscope', 'Autoclave', 'Incubator 37C', 'Biosafety cabinet', 'Culture media & plates', 'Gram stain kit'],
  'Hospital diagnostic lab': ['Clinical chemistry analyzer', 'Centrifuge', 'Hematology analyzer', 'Refrigerated reagent storage', 'Consumables & PPE']
};

export default function Home() {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedToCompare, setSelectedToCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showChatPop, setShowChatPop] = useState(false);
  const isChatHovered = useRef(false);

  // Primer Calculator State
  const [seq, setSeq] = useState("AGCTGGATCCATGGCGTCCAATGGCGTACCAGGTCATCGAT");
  const [purif, setPurif] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [checkedMods, setCheckedMods] = useState<Record<string, number>>({});

  // Lab Setup Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardType, setWizardType] = useState<keyof typeof labSetupTemplates | "">("");
  const [wizardLoad, setWizardLoad] = useState("Low (under 20/day)");
  const [wizardBudget, setWizardBudget] = useState("Under ৳10L");

  // Tender / RFQs State
  const [showTenderModal, setShowTenderModal] = useState(false);
  const [showTenderList, setShowTenderList] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [activeTender, setActiveTender] = useState<{ inst: string; prod: string; qty: string } | null>(null);
  const [bidSubmitted, setBidSubmitted] = useState(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowWizard(false);
    setShowTenderList(false);
    setShowTenderModal(false);
    setShowBidModal(false);
    setShowCompareModal(false);
    setShowChatPop(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auto-open Support Chat
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowChatPop(true);
    }, 1800);

    const timer2 = setTimeout(() => {
      if (!isChatHovered.current) {
        setShowChatPop(false);
      }
    }, 8300); // 1800 + 6500

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Sync Bengali Font Class on Body
  useEffect(() => {
    if (lang === "bn") {
      document.body.classList.add("bn");
    } else {
      document.body.classList.remove("bn");
    }
  }, [lang]);

  const t = (key: keyof typeof translations.en) => {
    return translations[lang][key] || key;
  };

  // Compare handlers
  const handleCompareCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      if (selectedToCompare.length >= 3) {
        return;
      }
      setSelectedToCompare((prev) => [...prev, id]);
    } else {
      setSelectedToCompare((prev) => prev.filter((item) => item !== id));
    }
  };

  // Primer Calculator logic
  const cleanedSeq = seq.toUpperCase().replace(/[^ACGTNRYKMSWBDHV]/g, "");
  const baseCount = cleanedSeq.length;
  
  // GC content calculation
  const gcCount = (cleanedSeq.match(/[GC]/g) || []).length;
  const gcContent = baseCount ? Math.round((gcCount / baseCount) * 100) : 0;

  // rough Tm
  let tm = 0;
  if (baseCount > 0 && baseCount < 14) {
    const at = (cleanedSeq.match(/[AT]/g) || []).length;
    const gc = (cleanedSeq.match(/[GC]/g) || []).length;
    tm = at * 2 + gc * 4;
  } else if (baseCount >= 14) {
    tm = Math.round(64.9 + 41 * ((gcContent / 100) * baseCount - 16.4) / baseCount);
  }

  // Pricing calculation
  const perBase = 60;
  const basePrice = baseCount * perBase;
  const scaleMultiplier = scale;
  const purifMultiplier = purif;
  const totalModCost = Object.values(checkedMods).reduce((sum, cost) => sum + cost, 0);
  const finalPrice = baseCount 
    ? Math.round((basePrice * scaleMultiplier * purifMultiplier + totalModCost) / 10) * 10 
    : 0;

  const handleModChange = (name: string, cost: number, checked: boolean) => {
    setCheckedMods((prev) => {
      const copy = { ...prev };
      if (checked) {
        copy[name] = cost;
      } else {
        delete copy[name];
      }
      return copy;
    });
  };

  return (
    <>

      {/* ============================ UTILITY BAR ============================ */}
      <div className="utility">
        <div className="wrap">
          <div className="utility-left">
            <span>
              <i className="fa-solid fa-shield-halved"></i> DGDA-aware procurement
            </span>
            <span>
              <i className="fa-solid fa-truck-fast"></i> Cold-chain certified delivery
            </span>
            <span>
              <i className="fa-solid fa-headset"></i> Technical support:{" "}
              <strong style={{ color: "#fff" }}>+880 1700-110200</strong>
            </span>
          </div>
          <div className="utility-right">
            <a href="#">
              <i className="fa-solid fa-circle-question"></i> Help
            </a>
            <a href="#">Track Order</a>
          </div>
        </div>
      </div>

      {/* ============================ NAVBAR ============================ */}
      <nav className="nav">
        <div className="wrap nav-inner">
          <a
            href="/"
            className="logo"
            aria-label="MediHub Bangladesh"
            onClick={handleLogoClick}
          >
            <span className="logo-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 3c0 4 14 4 14 0M5 21c0-4 14-4 14 0M6 7c0 3 12 3 12 0M6 17c0-3 12-3 12 0"
                  stroke="#fff"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                ></path>
                <path
                  d="M10 9.5h4M10 14.5h4M12 8v8"
                  stroke="#F59E0B"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                ></path>
              </svg>
            </span>
            <span className="logo-text">
              <span className="b1">
                MediHub <span style={{ color: "var(--teal)" }}>BD</span>
              </span>
              <span className="b2">Scientific Marketplace</span>
            </span>
          </a>

          <div className="nav-links">
            <a href="#products">{t("nav.products")}</a>
            <a href="#categories">{t("nav.categories")}</a>
            <a href="#sellers">{t("nav.sellers")}</a>
            <a href="#tender" className="has-badge">
              {t("nav.tender")}
            </a>
            <a href="#wizard">{t("nav.wizard")}</a>
            <a href="#about">{t("nav.about")}</a>
          </div>

          <div className="nav-cta">
            <div className="lang-toggle" role="group" aria-label="Language">
              <button
                className={lang === "en" ? "active" : ""}
                onClick={() => setLang("en")}
              >
                EN
              </button>
              <button
                className={lang === "bn" ? "active" : ""}
                onClick={() => setLang("bn")}
              >
                বাংলা
              </button>
            </div>
            <Link href="/buyer/login" className="btn btn-outline">
              <i className="fa-regular fa-user"></i>
              <span>{t("cta.buyer")}</span>
            </Link>
            <Link href="/seller/login" className="btn btn-amber">
              <i className="fa-solid fa-store"></i>
              <span>{t("cta.seller")}</span>
            </Link>
            <button
              className="btn btn-ghost hamburger"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Menu"
            >
              <i
                className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"}`}
              ></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu show" id="mobileMenu">
          <a href="#products" onClick={() => setMobileMenuOpen(false)}>
            Products
          </a>
          <a href="#categories" onClick={() => setMobileMenuOpen(false)}>
            Categories
          </a>
          <a href="#sellers" onClick={() => setMobileMenuOpen(false)}>
            Sellers
          </a>
          <a href="#tender" onClick={() => setMobileMenuOpen(false)}>
            Tender Board
          </a>
          <a href="#wizard" onClick={() => setMobileMenuOpen(false)}>
            Lab Setup Wizard
          </a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>
            About
          </a>
          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link
              href="/buyer/login"
              className="btn btn-outline"
              style={{ justifyContent: "center" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fa-regular fa-user"></i> {t("cta.buyer")}
            </Link>
            <Link
              href="/seller/login"
              className="btn btn-amber"
              style={{ justifyContent: "center" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fa-solid fa-store"></i> {t("cta.seller")}
            </Link>
          </div>
        </div>
      )}

      {/* ============================ EXPIRY BANNER ============================ */}
      <div className="alert-banner" id="expiryBanner">
        <div className="wrap">
          <div className="left">
            <i className="fa-solid fa-clock"></i>
            <span>
              <b>3 products</b> in your order history are nearing expiry —
              reorder before <b>July 2026</b> to avoid stockouts.
            </span>
          </div>
          <div className="right">
            <a href="#">
              Reorder now <i className="fa-solid fa-arrow-right"></i>
            </a>
            <button
              className="close"
              onClick={() => {
                const el = document.getElementById("expiryBanner");
                if (el) el.style.display = "none";
              }}
              aria-label="Dismiss"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      </div>

      {/* ============================ HERO ============================ */}
      <section className="hero" style={{ paddingTop: "64px" }}>
        <div className="wrap hero-inner">
          <div>
            <span className="eyebrow">
              <span className="dot"></span> Live · 85 verified distributors
              active today
            </span>
            <h1>
              Bangladesh's First Scientific &amp; Healthcare{" "}
              <em>Procurement Hub</em>
            </h1>
            <p className="sub">
              Find reagents, equipment, kits &amp; consumables from verified
              distributors — compare prices, request quotations, and order
              online with regulatory-ready documentation.
            </p>

            <div className="search" role="search">
              <label className="search-cat">
                <span className="sr-only">Category</span>
                <select aria-label="Category">
                  <option>All categories</option>
                  <option>Molecular Diagnostics</option>
                  <option>Lab Instruments</option>
                  <option>Reagents &amp; Chemicals</option>
                  <option>Hospital Consumables</option>
                  <option>Cold Chain</option>
                </select>
              </label>
              <label className="search-input">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Search by product, brand, or catalogue number…"
                  aria-label="Search"
                />
              </label>
              <button className="search-go">
                <span>Search</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>

            <div className="pills">
              <a className="pill">
                <i className="fa-solid fa-dna"></i> PCR Kits
              </a>
              <a className="pill">
                <i className="fa-solid fa-microscope"></i> Lab Equipment
              </a>
              <a className="pill">
                <i className="fa-solid fa-hospital"></i> Hospital Supplies
              </a>
              <a className="pill">
                <i className="fa-solid fa-flask"></i> Reagents
              </a>
              <a className="pill">
                <i className="fa-solid fa-snowflake"></i> Cold Chain Products
              </a>
              <a className="pill">
                <i className="fa-solid fa-screwdriver-wrench"></i> Instruments
              </a>
            </div>

            <div className="stats">
              <div className="stat">
                <div className="num">
                  1,200<span className="plus">+</span>
                </div>
                <div className="lbl">Products listed</div>
              </div>
              <div className="stat">
                <div className="num">
                  85<span className="plus">+</span>
                </div>
                <div className="lbl">Verified sellers</div>
              </div>
              <div className="stat">
                <div className="num">
                  500<span className="plus">+</span>
                </div>
                <div className="lbl">Institutions served</div>
              </div>
            </div>
          </div>

          {/* Hero side panel: live snapshot */}
          <aside className="hero-card" aria-label="Live activity">
            <div className="hc-head">
              <span className="tag">Recently listed</span>
              <span className="live">
                <span className="blip"></span> updated 2m ago
              </span>
            </div>
            <div className="hc-row">
              <div
                className="hc-thumb"
                style={{ background: "#FEE2E2", color: "#991B1B" }}
              >
                <i className="fa-solid fa-dna"></i>
              </div>
              <div className="hc-info">
                <div className="n">HBV DNA RT-PCR Kit</div>
                <div className="m">
                  Sansure Biotech · <i className="fa-solid fa-circle-check"></i> Verified
                </div>
              </div>
              <div className="hc-price">
                ৳12,500<small>/ kit</small>
              </div>
            </div>
            <div className="hc-row">
              <div
                className="hc-thumb"
                style={{ background: "#DBEAFE", color: "#1E40AF" }}
              >
                <i className="fa-solid fa-microscope"></i>
              </div>
              <div className="hc-info">
                <div className="n">Olympus CX23 Microscope</div>
                <div className="m">
                  BioMed Ltd · <i className="fa-solid fa-circle-check"></i> Verified
                </div>
              </div>
              <div className="hc-price">
                ৳78,000<small>/ unit</small>
              </div>
            </div>
            <div className="hc-row">
              <div
                className="hc-thumb"
                style={{ background: "#D1FAE5", color: "#065F46" }}
              >
                <i className="fa-solid fa-flask"></i>
              </div>
              <div className="hc-info">
                <div className="n">RNase-Free Water 1L</div>
                <div className="m">
                  Thermo Fisher · <i className="fa-solid fa-circle-check"></i> Verified
                </div>
              </div>
              <div className="hc-price">
                ৳3,200<small>/ btl</small>
              </div>
            </div>
            <div className="hc-row">
              <div
                className="hc-thumb"
                style={{ background: "#FEF3C7", color: "#92400E" }}
              >
                <i className="fa-solid fa-vial"></i>
              </div>
              <div className="hc-info">
                <div className="n">PCR Tubes 0.2ml (1000pk)</div>
                <div className="m">
                  Axygen · <i className="fa-solid fa-circle-check"></i> Verified
                </div>
              </div>
              <div className="hc-price">
                ৳5,400<small>/ pack</small>
              </div>
            </div>
            <div className="hc-foot">
              <span>
                <b>42 new products</b> this week
              </span>
              <a
                href="#"
                style={{
                  color: "var(--teal-dark)",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Browse all{" "}
                <i
                  className="fa-solid fa-arrow-right"
                  style={{ fontSize: "10px" }}
                ></i>
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* ============================ FEATURED CATEGORIES ============================ */}
      <section id="categories">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">Browse by domain</div>
              <h2>Featured categories</h2>
              <p className="sub">
                Curated collections of validated products across diagnostic,
                research, and clinical applications.
              </p>
            </div>
            <a href="#" className="link">
              View all 24 categories <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>

          <div className="cat-grid">
            <a className="cat" href="#" style={{ borderTop: "3px solid var(--teal)" }}>
              <div>
                <div className="cat-icon">
                  <i className="fa-solid fa-dna"></i>
                </div>
                <h3>Molecular Diagnostics</h3>
              </div>
              <div className="meta">
                <span className="count">
                  <b>284</b> products · 18 brands
                </span>
                <span className="arrow">
                  <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </a>
            <a className="cat" href="#">
              <div>
                <div
                  className="cat-icon"
                  style={{ background: "#FEF3C7", color: "#92400E" }}
                >
                  <i className="fa-solid fa-microscope"></i>
                </div>
                <h3>Lab Instruments</h3>
              </div>
              <div className="meta">
                <span className="count">
                  <b>196</b> products · 22 brands
                </span>
                <span className="arrow">
                  <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </a>
            <a className="cat" href="#">
              <div>
                <div
                  className="cat-icon"
                  style={{ background: "#FEE2E2", color: "#991B1B" }}
                >
                  <i className="fa-solid fa-hospital"></i>
                </div>
                <h3>Hospital Consumables</h3>
              </div>
              <div className="meta">
                <span className="count">
                  <b>312</b> products · 14 brands
                </span>
                <span className="arrow">
                  <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </a>
            <a className="cat" href="#">
              <div>
                <div
                  className="cat-icon"
                  style={{ background: "#DBEAFE", color: "#1E40AF" }}
                >
                  <i className="fa-solid fa-flask"></i>
                </div>
                <h3>Reagents &amp; Chemicals</h3>
              </div>
              <div className="meta">
                <span className="count">
                  <b>248</b> products · 16 brands
                </span>
                <span className="arrow">
                  <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </a>
            <a className="cat" href="#">
              <div>
                <div
                  className="cat-icon"
                  style={{ background: "#E0E7FF", color: "#3730A3" }}
                >
                  <i className="fa-solid fa-snowflake"></i>
                </div>
                <h3>Cold Chain Products</h3>
              </div>
              <div className="meta">
                <span className="count">
                  <b>89</b> products · 9 brands
                </span>
                <span className="arrow">
                  <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </a>
            <a className="cat" href="#">
              <div>
                <div
                  className="cat-icon"
                  style={{ background: "#D1FAE5", color: "#065F46" }}
                >
                  <i className="fa-solid fa-graduation-cap"></i>
                </div>
                <h3>Research &amp; University</h3>
              </div>
              <div className="meta">
                <span className="count">
                  <b>156</b> products · 12 brands
                </span>
                <span className="arrow">
                  <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ============================ TRENDING PRODUCTS ============================ */}
      <section className="section-products" id="products">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">High demand · this week</div>
              <h2>Trending across institutions</h2>
              <p className="sub">
                Most-quoted products by hospitals, diagnostic labs, and
                universities in the last 7 days.
              </p>
            </div>
            <a href="#" className="link">
              See all trending <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>

          <div className="prod-grid" id="prodGrid">
            {/* PRODUCT 1 */}
            <article className="prod">
              <div className="prod-img">
                <div className="prod-tags">
                  <span className="tag-chip tag-cold">
                    <i className="fa-solid fa-snowflake"></i> 2–8°C
                  </span>
                  <span className="tag-chip tag-trending">
                    <i className="fa-solid fa-fire"></i> Trending
                  </span>
                </div>
                <label className="prod-compare" title="Add to compare">
                  <input
                    type="checkbox"
                    className="cmp-input"
                    checked={selectedToCompare.includes("p1")}
                    onChange={(e) =>
                      handleCompareCheckboxChange("p1", e.target.checked)
                    }
                  />
                  <span className="box">
                    <i className="fa-solid fa-check"></i>
                  </span>
                  <span className="lbl">Compare</span>
                </label>
                <div className="placeholder">
                  <i className="fa-solid fa-dna"></i>
                </div>
              </div>
              <div className="prod-body">
                <div className="prod-brand">
                  <span className="br">Sansure Biotech</span>
                  <span className="cat-x mono">CAT# S-HBV-PCR-50</span>
                </div>
                <h3 className="prod-name">
                  HBV DNA RT-PCR Detection Kit (50 reactions)
                </h3>
                <div className="prod-seller">
                  <div className="avatar">GB</div>
                  <span className="name">GeneBio Bangladesh</span>
                  <span className="verified">
                    <i className="fa-solid fa-circle-check"></i> Verified
                  </span>
                </div>
                <div className="prod-price">
                  <div className="p1">
                    ৳12,500<span className="u">/ kit</span>
                  </div>
                  <div className="bulk">
                    <i className="fa-solid fa-tag"></i> ৳10,800 · 50+
                  </div>
                </div>
                <div className="prod-meta">
                  <div className="row">
                    <i className="fa-solid fa-truck-fast"></i>{" "}
                    <span>
                      <b>3–5 days</b>
                    </span>
                  </div>
                  <div className="row">
                    <i className="fa-solid fa-box"></i>{" "}
                    <span>
                      <b>342</b> sold
                    </span>
                  </div>
                  <div className="row warn">
                    <i className="fa-regular fa-calendar"></i>{" "}
                    <span>
                      Exp: <b>Mar 2026</b>
                    </span>
                  </div>
                  <div className="row">
                    <i className="fa-solid fa-warehouse"></i>{" "}
                    <span>
                      <b>In stock</b>
                    </span>
                  </div>
                </div>
                <div className="prod-actions">
                  <button className="btn btn-teal">
                    <i className="fa-solid fa-cart-plus"></i> Add to Cart
                  </button>
                  <button className="btn btn-qot">
                    <i className="fa-regular fa-file-lines"></i> Quote
                  </button>
                </div>
              </div>
            </article>

            {/* PRODUCT 2 */}
            <article className="prod">
              <div className="prod-img">
                <div className="prod-tags">
                  <span className="tag-chip tag-indent">
                    <i className="fa-solid fa-clock"></i> Indent: 4–6 weeks
                  </span>
                </div>
                <label className="prod-compare" title="Add to compare">
                  <input
                    type="checkbox"
                    className="cmp-input"
                    checked={selectedToCompare.includes("p2")}
                    onChange={(e) =>
                      handleCompareCheckboxChange("p2", e.target.checked)
                    }
                  />
                  <span className="box">
                    <i className="fa-solid fa-check"></i>
                  </span>
                  <span className="lbl">Compare</span>
                </label>
                <div className="placeholder">
                  <i className="fa-solid fa-microscope"></i>
                </div>
              </div>
              <div className="prod-body">
                <div className="prod-brand">
                  <span className="br">Olympus</span>
                  <span className="cat-x mono">CAT# CX23-LED-BIN</span>
                </div>
                <h3 className="prod-name">
                  Olympus CX23 Binocular LED Microscope
                </h3>
                <div className="prod-seller">
                  <div
                    className="avatar"
                    style={{
                      background: "linear-gradient(135deg,#F59E0B,#D97706)",
                    }}
                  >
                    BM
                  </div>
                  <span className="name">BioMed Instruments Ltd</span>
                  <span className="verified">
                    <i className="fa-solid fa-circle-check"></i> Verified
                  </span>
                </div>
                <div className="prod-price">
                  <div className="p1">
                    ৳78,000<span className="u">/ unit</span>
                  </div>
                  <div className="bulk">
                    <i className="fa-solid fa-tag"></i> ৳72,500 · 5+
                  </div>
                </div>
                <div className="prod-meta">
                  <div className="row">
                    <i className="fa-solid fa-truck-fast"></i>{" "}
                    <span>
                      <b>4–6 weeks</b>
                    </span>
                  </div>
                  <div className="row">
                    <i className="fa-solid fa-box"></i>{" "}
                    <span>
                      <b>87</b> sold
                    </span>
                  </div>
                  <div className="row">
                    <i className="fa-solid fa-shield"></i>{" "}
                    <span>
                      <b>3-yr</b> warranty
                    </span>
                  </div>
                  <div className="row">
                    <i className="fa-solid fa-screwdriver-wrench"></i>{" "}
                    <span>
                      Install <b>free</b>
                    </span>
                  </div>
                </div>
                <div className="prod-actions">
                  <button className="btn btn-teal">
                    <i className="fa-solid fa-cart-plus"></i> Add to Cart
                  </button>
                  <button className="btn btn-qot">
                    <i className="fa-regular fa-file-lines"></i> Quote
                  </button>
                </div>
              </div>
            </article>

            {/* PRODUCT 3 */}
            <article className="prod">
              <div className="prod-img">
                <div className="prod-tags">
                  <span className="tag-chip tag-cold">
                    <i className="fa-solid fa-snowflake"></i> −20°C
                  </span>
                  <span className="tag-chip tag-stock">
                    <i className="fa-solid fa-bolt"></i> In stock
                  </span>
                </div>
                <label className="prod-compare" title="Add to compare">
                  <input
                    type="checkbox"
                    className="cmp-input"
                    checked={selectedToCompare.includes("p3")}
                    onChange={(e) =>
                      handleCompareCheckboxChange("p3", e.target.checked)
                    }
                  />
                  <span className="box">
                    <i className="fa-solid fa-check"></i>
                  </span>
                  <span className="lbl">Compare</span>
                </label>
                <div className="placeholder">
                  <i className="fa-solid fa-vial"></i>
                </div>
              </div>
              <div className="prod-body">
                <div className="prod-brand">
                  <span className="br">Thermo Fisher</span>
                  <span className="cat-x mono">CAT# EP0402-500U</span>
                </div>
                <h3 className="prod-name">
                  Taq DNA Polymerase (recombinant) 500U
                </h3>
                <div className="prod-seller">
                  <div
                    className="avatar"
                    style={{
                      background: "linear-gradient(135deg,#2563EB,#1E40AF)",
                    }}
                  >
                    SC
                  </div>
                  <span className="name">ScienTech Solutions</span>
                  <span className="verified">
                    <i className="fa-solid fa-circle-check"></i> Verified
                  </span>
                </div>
                <div className="prod-price">
                  <div className="p1">
                    ৳8,750<span className="u">/ vial</span>
                  </div>
                  <div className="bulk">
                    <i className="fa-solid fa-tag"></i> ৳7,900 · 10+
                  </div>
                </div>
                <div className="prod-meta">
                  <div className="row">
                    <i className="fa-solid fa-truck-fast"></i>{" "}
                    <span>
                      <b>2–4 days</b>
                    </span>
                  </div>
                  <div className="row">
                    <i className="fa-solid fa-box"></i>{" "}
                    <span>
                      <b>518</b> sold
                    </span>
                  </div>
                  <div className="row">
                    <i className="fa-regular fa-calendar"></i>{" "}
                    <span>
                      Exp: <b>Oct 2026</b>
                    </span>
                  </div>
                  <div className="row">
                    <i className="fa-solid fa-snowflake"></i>{" "}
                    <span>
                      Cold-chain <b>OK</b>
                    </span>
                  </div>
                </div>
                <div className="prod-actions">
                  <button className="btn btn-teal">
                    <i className="fa-solid fa-cart-plus"></i> Add to Cart
                  </button>
                  <button className="btn btn-qot">
                    <i className="fa-regular fa-file-lines"></i> Quote
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ============================ HOW IT WORKS ============================ */}
      <section className="how" id="sellers">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">How MediHub works</div>
              <h2>Built for every side of scientific procurement</h2>
              <p className="sub">
                Whether you're sourcing a single reagent or running a 200-line
                tender, the workflow is the same: structured, verified,
                traceable.
              </p>
            </div>
          </div>

          <div className="how-grid">
            <div className="how-col" data-flavor="buyer">
              <div className="role">For buyers</div>
              <h3>
                <i className="fa-solid fa-flask" style={{ color: "var(--teal)" }}></i>{" "}
                Hospitals, Labs, Universities
              </h3>
              <div className="how-step">
                <span className="n">1</span>
                <div className="txt">
                  <b>Register with institution &amp; designation</b>Verified
                  institutional accounts get net-30 terms.
                </div>
              </div>
              <div className="how-step">
                <span className="n">2</span>
                <div className="txt">
                  <b>Search, filter &amp; compare</b>Side-by-side specs, prices, and
                  lead times.
                </div>
              </div>
              <div className="how-step">
                <span className="n">3</span>
                <div className="txt">
                  <b>Order online or request quotation</b>Full documentation
                  auto-attached to your PO.
                </div>
              </div>
              <Link href="/buyer/login" className="footer-cta">
                Register as buyer <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>

            <div className="how-col" data-flavor="seller">
              <div className="role">For sellers</div>
              <h3>
                <i
                  className="fa-solid fa-store"
                  style={{ color: "var(--amber-dark)" }}
                ></i>{" "}
                Distributors &amp; Suppliers
              </h3>
              <div className="how-step">
                <span className="n">1</span>
                <div className="txt">
                  <b>Apply &amp; get verified</b>Trade license + distributorship docs
                  reviewed in 48 hours.
                </div>
              </div>
              <div className="how-step">
                <span className="n">2</span>
                <div className="txt">
                  <b>Upload products with specs &amp; docs</b>MSDS, CoA, IFU —
                  searchable + downloadable.
                </div>
              </div>
              <div className="how-step">
                <span className="n">3</span>
                <div className="txt">
                  <b>Manage orders, quotes &amp; analytics</b>Single dashboard for
                  inventory, RFQs, and payouts.
                </div>
              </div>
              <Link href="/seller/login" className="footer-cta">
                Apply as seller <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>

            <div className="how-col" data-flavor="large">
              <div className="role">For large orders</div>
              <h3>
                <i className="fa-solid fa-gavel" style={{ color: "var(--ink)" }}></i>{" "}
                Tender Board (RFQ)
              </h3>
              <div className="how-step">
                <span className="n">1</span>
                <div className="txt">
                  <b>Post an RFQ on Tender Board</b>Define product, quantity, specs,
                  and deadline.
                </div>
              </div>
              <div className="how-step">
                <span className="n">2</span>
                <div className="txt">
                  <b>Receive bids from multiple sellers</b>Sealed bids, ranked by
                  price, lead time, and seller rating.
                </div>
              </div>
              <div className="how-step">
                <span className="n">3</span>
                <div className="txt">
                  <b>Select best offer</b>Award + auto-generate contract with
                  delivery milestones.
                </div>
              </div>
              <a href="#tender" className="footer-cta">
                View tender board <i className="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ PRIMER CALCULATOR ============================ */}
      <section className="primer">
        <div className="wrap primer-inner">
          <div>
            <div className="section-eyebrow" style={{ color: "var(--amber)" }}>
              Custom synthesis · in-house
            </div>
            <h2>
              Custom <span>Primer &amp; Probe</span> Orders
            </h2>
            <p className="sub">
              Instant pricing for custom oligonucleotide synthesis. Standard primers
              ship in 3 business days; fluorescent probes in 5–7.
            </p>
            <ul className="primer-features">
              <li>
                <i className="fa-solid fa-check"></i> HPLC, PAGE &amp; desalt
                purification grades
              </li>
              <li>
                <i className="fa-solid fa-check"></i> FAM, HEX, TAMRA, Cy3/Cy5, BHQ
                modifications
              </li>
              <li>
                <i className="fa-solid fa-check"></i> QC report &amp; lyophilized
                delivery in BD
              </li>
            </ul>
          </div>

          <div className="calc" id="calc">
            <div className="calc-head">
              <span className="label">Oligo Quote · Live</span>
              <span className="id">#OLI-2026-04738</span>
            </div>
            <label htmlFor="seq">Sequence (5′ → 3′)</label>
            <textarea
              id="seq"
              className="seq-box"
              rows={3}
              spellCheck="false"
              value={seq}
              onChange={(e) => setSeq(e.target.value)}
            ></textarea>
            <div className="seq-meta">
              <span>A–Z, no spaces · IUPAC accepted</span>
              <span>
                Bases: <b>{baseCount}</b> · GC: <b>{gcContent}%</b> · Tm:{" "}
                <b>{tm}°C</b>
              </span>
            </div>

            <div className="calc-row">
              <div className="field">
                <label htmlFor="purif">Purification</label>
                <select
                  id="purif"
                  value={purif}
                  onChange={(e) => setPurif(parseFloat(e.target.value))}
                >
                  <option value="1">Desalt (Standard)</option>
                  <option value="1.6">HPLC</option>
                  <option value="2.4">PAGE</option>
                  <option value="2.8">Dual HPLC</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="scale">Synthesis Scale</label>
                <select
                  id="scale"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                >
                  <option value="1">25 nmol</option>
                  <option value="1.5">50 nmol</option>
                  <option value="2.4">200 nmol</option>
                  <option value="4">1 µmol</option>
                </select>
              </div>
            </div>

            <label style={{ marginTop: "18px" }}>Modifications</label>
            <div className="mods" id="mods">
              <label className="mod-chip">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    handleModChange("5′-FAM", 850, e.target.checked)
                  }
                />
                <span>5′-FAM</span>
              </label>
              <label className="mod-chip">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    handleModChange("3′-TAMRA", 950, e.target.checked)
                  }
                />
                <span>3′-TAMRA</span>
              </label>
              <label className="mod-chip">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    handleModChange("3′-BHQ1", 1100, e.target.checked)
                  }
                />
                <span>3′-BHQ1</span>
              </label>
              <label className="mod-chip">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    handleModChange("3′-BHQ2", 1400, e.target.checked)
                  }
                />
                <span>3′-BHQ2</span>
              </label>
              <label className="mod-chip">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    handleModChange("5′-HEX", 1250, e.target.checked)
                  }
                />
                <span>5′-HEX</span>
              </label>
            </div>

            <div className="calc-foot">
              <div className="price-est">
                <span className="lb">Estimated price</span>
                <span className="pv">
                  ৳<span>{finalPrice.toLocaleString("en-IN")}</span>
                </span>
              </div>
              <button className="btn btn-amber btn-lg" onClick={() => {}}>
                Calculate Price <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ TENDER BOARD ============================ */}
      <section id="tender">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">Live RFQs · open for bidding</div>
              <h2>Tender Board</h2>
              <p className="sub">
                Institutional Request-for-Quotations posted in the last 72 hours.
                Bid as a verified seller, or post your own as a buyer.
              </p>
            </div>
            <button
              onClick={() => setShowTenderList(true)}
              className="btn btn-ghost link"
              style={{ padding: 0 }}
            >
              View all 47 open Tenders <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          <div className="tender-grid">
            <article className="rfq">
              <div className="rfq-head">
                <div className="rfq-inst">
                  <div
                    className="rfq-logo"
                    style={{
                      background: "linear-gradient(135deg,#DC2626,#991B1B)",
                    }}
                  >
                    <i className="fa-solid fa-hospital"></i>
                  </div>
                  <div>
                    <div className="nm">Dhaka Medical College Hospital</div>
                    <div className="loc">
                      <i className="fa-solid fa-location-dot"></i> Dhaka · Govt.
                    </div>
                  </div>
                </div>
                <span className="inst-tag inst-h">Hospital</span>
              </div>
              <div className="rfq-prod">
                <div className="lb">Required</div>
                <div className="nm">HBsAg Rapid Test Cassettes (CE-IVD)</div>
                <div className="qty">Qty: 50,000 tests</div>
              </div>
              <div className="rfq-meta">
                <span className="deadline">
                  <i className="fa-solid fa-clock"></i> Closes in 3 days
                </span>
                <span className="bids">
                  <b>12</b> bids · best ৳14.50/test
                </span>
              </div>
              <div className="rfq-actions">
                <button
                  className="btn btn-teal"
                  onClick={() => {
                    setActiveTender({
                      inst: "Dhaka Medical College Hospital",
                      prod: "HBsAg Rapid Test Cassettes (CE-IVD)",
                      qty: "50,000 tests",
                    });
                    setShowBidModal(true);
                  }}
                >
                  <i className="fa-solid fa-gavel"></i> Submit Bid
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setActiveTender({
                      inst: "Dhaka Medical College Hospital",
                      prod: "HBsAg Rapid Test Cassettes (CE-IVD)",
                      qty: "50,000 tests",
                    });
                    setShowTenderModal(true);
                  }}
                >
                  View Details
                </button>
              </div>
            </article>

            <article className="rfq">
              <div className="rfq-head">
                <div className="rfq-inst">
                  <div
                    className="rfq-logo"
                    style={{
                      background: "linear-gradient(135deg,#2563EB,#1E40AF)",
                    }}
                  >
                    <i className="fa-solid fa-graduation-cap"></i>
                  </div>
                  <div>
                    <div className="nm">BUET Biotechnology Dept.</div>
                    <div className="loc">
                      <i className="fa-solid fa-location-dot"></i> Dhaka ·
                      University
                    </div>
                  </div>
                </div>
                <span className="inst-tag inst-u">University</span>
              </div>
              <div className="rfq-prod">
                <div className="lb">Required</div>
                <div className="nm">Real-Time PCR System (96-well, 4-channel)</div>
                <div className="qty">Qty: 2 units + 1-yr AMC</div>
              </div>
              <div className="rfq-meta">
                <span className="deadline warn">
                  <i className="fa-solid fa-clock"></i> Closes in 9 days
                </span>
                <span className="bids">
                  <b>5</b> bids · range ৳18–24L
                </span>
              </div>
              <div className="rfq-actions">
                <button
                  className="btn btn-teal"
                  onClick={() => {
                    setActiveTender({
                      inst: "BUET Biotechnology Dept.",
                      prod: "Real-Time PCR System (96-well, 4-channel)",
                      qty: "2 units + 1-yr AMC",
                    });
                    setShowBidModal(true);
                  }}
                >
                  <i className="fa-solid fa-gavel"></i> Submit Bid
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setActiveTender({
                      inst: "BUET Biotechnology Dept.",
                      prod: "Real-Time PCR System (96-well, 4-channel)",
                      qty: "2 units + 1-yr AMC",
                    });
                    setShowTenderModal(true);
                  }}
                >
                  View Details
                </button>
              </div>
            </article>

            <article className="rfq">
              <div className="rfq-head">
                <div className="rfq-inst">
                  <div
                    className="rfq-logo"
                    style={{
                      background: "linear-gradient(135deg,#059669,#047857)",
                    }}
                  >
                    <i className="fa-solid fa-vial"></i>
                  </div>
                  <div>
                    <div className="nm">Popular Diagnostic Centre</div>
                    <div className="loc">
                      <i className="fa-solid fa-location-dot"></i> Dhanmondi ·
                      Private Lab
                    </div>
                  </div>
                </div>
                <span className="inst-tag inst-l">Diagnostic Lab</span>
              </div>
              <div className="rfq-prod">
                <div className="lb">Required</div>
                <div className="nm">Cobas e411 Reagent Cassettes — multi-assay</div>
                <div className="qty">Qty: Bulk · 6-mo contract</div>
              </div>
              <div className="rfq-meta">
                <span className="deadline">
                  <i className="fa-solid fa-clock"></i> Closes in 2 days
                </span>
                <span className="bids">
                  <b>8</b> bids · cold-chain req.
                </span>
              </div>
              <div className="rfq-actions">
                <button
                  className="btn btn-teal"
                  onClick={() => {
                    setActiveTender({
                      inst: "Popular Diagnostic Centre",
                      prod: "Cobas e411 Reagent Cassettes — multi-assay",
                      qty: "Qty: Bulk · 6-mo contract",
                    });
                    setShowBidModal(true);
                  }}
                >
                  <i className="fa-solid fa-gavel"></i> Submit Bid
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setActiveTender({
                      inst: "Popular Diagnostic Centre",
                      prod: "Cobas e411 Reagent Cassettes — multi-assay",
                      qty: "Qty: Bulk · 6-mo contract",
                    });
                    setShowTenderModal(true);
                  }}
                >
                  View Details
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ============================ LAB SETUP WIZARD ============================ */}
      <section className="wizard" id="wizard">
        <div className="wrap">
          <div className="wizard-inner">
            <div>
              <div className="section-eyebrow">Lab Setup Wizard</div>
              <h2>Setting up a new lab?</h2>
              <p className="sub">
                Answer 3 quick questions and get a complete recommended
                equipment, kit &amp; consumable list — instantly. Built from
                400+ existing lab setups across Bangladesh.
              </p>
              <div className="wiz-pills">
                <span className="wiz-pill">
                  <span className="q">1</span> What type of lab?
                </span>
                <span className="wiz-pill">
                  <span className="q">2</span> Daily throughput?
                </span>
                <span className="wiz-pill">
                  <span className="q">3</span> Budget range?
                </span>
              </div>
              <button
                onClick={() => {
                  setWizardStep(0);
                  setWizardType("");
                  setShowWizard(true);
                }}
                className="btn btn-teal btn-lg wiz-cta"
              >
                Start Lab Setup Wizard <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>

            <div className="wiz-preview">
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Sample · Molecular Diagnostic Lab</span>
                <span style={{ color: "var(--teal-dark)" }}>3 / 3</span>
              </div>
              <div className="wiz-step done">
                <span className="n">
                  <i className="fa-solid fa-check"></i>
                </span>
                <span className="lb">Lab type</span>
                <span className="v">Molecular Diagnostics</span>
              </div>
              <div className="wiz-step done">
                <span className="n">
                  <i className="fa-solid fa-check"></i>
                </span>
                <span className="lb">Daily throughput</span>
                <span className="v">100–250 samples</span>
              </div>
              <div className="wiz-step active">
                <span className="n">3</span>
                <span className="lb">Budget range</span>
                <span className="v">৳ 25–50 Lakh</span>
              </div>
              <div
                style={{
                  marginTop: "18px",
                  padding: "13px",
                  background: "var(--teal-tint)",
                  borderRadius: "9px",
                  fontSize: "12.5px",
                  color: "var(--teal-dark)",
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                }}
              >
                <i className="fa-solid fa-circle-info"></i>
                <span>
                  Estimated equipment list: <b>34 items</b> · Lead time 6–8
                  weeks
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ DOCUMENT VAULT ============================ */}
      <section className="docs">
        <div className="wrap">
          <div>
            <span className="tag">Document Vault</span>
            <h2>Regulatory-ready procurement</h2>
            <p className="sub">
              Every product listing includes the documentation your purchase
              committee, biosafety officer, and auditors expect — downloadable
              in one click, attached to every quotation.
            </p>
          </div>
          <div className="docs-grid">
            <div className="doc-card">
              <div className="ic">
                <i className="fa-solid fa-file-shield"></i>
              </div>
              <div className="nm">MSDS</div>
              <div className="desc">Material Safety Data Sheet</div>
            </div>
            <div className="doc-card">
              <div className="ic">
                <i className="fa-solid fa-certificate"></i>
              </div>
              <div className="nm">CoA</div>
              <div className="desc">Certificate of Analysis</div>
            </div>
            <div className="doc-card">
              <div className="ic">
                <i className="fa-solid fa-book"></i>
              </div>
              <div className="nm">Brochure</div>
              <div className="desc">Product specifications</div>
            </div>
            <div className="doc-card">
              <div className="ic">
                <i className="fa-solid fa-clipboard-list"></i>
              </div>
              <div className="nm">IFU</div>
              <div className="desc">Instructions for Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ TRUST BAR ============================ */}
      <section className="trust" id="about">
        <div className="wrap">
          <div className="trust-head">
            <div className="tag">Official distributors of</div>
            <h3>Authorized supply chain across Bangladesh</h3>
          </div>
          <div className="trust-logos">
            <span className="tlogo">
              <span className="dot" style={{ background: "#E03C32" }}></span>{" "}
              Thermo Fisher
            </span>
            <span className="tlogo">
              <span className="dot" style={{ background: "#000" }}></span>{" "}
              BIO·RAD
            </span>
            <span className="tlogo">
              <span className="dot" style={{ background: "#003B71" }}></span>{" "}
              QIAGEN
            </span>
            <span className="tlogo">
              <span className="dot" style={{ background: "#0066CC" }}></span>{" "}
              Roche
            </span>
            <span className="tlogo">
              <span className="dot" style={{ background: "#00857C" }}></span>{" "}
              Abbott
            </span>
            <span className="tlogo">
              <span className="dot" style={{ background: "#7C2D8A" }}></span>{" "}
              Merck
            </span>
            <span className="tlogo">
              <span className="dot" style={{ background: "#005EB8" }}></span>{" "}
              Eppendorf
            </span>
            <span className="tlogo">
              <span className="dot" style={{ background: "#E60012" }}></span>{" "}
              Sansure
            </span>
          </div>
          <div className="trust-foot">
            <i className="fa-solid fa-shield-halved" style={{ color: "var(--success)", marginRight: "5px" }}></i>
            Institution-verified reviews only — from actual buyers with confirmed
            POs
          </div>
        </div>
      </section>

      {/* ============================ FOOTER ============================ */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <a href="/" className="logo" onClick={handleLogoClick}>
                <span className="logo-mark">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 3c0 4 14 4 14 0M5 21c0-4 14-4 14 0M6 7c0 3 12 3 12 0M6 17c0-3 12-3 12 0"
                      stroke="#fff"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    ></path>
                    <path
                      d="M10 9.5h4M10 14.5h4M12 8v8"
                      stroke="#F59E0B"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    ></path>
                  </svg>
                </span>
                <span className="logo-text">
                  <span className="b1">MediHub BD</span>
                  <span className="b2">Scientific Marketplace</span>
                </span>
              </a>
              <p>
                Bangladesh's regulated marketplace for scientific procurement —
                connecting hospitals, universities, diagnostic labs, and research
                institutions with verified distributors.
              </p>
              <div className="contact">
                <span>
                  <i className="fa-solid fa-location-dot"></i> Banani, Dhaka 1213,
                  Bangladesh
                </span>
                <span>
                  <i className="fa-solid fa-phone"></i> +880 1700-110200
                </span>
                <span>
                  <i className="fa-solid fa-envelope"></i> hello@medihub.com.bd
                </span>
              </div>
            </div>
            <div className="foot-col">
              <h4>For Buyers</h4>
              <ul>
                <li>
                  <a href="#">Browse Products</a>
                </li>
                <li>
                  <a href="#">Request Quote</a>
                </li>
                <li>
                  <a href="#wizard">Lab Setup Wizard</a>
                </li>
                <li>
                  <a href="#">Institutional Accounts</a>
                </li>
                <li>
                  <a href="#">Order Tracking</a>
                </li>
              </ul>
            </div>
            <div className="foot-col">
              <h4>For Sellers</h4>
              <ul>
                <li>
                  <a href="#">Apply as Seller</a>
                </li>
                <li>
                  <Link href="/seller/login">Seller Portal</Link>
                </li>
                <li>
                  <a href="#tender">Tender Bidding</a>
                </li>
                <li>
                  <a href="#">Verification Process</a>
                </li>
                <li>
                  <a href="#">Seller Analytics</a>
                </li>
              </ul>
            </div>
            <div className="foot-col">
              <h4>Marketplace</h4>
              <ul>
                <li>
                  <a href="#categories">Categories</a>
                </li>
                <li>
                  <a href="#tender">Tender Board</a>
                </li>
                <li>
                  <a href="#">Custom Primers</a>
                </li>
                <li>
                  <a href="#">Brands</a>
                </li>
                <li>
                  <a href="#">New Arrivals</a>
                </li>
              </ul>
            </div>
            <div className="foot-col">
              <h4>Support</h4>
              <ul>
                <li>
                  <a href="#">Help Center</a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowChatPop(true); }}>Technical Chat</a>
                </li>
                <li>
                  <a href="#">Returns Policy</a>
                </li>
                <li>
                  <a href="#">Terms of Service</a>
                </li>
                <li>
                  <a href="#">Privacy</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <span>
              © 2026 MediHub Bangladesh Ltd · Regulated marketplace for
              scientific procurement in Bangladesh
            </span>
            <div className="badges">
              <span>
                <i
                  className="fa-solid fa-shield-halved"
                  style={{ color: "var(--amber)", marginRight: "5px" }}
                ></i>{" "}
                DGDA-aware
              </span>
              <span>ISO 9001:2015</span>
              <span>SSL Secured</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ============================ COMPARE BAR ============================ */}
      <div className={`compare-bar ${selectedToCompare.length >= 2 ? "show" : ""}`} id="cmpBar" role="region" aria-label="Product comparison">
        <div className="wrap">
          <div className="cmp-items">
            <span className="label">
              <i className="fa-solid fa-scale-balanced"></i> Compare
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {selectedToCompare.map((id) => {
                const s = specs[id];
                if (!s) return null;
                return (
                  <div key={id} className="cmp-chip">
                    <span className="icon">
                      <i className={`fa-solid ${s.icon}`}></i>
                    </span>
                    <span className="nm">{s.name}</span>
                    <span
                      className="x"
                      onClick={() =>
                        setSelectedToCompare((prev) =>
                          prev.filter((item) => item !== id)
                        )
                      }
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="cmp-actions">
            <button
              className="cmp-clear"
              onClick={() => setSelectedToCompare([])}
            >
              Clear all
            </button>
            <button
              className="btn btn-amber"
              onClick={() => setShowCompareModal(true)}
            >
              Compare Now <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* ============================ COMPARE SPECIFICATIONS MODAL ============================ */}
      {showCompareModal && (
        <div
          className="modal-bg show"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCompareModal(false);
          }}
          role="dialog"
          aria-label="Comparison"
        >
          <div className="modal">
            <div className="modal-head">
              <div>
                <div className="section-eyebrow" style={{ marginBottom: "4px" }}>
                  Side-by-side comparison
                </div>
                <h3>Compare specifications</h3>
              </div>
              <button
                className="close"
                onClick={() => setShowCompareModal(false)}
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <table className="cmp-table">
                <tbody>
                  <tr>
                    <th></th>
                    {selectedToCompare.map((id) => {
                      const s = specs[id];
                      if (!s) return null;
                      return (
                        <td key={id} className="prodhead">
                          <div className="nm">{s.name}</div>
                          <div className="br">
                            {s.brand} · {s.cat}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  {[
                    ["Brand", "brand"],
                    ["Catalogue #", "cat"],
                    ["Distributor", "seller"],
                    ["Unit price", "price"],
                    ["Bulk price", "bulk"],
                    ["Delivery time", "delivery"],
                    ["Stock status", "stock"],
                    ["Cold chain", "cold"],
                    ["Expiry", "expiry"],
                    ["Sample type", "sample"],
                    ["Specs / Performance", "sens"],
                  ].map(([label, key]) => (
                    <tr key={key}>
                      <th>{label}</th>
                      {selectedToCompare.map((id) => {
                        const s = specs[id];
                        if (!s) return null;
                        return <td key={id}>{(s as any)[key]}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================ SUPPORT CHAT WIDGET ============================ */}
      <div className="chat-fab">
        <div className={`chat-pop ${showChatPop ? "show" : ""}`} id="chatPop"
             onMouseEnter={() => { isChatHovered.current = true; }}
             onMouseLeave={() => { isChatHovered.current = false; }}>
          <button
            className="x"
            onClick={() => setShowChatPop(false)}
            aria-label="close"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="head">
            <div className="av">RF</div>
            <div className="av-info">
              <div className="nm">Rafiq · Tech Support</div>
              <div className="st">Online · usually replies in 2 min</div>
            </div>
          </div>
          <div className="msg">
            Have compatibility questions about a kit or instrument? Chat directly
            with the seller's technical team — no login required.
          </div>
          <div className="footer">
            <span>💬 Powered by MediHub</span>
            <span>Mon–Sat · 9am–9pm</span>
          </div>
        </div>
        <button
          className="chat-bubble"
          onClick={() => setShowChatPop((prev) => !prev)}
          aria-label="Open chat"
        >
          <i className="fa-solid fa-comment-medical"></i>
          <span className="badge">1</span>
        </button>
      </div>

      {/* ============================ LAB SETUP WIZARD MODAL ============================ */}
      {showWizard && (
        <div
          className="mh-modal-bg show"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowWizard(false);
          }}
        >
          <div className="mh-modal">
            <span className="mh-pill">Lab Setup Wizard</span>
            <div style={{ display: "flex", gap: "6px", margin: "14px 0" }}>
              <i
                style={{
                  height: "5px",
                  flex: 1,
                  borderRadius: "3px",
                  background: wizardStep >= 0 ? "#0D6E6E" : "#E3EAEA",
                }}
              ></i>
              <i
                style={{
                  height: "5px",
                  flex: 1,
                  borderRadius: "3px",
                  background: wizardStep >= 1 ? "#0D6E6E" : "#E3EAEA",
                }}
              ></i>
              <i
                style={{
                  height: "5px",
                  flex: 1,
                  borderRadius: "3px",
                  background: wizardStep >= 2 ? "#0D6E6E" : "#E3EAEA",
                }}
              ></i>
            </div>

            {wizardStep === 0 && (
              <>
                <h3 style={{ margin: "6px 0 14px" }}>
                  What type of lab are you setting up?
                </h3>
                {Object.keys(labSetupTemplates).map((type) => (
                  <button
                    key={type}
                    className="btn btn-outline"
                    style={{
                      width: "100%",
                      justifyContent: "flex-start",
                      marginBottom: "8px",
                    }}
                    onClick={() => {
                      setWizardType(type);
                      setWizardStep(1);
                    }}
                  >
                    {type}
                  </button>
                ))}
              </>
            )}

            {wizardStep === 1 && (
              <>
                <h3 style={{ margin: "6px 0 6px" }}>Scale &amp; budget</h3>
                <p className="mh-muted" style={{ fontSize: "13px", marginBottom: "14px" }}>
                  {wizardType}
                </p>
                <div className="mh-field">
                  <label>Daily sample load</label>
                  <select
                    value={wizardLoad}
                    onChange={(e) => setWizardLoad(e.target.value)}
                  >
                    <option>Low (under 20/day)</option>
                    <option>Medium (20-100/day)</option>
                    <option>High (100+/day)</option>
                  </select>
                </div>
                <div className="mh-field">
                  <label>Indicative budget</label>
                  <select
                    value={wizardBudget}
                    onChange={(e) => setWizardBudget(e.target.value)}
                  >
                    <option>Under ৳10L</option>
                    <option>৳10-50L</option>
                    <option>৳50L+</option>
                  </select>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                  <button className="btn btn-outline" onClick={() => setWizardStep(0)}>
                    Back
                  </button>
                  <button className="btn btn-amber" onClick={() => setWizardStep(2)}>
                    See recommended list
                  </button>
                </div>
              </>
            )}

            {wizardStep === 2 && wizardType && (
              <>
                <span className="mh-pill green">Recommended starter list</span>
                <h3 style={{ margin: "10px 0 4px" }}>{wizardType}</h3>
                <p className="mh-muted" style={{ fontSize: "13px", marginBottom: "10px" }}>
                  A ready-to-quote bundle - request one combined quotation from matched sellers.
                </p>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {labSetupTemplates[wizardType].map((item, idx) => (
                    <li
                      key={idx}
                      style={{
                        padding: "6px 0",
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <i className="fa-solid fa-check" style={{ color: "#0D6E6E" }}></i>{" "}
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  className="btn btn-amber"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    marginTop: "14px",
                  }}
                  onClick={() => {
                    setShowWizard(false);
                  }}
                >
                  Request combined quote
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============================ TENDER BOARD LIST MODAL ============================ */}
      {showTenderList && (
        <div
          className="mh-modal-bg show"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTenderList(false);
          }}
        >
          <div className="mh-modal">
            <span className="mh-pill blue">Open RFQs</span>
            <h3 style={{ margin: "10px 0 14px" }}>All open tenders</h3>
            
            {[
              { inst: "Dhaka Medical College Hospital", prod: "HBsAg Rapid Test Cassettes (CE-IVD)", qty: "50,000 tests" },
              { inst: "BUET Biotechnology Dept.", prod: "Real-Time PCR System (96-well, 4-channel)", qty: "2 units + 1-yr AMC" },
              { inst: "Popular Diagnostic Centre", prod: "Cobas e411 Reagent Cassettes — multi-assay", qty: "Bulk · 6-mo contract" }
            ].map((tender, idx) => (
              <div className="mh-list-row" key={idx}>
                <div>
                  <div className="t">{tender.prod}</div>
                  <div className="s">{tender.inst} · {tender.qty}</div>
                </div>
                <button
                  className="btn btn-amber"
                  onClick={() => {
                    setActiveTender(tender);
                    setShowTenderList(false);
                    setShowBidModal(true);
                  }}
                >
                  Bid
                </button>
              </div>
            ))}
            
            <button
              className="btn btn-outline"
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: "14px",
              }}
              onClick={() => setShowTenderList(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ============================ TENDER DETAILS MODAL ============================ */}
      {showTenderModal && activeTender && (
        <div
          className="mh-modal-bg show"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTenderModal(false);
          }}
        >
          <div className="mh-modal">
            <span className="mh-pill blue">Open RFQ</span>
            <h3 style={{ margin: "10px 0 4px" }}>{activeTender.prod}</h3>
            <p className="mh-muted" style={{ fontSize: "13px", marginBottom: "14px" }}>
              {activeTender.inst} · {activeTender.qty}
            </p>
            <div className="mh-panel" style={{ margin: "0 0 14px" }}>
              <div className="mh-list-row">
                <span className="mh-muted">Status</span>
                <b>Open for bids</b>
              </div>
              <div className="mh-list-row">
                <span className="mh-muted">Submission</span>
                <b>Sealed until close</b>
              </div>
              <div className="mh-list-row">
                <span className="mh-muted">Documents</span>
                <b>Spec sheet + ToR attached</b>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowTenderModal(false)}
              >
                Close
              </button>
              <button
                className="btn btn-amber"
                onClick={() => {
                  setShowTenderModal(false);
                  setShowBidModal(true);
                }}
              >
                Submit a bid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================ TENDER BID SUBMISSION MODAL ============================ */}
      {showBidModal && activeTender && (
        <div
          className="mh-modal-bg show"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowBidModal(false);
              setBidSubmitted(false);
            }
          }}
        >
          <div className="mh-modal">
            {!bidSubmitted ? (
              <>
                <span className="mh-pill blue">Submit a bid</span>
                <h3 style={{ margin: "10px 0 4px" }}>{activeTender.prod}</h3>
                <div className="mh-two" style={{ marginTop: "10px" }}>
                  <div className="mh-field">
                    <label>Your company</label>
                    <input type="text" defaultValue="Genetica Ltd." readOnly />
                  </div>
                  <div className="mh-field">
                    <label>Quoted unit price (৳)</label>
                    <input type="number" placeholder="Enter bid price" />
                  </div>
                </div>
                <div className="mh-two">
                  <div className="mh-field">
                    <label>Delivery lead time</label>
                    <input type="text" placeholder="e.g. 3-5 days" />
                  </div>
                  <div className="mh-field">
                    <label>Warranty / AMC</label>
                    <input type="text" placeholder="e.g. 1 yr + training" />
                  </div>
                </div>
                <div className="mh-field">
                  <label>Notes</label>
                  <textarea placeholder="Compliance, brand, validity..."></textarea>
                </div>
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => setShowBidModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-amber"
                    onClick={() => setBidSubmitted(true)}
                  >
                    Submit bid
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "#D1FAE5",
                    color: "#059669",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "28px",
                    margin: "0 auto 14px",
                  }}
                >
                  <i className="fa-solid fa-check"></i>
                </div>
                <h3>Bid submitted!</h3>
                <p className="mh-muted" style={{ margin: "8px 0 18px" }}>
                  Sealed until the tender closes.
                </p>
                <button
                  className="btn btn-amber"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => {
                    setShowBidModal(false);
                    setBidSubmitted(false);
                  }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
