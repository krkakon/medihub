"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
  const router = useRouter();
  const [role, setRole] = useState<"BUYER" | "SELLER">("BUYER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [designation, setDesignation] = useState("Sr. Research Officer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
          institutionName: role === "BUYER" ? institutionName : institutionName, // Both map to company/institution name
          designation: role === "BUYER" ? designation : "Sales Director",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(role === "BUYER" ? "/buyer/login" : "/seller/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="register" className="view show">
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

      <div className="login-wrap" style={{ minHeight: "80vh" }}>
        <div className="login-card">
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "16px" }}>
            <button
              type="button"
              className={`btn ${role === "BUYER" ? "btn-teal" : "btn-outline"}`}
              style={{ flex: 1, justifyContent: "center", fontSize: "12px", padding: "8px" }}
              onClick={() => {
                setRole("BUYER");
                setInstitutionName("");
              }}
            >
              <i className="fa-regular fa-user"></i> Buyer Account
            </button>
            <button
              type="button"
              className={`btn ${role === "SELLER" ? "btn-amber" : "btn-outline"}`}
              style={{ flex: 1, justifyContent: "center", fontSize: "12px", padding: "8px" }}
              onClick={() => {
                setRole("SELLER");
                setInstitutionName("");
              }}
            >
              <i className="fa-solid fa-store"></i> Seller Account
            </button>
          </div>

          <h1 style={{ margin: "4px 0 10px", fontSize: "23px", textAlign: "center" }}>
            Create your account
          </h1>
          <p className="mh-muted" style={{ fontSize: "13px", marginBottom: "18px", textAlign: "center" }}>
            {role === "BUYER" 
              ? "Access institutional term limits and request quotes." 
              : "Register as a verified distributor to bid on active tenders."}
          </p>

          {error && (
            <div style={{ padding: "10px", background: "#FEE2E2", color: "#991B1B", borderRadius: "8px", fontSize: "13px", marginBottom: "14px" }}>
              <i className="fa-solid fa-triangle-exclamation"></i> {error}
            </div>
          )}

          {success && (
            <div style={{ padding: "10px", background: "#D1FAE5", color: "#065F46", borderRadius: "8px", fontSize: "13px", marginBottom: "14px" }}>
              <i className="fa-solid fa-circle-check"></i> Registration successful! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mh-field">
              <label>{role === "BUYER" ? "Institution Name" : "Company Name"}</label>
              <input
                type="text"
                placeholder={role === "BUYER" ? "e.g. Dhaka Medical College" : "e.g. Genetica Ltd."}
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                required
              />
            </div>

            {role === "BUYER" && (
              <div className="mh-field">
                <label>Designation</label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                >
                  <option>Sr. Research Officer</option>
                  <option>Lab In-charge</option>
                  <option>Procurement Officer</option>
                  <option>Faculty / PI</option>
                </select>
              </div>
            )}

            <div className="mh-field">
              <label>Work Email</label>
              <input
                type="email"
                placeholder="name@institution.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mh-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className={`btn ${role === "BUYER" ? "btn-teal" : "btn-amber"}`}
              style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
              disabled={loading || success}
            >
              {loading ? "Creating account..." : "Sign up"} <i className="fa-solid fa-arrow-right"></i>
            </button>
          </form>

          <p className="mh-muted" style={{ fontSize: "12px", textAlign: "center", marginTop: "14px" }}>
            Already have an account?{" "}
            <Link 
              href={role === "BUYER" ? "/buyer/login" : "/seller/login"}
              style={{ color: "var(--teal)", fontWeight: 700, cursor: "pointer" }}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
