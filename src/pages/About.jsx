import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function About() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "What is lease-to-own housing?",
      a: "Lease-to-own lets you live in the home today while working toward ownership over time. Part of your payment can go toward your future purchase.",
    },
    {
      q: "Do I need perfect credit?",
      a: "No. We focus on your whole financial picture, not just a single credit score. Many residents use HI AWTO as a bridge to mortgage readiness.",
    },
    {
      q: "Can I bring my own home into the program?",
      a: "Yes. In many cases you can identify a home you love and explore whether it qualifies for HI AWTO’s lease-to-own structure.",
    },
    {
      q: "Is there a long-term commitment?",
      a: "You’ll have a clearly defined lease term and purchase option. You’ll always know your timelines and your path to buy before you move in.",
    },
  ];

  const testimonials = [
    {
      name: "Jordan M.",
      role: "First-time buyer",
      quote:
        "HI AWTO made it possible for me to move into a home I love while working toward ownership. The process was clear and surprisingly flexible.",
    },
    {
      name: "Alicia & Mark R.",
      role: "Growing family",
      quote:
        "We weren’t ready for a traditional mortgage. Lease-to-own gave us time to clean up our finances without putting our dream home on hold.",
    },
    {
      name: "Chris T.",
      role: "Self-employed",
      quote:
        "As an entrepreneur, my income doesn’t fit a normal box. HI AWTO looked at my situation holistically and gave me a real path to owning.",
    },
  ];

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-16">
      {/* PAGE HERO */}
      <section className="pt-16 pb-10 px-4 text-center bg-white border-b border-gray-100">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          How HI AWTO Works
        </h1>
        <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
          We’re building another path to homeownership for real people with
          real lives, using lease-to-own as a bridge instead of a barrier.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800">
          Three Simple Phases
        </h2>
        <p className="text-center text-gray-600 mt-2 mb-10">
          From browsing to moving in, here’s how HI AWTO fits into your journey.
        </p>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
            <div className="text-blue-600 text-4xl font-extrabold mb-3">1</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Choose Your Home
            </h3>
            <p className="text-gray-600">
              Pick from HI AWTO’s available properties or submit a home you’ve
              found to see if it qualifies for the program.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
            <div className="text-blue-600 text-4xl font-extrabold mb-3">2</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Sign & Move In
            </h3>
            <p className="text-gray-600">
              If approved, you sign a lease and an option agreement outlining
              your path to buy. You move in as a resident from day one.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
            <div className="text-blue-600 text-4xl font-extrabold mb-3">3</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Work Toward Ownership
            </h3>
            <p className="text-gray-600">
              Use your lease period to stabilize income, improve credit, and
              prepare for a traditional mortgage or other financing option.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800">
            Stories From Residents
          </h2>
          <p className="text-center text-gray-600 mt-2 mb-10">
            Hear from people who used HI AWTO as a bridge to owning.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-gray-50 border border-gray-100 rounded-xl p-6 shadow-sm"
              >
                <p className="text-gray-700 italic mb-4">“{t.quote}”</p>
                <p className="font-semibold text-slate-800">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800">
          Frequently Asked Questions
        </h2>
        <p className="text-center text-gray-600 mt-2 mb-8">
          We want you to feel fully informed before you move forward.
        </p>

        <div className="space-y-4">
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center px-4 py-3 text-left"
                >
                  <span className="font-medium text-slate-800">
                    {item.q}
                  </span>
                  <span className="text-blue-600 font-bold text-xl">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-gray-600 text-sm">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to see if HI AWTO is right for you?
          </h2>
          <p className="mt-3 text-blue-100">
            Start an application or browse homes to see what’s possible.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-blue-700 font-semibold shadow hover:shadow-lg transition"
            >
              Get Started
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-blue-200 text-white font-semibold hover:bg-white/10 transition"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
