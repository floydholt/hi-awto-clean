// src/pages/AgentDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const AgentDashboard = () => {
  const [agentProfile, setAgentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    listingsCount: 0,
    leadsCount: 0,
  });
  const [listings, setListings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadAgentData = async () => {
      try {
        setLoading(true);
        setError("");

        const user = auth.currentUser;
        if (!user) {
          setError("You must be logged in as an agent to view this page.");
          setLoading(false);
          return;
        }

        const uid = user.uid;

        const userDocRef = doc(db, "users", uid);
        const userSnap = await getDoc(userDocRef);

        const profile = userSnap.exists()
          ? { id: uid, ...userSnap.data() }
          : {
              id: uid,
              name: user.displayName || "Agent",
              email: user.email,
            };

        if (cancelled) return;

        setAgentProfile(profile);

        const listingsRef = collection(db, "listings");
        const leadsRef = collection(db, "leads");

        const myListingsQuery = query(
          listingsRef,
          where("agentId", "==", uid),
          limit(5)
        );

        const myLeadsQuery = query(
          leadsRef,
          where("assignedAgentId", "==", uid),
          limit(5)
        );

        const [listingsSnap, leadsSnap] = await Promise.all([
          getDocs(myListingsQuery),
          getDocs(myLeadsQuery),
        ]);

        if (cancelled) return;

        const listingsData = listingsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        const leadsData = leadsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setListings(listingsData);
        setLeads(leadsData);
        setStats({
          listingsCount: listingsData.length,
          leadsCount: leadsData.length,
        });
      } catch (err) {
        console.error("Error loading agent dashboard:", err);
        if (!cancelled) {
          setError(
            "There was a problem loading your agent dashboard. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadAgentData();

    return () => {
      cancelled = true;
    };
  }, []);

  const name =
    agentProfile?.name ||
    auth.currentUser?.displayName ||
    "Agent";

  const email =
    agentProfile?.email || auth.currentUser?.email || "";

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
              Agent Console
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900 md:text-3xl">
              Welcome back, {name}
            </h1>
            {email && (
              <p className="mt-1 text-xs text-slate-500">
                {email}
              </p>
            )}
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              View your assigned listings, leads, and upcoming follow-ups in one
              place. This dashboard is just for agents.
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
              to="/agent/messages"
              className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
            >
              Open Messages
            </Link>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  My Listings
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {loading ? "…" : stats.listingsCount}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Listings currently assigned to you.
                </p>
              </div>
              <Link
                to="/agent/listings"
                className="mt-4 inline-flex items-center text-xs font-medium text-sky-600 hover:text-sky-700"
              >
                View all my listings →
              </Link>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  My Leads
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {loading ? "…" : stats.leadsCount}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Leads assigned to you in the pipeline.
                </p>
              </div>
              <Link
                to="/agent/leads"
                className="mt-4 inline-flex items-center text-xs font-medium text-sky-600 hover:text-sky-700"
              >
                View all my leads →
              </Link>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-dashed border-slate-300 bg-slate-100/80 p-5 text-slate-600">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Tasks & Reminders
                </p>
                <p className="mt-3 text-xl font-semibold text-slate-800">
                  Coming soon
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  We’ll show scheduled follow-ups and key reminders here once
                  the tasks feature is wired.
                </p>
              </div>
              <span className="mt-4 text-xs text-slate-400">
                Ask Floyd + ChatGPT: “Build My Tasks for agents”
              </span>
            </div>
          </div>
        </section>

        <section className="mb-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                My Listings (recent)
              </h2>
              <Link
                to="/agent/listings"
                className="text-xs font-medium text-sky-600 hover:text-sky-700"
              >
                View all →
              </Link>
            </div>
            {loading ? (
              <p className="text-xs text-slate-400">Loading listings…</p>
            ) : listings.length === 0 ? (
              <p className="text-xs text-slate-500">
                You don’t have any assigned listings yet.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {listings.map((listing) => (
                  <li key={listing.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {listing.title || "Untitled listing"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {listing.address || listing.city || "No address set"}
                        </p>
                      </div>
                      <div className="ml-3 text-right">
                        {listing.price && (
                          <p className="text-sm font-semibold text-slate-900">
                            $
                            {Number(listing.price).toLocaleString()}
                          </p>
                        )}
                        <Link
                          to={`/admin/listings/${listing.id}`}
                          className="mt-1 block text-[11px] font-medium text-sky-600 hover:text-sky-700"
                        >
                          Open in admin →
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                My Leads (recent)
              </h2>
              <Link
                to="/agent/leads"
                className="text-xs font-medium text-sky-600 hover:text-sky-700"
              >
                View all →
              </Link>
            </div>
            {loading ? (
              <p className="text-xs text-slate-400">Loading leads…</p>
            ) : leads.length === 0 ? (
              <p className="text-xs text-slate-500">
                You don’t have any assigned leads yet.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <li key={lead.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {lead.name || lead.email || "Lead"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {lead.email || "No email"} •{" "}
                          {lead.phone || "No phone"}
                        </p>
                      </div>
                      <div className="ml-3 text-right">
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          {lead.status || "New"}
                        </p>
                        {lead.listingId && (
                          <Link
                            to={`/admin/listings/${lead.listingId}`}
                            className="mt-1 block text-[11px] font-medium text-sky-600 hover:text-sky-700"
                          >
                            View listing →
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="mb-16 rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 p-6 text-sm text-slate-600">
          <p className="font-medium text-slate-800">
            Coming next for agents
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
            <li>Inbox view for all conversations with leads and admins.</li>
            <li>“My Tasks” with follow-ups, calls and email reminders.</li>
            <li>Notifications for new leads and new messages.</li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default AgentDashboard;
