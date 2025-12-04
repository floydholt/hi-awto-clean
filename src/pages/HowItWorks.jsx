// src/pages/HowItWorks.jsx
import React from "react";

export default function HowItWorks() {
  return (
    <div className="bg-white text-slate-800">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 text-center px-6">
        <h1 className="text-5xl font-bold mb-4">Lease-to-Own Made Simple</h1>
        <p className="text-lg max-w-2xl mx-auto">
          HI-AWTO helps renters become homeowners with flexible terms and transparent pricing.
        </p>
        <a
          href="/search"
          className="mt-6 inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow hover:bg-slate-100"
        >
          Browse Homes →
        </a>
      </section>

      {/* 3-STEP MODEL */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "🏠",
              title: "Find Your Home",
              desc: "Browse available properties and choose the home that fits your needs.",
            },
            {
              icon: "📈",
              title: "Lease & Build Equity",
              desc: "Move in, pay rent monthly, and build equity credits toward ownership.",
            },
            {
              icon: "🔑",
              title: "Purchase When Ready",
              desc: "Apply your credits toward your down payment and buy the home.",
            },
          ].map((step, i) => (
            <div
              key={i}
              className="bg-white p-6 shadow-lg rounded-xl text-center transition hover:scale-105 hover:shadow-xl"
            >
              <div className="text-4xl mb-3">{step.icon}</div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-slate-600 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-4">Why Lease-to-Own?</h2>
        <ul className="list-disc ml-6 text-slate-700 space-y-2">
          <li>Lower barrier to homeownership</li>
          <li>Flexible lease terms</li>
          <li>Option to buy — no obligation</li>
          <li>Equity credits applied toward purchase</li>
          <li>Ideal for renters preparing for mortgage approval</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="text-center py-12">
        <a
          href="/search"
          className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 shadow"
        >
          Browse Available Homes →
        </a>
      </section>
    </div>
  );
}
