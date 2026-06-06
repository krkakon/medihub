"use client";

import Link from "next/link";
import { useState } from "react";

interface ProductItem {
  name: string;
  price: number;
  bulk: number;
  delivery: string;
  stock: number;
  sold: number;
}

interface RequestItem {
  id: number;
  who: string;
  item: string;
  qty: number;
  note: string;
  done: boolean;
}

export default function SellerDashboard() {
  const [products, setProducts] = useState<ProductItem[]>([
    { name: "HBV DNA RT-PCR Kit (50T)", price: 18500, bulk: 16800, delivery: "3-5 days", stock: 42, sold: 212 },
    { name: "Bio-Rad CFX96 Touch System", price: 2350000, bulk: 2290000, delivery: "5-7 wks", stock: 3, sold: 6 },
    { name: "Taq Master Mix 2X (1 mL)", price: 4200, bulk: 3700, delivery: "2-3 days", stock: 120, sold: 880 }
  ]);

  const [requests, setRequests] = useState<RequestItem[]>([
    { id: 1, who: "Dr. Rafiq - Sr. Microbiologist, Square Hospital", item: "HBV DNA RT-PCR Kit", qty: 25, note: "Need quarterly supply quote with bulk rate.", done: false },
    { id: 2, who: "Procurement Officer - BSMMU", item: "CFX96 Touch System", qty: 2, note: "Tender - include warranty and training.", done: false },
    { id: 3, who: "Lab Manager - icddr,b", item: "Taq Master Mix 2X", qty: 50, note: "Urgent restock.", done: false }
  ]);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNpName, setNewNpName] = useState("");
  const [newNpPrice, setNewNpPrice] = useState("");
  const [newNpDel, setNewNpDel] = useState("");

  const handleProductChange = (index: number, field: keyof ProductItem, value: any) => {
    setProducts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAnswerRequest = (id: number) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, done: true } : r))
    );
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newNpName || "New product";
    const price = parseFloat(newNpPrice) || 0;
    const delivery = newNpDel || "3-5 days";
    const bulk = Math.round(price * 0.92);

    setProducts((prev) => [
      { name, price, bulk, delivery, stock: 0, sold: 0 },
      ...prev
    ]);

    // Reset fields and close modal
    setNewNpName("");
    setNewNpPrice("");
    setNewNpDel("");
    setShowAddModal(false);
  };

  const formatMoney = (n: number) => {
    return "৳" + n.toLocaleString("en-IN");
  };

  const openRequestsCount = requests.filter((r) => !r.done).length;

  return (
    <div id="sellerhome" className="view show">
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
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span className="mh-pill amber">Seller Portal &middot; Genetica Ltd.</span>
            <h1 style={{ marginTop: "10px" }}>Dashboard</h1>
          </div>
          <button className="btn btn-amber" onClick={() => setShowAddModal(true)}>
            <i className="fa-solid fa-plus"></i> Add product
          </button>
        </div>

        <div className="mh-stats">
          <div className="mh-stat">
            <b>{products.length}</b>
            <small>Active products</small>
          </div>
          <div className="mh-stat">
            <b id="mhKpiReq">{openRequestsCount}</b>
            <small>Open quote requests</small>
          </div>
          <div className="mh-stat">
            <b>৳9.4L</b>
            <small>Sales this month</small>
          </div>
          <div className="mh-stat">
            <b>96%</b>
            <small>On-time delivery</small>
          </div>
        </div>

        <div className="mh-panel">
          <h3>
            My products{" "}
            <span
              className="mh-muted"
              style={{ fontSize: "13px", fontWeight: 400 }}
            >
              &mdash; edit price, bulk, delivery &amp; stock inline
            </span>
          </h3>
          <table className="mh-table" id="mhSellerProducts">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price (৳)</th>
                <th>Bulk (10+)</th>
                <th>Delivery</th>
                <th>Stock</th>
                <th>Sold</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={i}>
                  <td>
                    <b>{p.name}</b>
                  </td>
                  <td>
                    <input
                      className="mh-edit"
                      type="number"
                      value={p.price}
                      onChange={(e) =>
                        handleProductChange(i, "price", parseFloat(e.target.value) || 0)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="mh-edit"
                      type="number"
                      value={p.bulk}
                      onChange={(e) =>
                        handleProductChange(i, "bulk", parseFloat(e.target.value) || 0)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="mh-edit"
                      value={p.delivery}
                      onChange={(e) =>
                        handleProductChange(i, "delivery", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="mh-edit"
                      type="number"
                      value={p.stock}
                      style={{ maxWidth: "80px" }}
                      onChange={(e) =>
                        handleProductChange(i, "stock", parseInt(e.target.value) || 0)
                      }
                    />
                  </td>
                  <td>{p.sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mh-panel">
          <h3>Incoming quotation requests</h3>
          <div id="mhReqList">
            {requests.map((r) => (
              <div className={`mh-req ${r.done ? "done" : ""}`} key={r.id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <b>{r.item}</b> - qty {r.qty}
                    <div className="mh-muted" style={{ fontSize: "13px" }}>
                      {r.who}
                    </div>
                    <div style={{ fontSize: "13px", marginTop: "4px" }}>
                      &quot;{r.note}&quot;
                    </div>
                  </div>
                  <div>
                    {r.done ? (
                      <span className="mh-pill green">Quote sent</span>
                    ) : (
                      <button
                        className="btn btn-amber"
                        onClick={() => handleAnswerRequest(r.id)}
                      >
                        Send quote
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================ ADD PRODUCT MODAL ============================ */}
      {showAddModal && (
        <div
          className="mh-modal-bg show"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="mh-modal">
            <h3>Add a new product</h3>
            <p className="mh-muted" style={{ fontSize: "13px", marginBottom: "14px" }}>
              Demo form &mdash; fields only.
            </p>
            <form onSubmit={handleSaveProduct}>
              <div className="mh-field">
                <label>Product name</label>
                <input
                  id="mhNpName"
                  placeholder="e.g. SARS-CoV-2 RT-PCR Kit (100T)"
                  value={newNpName}
                  onChange={(e) => setNewNpName(e.target.value)}
                  required
                />
              </div>
              <div className="mh-two">
                <div className="mh-field">
                  <label>Price (৳)</label>
                  <input
                    id="mhNpPrice"
                    type="number"
                    placeholder="32000"
                    value={newNpPrice}
                    onChange={(e) => setNewNpPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="mh-field">
                  <label>Delivery</label>
                  <input
                    id="mhNpDel"
                    placeholder="3-5 days"
                    value={newNpDel}
                    onChange={(e) => setNewNpDel(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                  marginTop: "8px",
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-amber">
                  Save product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
