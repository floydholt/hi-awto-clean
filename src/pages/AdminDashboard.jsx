// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "../firebase";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    listings: null,
    leads: null,
    users: null,
    fraudEvents: null,
    adminLogs: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");

        const collections = {
          listings: "listings",
          leads: "leads",
          users: "users",
          fraudEvents: "fraudEvents",
          adminLogs: "adminLogs",
        };

        const [
          listingsSnap,
          leadsSnap,
          usersSnap,
          fraudSnap,
          logsSnap,
        ] = await Promise.all([
          getCountFromServer(collection(db, collections.listings)),
          getCountFromServer(collection(db, collections.leads)),
          getCountFromServer(collection(db, collections.users)),
          getCountFromServer(collection(db, collections.fraudEvents)),
          getCountFromServer(collection(db, collections.adminLogs)),
        ]);

        if (cancelled) return;

        setStats({
          listings: listingsSnap.data().count,
          leads: leadsSnap.data().count,
          users: usersSnap.data().count,
          fraudEvents: fraudSnap.data().count,
          adminLogs: logsSnap.data().count,
        });
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading admin stats:", err);
          setError("There was a problem loading dashboard data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const metricCards = [
    {
      key: "listings",
      label: "Active Listings",
      description: "Properties in your marketplace.",
      href: "/admin/listings",
    },
    {
      key: "leads",
      label: "Leads",
      description: "Buyer inquiries & pipeline.",
      href: "/admin/leads",
    },
    {
      key: "users",
      label: "Users",
      description: "Agents, admins & buyers.",
      href: "/admin/users",
    },
    {
      key: "fraudEvents",
      label: "Fraud Events",
      description: "AI-flagged risky activity.",
      href: "/admin/fraud",
    },
    {
      key: "adminLogs",
      label: "Admin Logs",
      description: "Audit trail & activity feed.",
      href: "/admin/logs",
    },
  ];

  const quickLinks = [
    {
      title: "Listings Manager",
      body: "Review, approve, or reject listings. Re-run AI checks and generate brochures.",
      href: "/admin/listings",
    },
    {
      title: "Leads & Messaging",
      body: "See new leads, assign them to agents, and open conversations.",
      href: "/admin/leads",
    },
    {
      title: "Fraud Center",
      body: "Investigate AI-flagged listings and risky users.",
      href: "/admin/fraud",
    },
    {
      title: "System Activity",
      body: "View admin logs, AI jobs and important system events.",
      href: "/admin/logs",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
              Admin Console
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900 md:text-3xl">
              HI AWTO Admin Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Monitor listings, leads, fraud checks, and system activity in one
              place. This view reflects your live Firestore data.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              ← Back to site
            </Link>
            <Link
              to="/admin/listings/new"
              className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
            >
              + New Listing
            </Link>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metricCards.map((card) => {
              const value = stats[card.key];
              return (
                <Link
                  key={card.key}
                  to={card.href}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
                >
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {card.label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">
                      {loading ? (
                        <span className="inline-flex items-center text-sm text-slate-400">
                          Loading…
                        </span>
                      ) : (
                        value ?? "—"
                      )}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {card.description}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center text-xs font-medium text-sky-600 group-hover:text-sky-700">
                    View details
                    <span className="ml-1">→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Quick actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {quickLinks.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
              >
                <h3 className="text-sm font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600">{item.body}</p>
                <span className="mt-4 text-xs font-medium text-sky-600">
                  Open {item.title} →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-16 rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 p-6 text-sm text-slate-600">
          <p className="font-medium text-slate-800">
            Coming next for this dashboard
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
            <li>Live activity feed of admin actions and AI events.</li>
            <li>Charts for listings created per week and lead conversion.</li>
            <li>Shortcuts to moderate flagged listings or fraud alerts.</li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
