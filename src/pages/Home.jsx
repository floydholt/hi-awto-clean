import React from "react";

export default function HowItWorks() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">How HI-AWTO Works</h1>

      <p className="text-slate-600 mb-8">
        HI-AWTO (Here Is Another Way To Own) is a modular, real-time platform that connects buyers, sellers, and agents through premium listings, transparent workflows, and data-driven insights.
      </p>

      <div className="space-y-8">
        {/* Buyer Section */}
        <section>
          <h2 className="text-xl font-semibold text-sky-700 mb-2">🏠 For Buyers</h2>
          <ul className="list-disc list-inside text-slate-700">
            <li>Browse verified listings with real-time updates</li>
            <li>Request brochures and schedule viewings instantly</li>
            <li>Track your interest history and agent responses</li>
          </ul>
        </section>

        {/* Seller Section */}
        <section>
          <h2 className="text-xl font-semibold text-sky-700 mb-2">📤 For Sellers</h2>
          <ul className="list-disc list-inside text-slate-700">
            <li>Create listings and upload brochures with ease</li>
            <li>Monitor buyer engagement and lead quality</li>
            <li>Collaborate with agents to optimize visibility</li>
          </ul>
        </section>

        {/* Agent Section */}
        <section>
          <h2 className="text-xl font-semibold text-sky-700 mb-2">🧭 For Agents</h2>
          <ul className="list-disc list-inside text-slate-700">
            <li>Moderate listings and ensure platform standards</li>
            <li>Track leads and respond to buyer inquiries</li>
            <li>Access analytics to improve conversion rates</li>
          </ul>
        </section>
      </div>

      <div className="mt-12 text-center">
        <p className="text-slate-600">
          HI-AWTO is redefining real estate ownership — one modular step at a time.
        </p>
      </div>
    </div>
  );
}
