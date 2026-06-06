"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SellerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("sales@genetica.com.bd");
  const [password, setPassword] = useState("demo1234");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login and redirect to the dashboard
    router.push("/seller/dashboard");
  };

  return (
    <div id="sellerlogin" className="view show">
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

      <div className="login-wrap">
        <div className="login-card">
          <span className="mh-pill amber">
            <i className="fa-solid fa-store"></i> Seller Portal
          </span>
          <h1 style={{ margin: "12px 0 4px", fontSize: "23px" }}>
            Sign in to manage your products
          </h1>
          <p className="mh-muted" style={{ fontSize: "13px", marginBottom: "18px" }}>
            Demo login &mdash; just click continue.
          </p>
          <form onSubmit={handleLogin}>
            <div className="mh-field">
              <label>Company email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mh-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-amber"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Continue to dashboard <i className="fa-solid fa-arrow-right"></i>
            </button>
          </form>
          <p className="mh-muted" style={{ fontSize: "12px", textAlign: "center", marginTop: "14px" }}>
            New distributor?{" "}
            <a style={{ color: "var(--teal)", fontWeight: 700, cursor: "pointer" }}>
              Apply to sell
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
