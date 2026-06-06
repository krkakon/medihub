"use client";

import Link from "next/link";

export default function BuyerDashboard() {
  return (
    <div id="buyerhome" className="view show">
      <div className="pg-head">
        <div className="inner">
          <a href="/" className="pg-logo">
            <svg viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="13" fill="#0D6E6E" />
              <path
                d="M16 14c0 5 16 5 16 0M16 34c0-5 16-5 16 0M17 19c0 3.5 14 3.5 14 0M17 29c0-3.5 14-3.5 14 0"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M22 23h4M22 25h4M24 21v6"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>
              MediHub <b>BD</b>
            </span>
          </a>
          <a href="/" className="pg-back">
            <i className="fa-solid fa-arrow-left"></i> Back to marketplace
          </a>
        </div>
      </div>

      <div className="pg">
        <span className="mh-pill">Buyer Dashboard &middot; ideSHi</span>
        <h1 style={{ marginTop: "10px" }}>Welcome back, Manos</h1>
        <p className="mh-muted">Sr. Research Officer &middot; ideSHi</p>
        
        <div className="mh-stats">
          <div className="mh-stat">
            <b>4</b>
            <small>Open quotations</small>
          </div>
          <div className="mh-stat">
            <b>2</b>
            <small>Orders in transit</small>
          </div>
          <div className="mh-stat">
            <b>11</b>
            <small>Saved products</small>
          </div>
          <div className="mh-stat">
            <b>৳2.6L</b>
            <small>Spent this quarter</small>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
          <a href="/" className="btn btn-amber">
            <i className="fa-solid fa-magnifying-glass"></i> Browse products
          </a>
          <Link href="/#tender" className="btn btn-outline">
            <i className="fa-regular fa-file-lines"></i> Request a quotation
          </Link>
        </div>

        <div className="mh-panel">
          <h3>My quotation requests</h3>
          <div className="mh-list-row">
            <div>
              <div className="t">HBV DNA RT-PCR Kit (50T) &times; 25</div>
              <div className="s">Genetica Ltd. &middot; requested 2 days ago</div>
            </div>
            <span className="mh-pill green">Quoted &middot; ৳16,800/kit</span>
          </div>
          <div className="mh-list-row">
            <div>
              <div className="t">Bio-Rad CFX96 Touch System &times; 1</div>
              <div className="s">Diagnostic Solutions BD &middot; requested 5 days ago</div>
            </div>
            <span className="mh-pill amber">Awaiting reply</span>
          </div>
          <div className="mh-list-row">
            <div>
              <div className="t">Taq Master Mix 2X &times; 50</div>
              <div className="s">BioMed Distributors &middot; requested 1 week ago</div>
            </div>
            <span className="mh-pill blue">Accepted &middot; PO raised</span>
          </div>
        </div>

        <div className="mh-panel">
          <h3>Recent orders</h3>
          <div className="mh-list-row">
            <div>
              <div className="t">Filter Pipette Tips 200&micro;L &times; 10 racks</div>
              <div className="s">Order #MH-20451 &middot; BioMed Distributors</div>
            </div>
            <span className="mh-pill amber">In transit</span>
          </div>
          <div className="mh-list-row">
            <div>
              <div className="t">2X qPCR SYBR Master Mix &times; 5</div>
              <div className="s">Order #MH-20388 &middot; Asia Scientific</div>
            </div>
            <span className="mh-pill green">Delivered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
