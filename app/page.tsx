/**
 * Home page - Professional landing page with navigation
 */

"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import SuppliersSection from "./suppliers-section";
import {
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Users,
  BarChart3,
  CheckCircle,
  Star,
  Menu,
  X,
  Code,
  Database,
  Lock,
  Smartphone,
  TrendingUp,
  Clock,
  HeadphonesIcon,
  FileText,
  Layers,
  GitBranch,
} from "lucide-react";
import { useState } from "react";

// Navigation Component
function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLoginClick = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-color rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HotelAPI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-900 hover:text-primary-color transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="text-gray-600 hover:text-primary-color transition-colors font-medium"
            >
              Blog
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-primary-color transition-colors font-medium"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-primary-color transition-colors font-medium"
            >
              Contact
            </Link>
            <Link
              href="/free-trial"
              className="border-2 border-blue-500 text-blue-600 px-6 py-2 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium"
            >
              Free Trial
            </Link>
            <button
              onClick={handleLoginClick}
              className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              {isAuthenticated ? "Dashboard" : "Login"}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-900 hover:text-primary-color transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/blog"
                className="text-gray-600 hover:text-primary-color transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-primary-color transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-primary-color transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/free-trial"
                className="border-2 border-blue-500 text-blue-600 px-6 py-2 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Free Trial
              </Link>
              <button
                onClick={() => {
                  handleLoginClick();
                  setIsMenuOpen(false);
                }}
                className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium text-left shadow-lg hover:shadow-xl"
              >
                {isAuthenticated ? "Dashboard" : "Login"}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
        {/* Professional Background with Subtle Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          ></div>

          {/* Animated Orbs */}
          <div className="absolute top-1/4 -left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"></div>
          <div
            className="absolute top-1/3 -right-10 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"
            style={{ animationDelay: "3s" }}
          ></div>
          <div
            className="absolute -bottom-8 left-1/2 w-72 h-72 bg-slate-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"
            style={{ animationDelay: "6s" }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm border border-gray-200 px-4 py-2 text-sm text-gray-700 shadow-sm">
                <span className="inline-flex h-2 w-2 rounded-full bg-primary-color"></span>
                Enterprise-ready Hotel Data Platform
              </div>
              <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
                Build booking experiences with a
                <span className="text-blue-600 block">
                  premium Hotel Content API
                </span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl">
                Connect to global inventory with real-time availability,
                pricing, and rich property content. Designed for fast
                integration and consistent performance at scale.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/pricing"
                  className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold text-lg inline-flex items-center justify-center group shadow-lg hover:shadow-xl"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/blog"
                  className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-200 font-semibold text-lg bg-white/80 backdrop-blur-sm inline-flex items-center justify-center"
                >
                  View Docs
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-6 max-w-xl">
                <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm px-4 py-4 shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime SLA</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm px-4 py-4 shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">2M+</div>
                  <div className="text-sm text-gray-600">Properties</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm px-4 py-4 shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">50ms</div>
                  <div className="text-sm text-gray-600">Avg latency</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-slate-500/10 blur-2xl rounded-3xl"></div>
                <div className="relative rounded-3xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-3xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/60">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      API Preview
                    </div>
                    <div className="text-sm text-gray-500">v1</div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="text-xs text-gray-500">Endpoint</div>
                        <div className="mt-2 font-mono text-sm text-gray-900 break-all">
                          /hotels/search
                        </div>
                        <div className="mt-3 inline-flex items-center gap-2 text-xs text-gray-600">
                          <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                          200 OK
                        </div>
                      </div>
                      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="text-xs text-gray-500">Coverage</div>
                        <div className="mt-2 text-2xl font-bold text-gray-900">
                          Global
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          Multi-supplier inventory
                        </div>
                      </div>
                      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:col-span-2">
                        <div className="text-xs text-gray-500">
                          Sample response
                        </div>
                        <pre className="mt-3 text-xs leading-relaxed text-gray-800 overflow-x-auto">
                          {`{
        "name": "Inno Hotel",
        "id": 475547,
        "ittid": "10470506",
        "address_line1": "Dapnajore, Basail Upazila, Korotia Union",
        "address_line2": "",
        "content_update_status": "NewAdd",
        "created_at": "2025-06-30T03:55:41",
        "latitude": "24.2435",
        "longitude": "89.987",
}`}
                        </pre>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Secure auth, caching, and rate limits
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-2 text-sm text-primary-color font-semibold">
                        Production Ready
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrated Suppliers Section */}
      <SuppliersSection />

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Hotel API?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for developers, trusted by businesses worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-blue-100/50">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Lightning Fast
              </h3>
              <p className="text-gray-600">
                Sub-second response times with our globally distributed API
                infrastructure and intelligent caching.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100/50">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Enterprise Security
              </h3>
              <p className="text-gray-600">
                Bank-level security with OAuth 2.0, rate limiting, and
                comprehensive audit logs.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-indigo-100/50">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Global Coverage
              </h3>
              <p className="text-gray-600">
                Access to millions of properties worldwide from trusted
                suppliers and hotel chains.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-green-100/50">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Developer Friendly
              </h3>
              <p className="text-gray-600">
                RESTful API with comprehensive documentation, SDKs for popular
                languages, and interactive examples.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-purple-100/50">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Real-Time Data
              </h3>
              <p className="text-gray-600">
                Live availability, pricing updates, and instant booking
                confirmations with webhook support.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-orange-100/50">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <HeadphonesIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                24/7 Support
              </h3>
              <p className="text-gray-600">
                Dedicated technical support team available around the clock to
                help you succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* API Features Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful API Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to build world-class booking experiences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Secure Authentication
                  </h3>
                  <p className="text-gray-600">
                    OAuth 2.0, API keys, and JWT tokens with role-based access
                    control and IP whitelisting.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Mobile Optimized
                  </h3>
                  <p className="text-gray-600">
                    Lightweight responses, image optimization, and native SDKs
                    for iOS and Android.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Advanced Analytics
                  </h3>
                  <p className="text-gray-600">
                    Detailed usage metrics, performance monitoring, and custom
                    reporting dashboards.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Rate Limiting
                  </h3>
                  <p className="text-gray-600">
                    Flexible rate limits with burst support and automatic
                    scaling for high-traffic periods.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Rich Documentation
                  </h3>
                  <p className="text-gray-600">
                    Interactive API explorer, code samples, tutorials, and
                    comprehensive guides.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Layers className="w-6 h-6 text-pink-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Webhook Integration
                  </h3>
                  <p className="text-gray-600">
                    Real-time notifications for bookings, cancellations, and
                    price changes via webhooks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Easy Integration in Minutes
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Get started quickly with our SDKs, comprehensive documentation,
                and code examples in your favorite programming language.
              </p>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="ml-3 text-gray-700">
                    RESTful API with JSON responses
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="ml-3 text-gray-700">
                    SDKs for Node.js, Python, PHP, Ruby, Java
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="ml-3 text-gray-700">
                    Postman collection and OpenAPI spec
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="ml-3 text-gray-700">
                    Sandbox environment for testing
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/blog"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View Documentation
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-2xl rounded-3xl"></div>
              <div className="relative bg-gray-900 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">main</span>
                  </div>
                </div>
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <code>{`// Initialize the API client
const HotelAPI = require('@hotelapi/sdk');

const client = new HotelAPI({
  apiKey: 'your_api_key_here'
});

// Search for hotels
const results = await client.hotels.search({
  location: 'New York',
  checkIn: '2024-06-01',
  checkOut: '2024-06-05',
  guests: 2
});

console.log(results);
// Returns: { hotels: [...], total: 1247 }`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Every Use Case
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From startups to enterprises, our API scales with your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Travel Agencies
              </h3>
              <p className="text-gray-600 text-sm">
                Build custom booking platforms with multi-supplier inventory and
                competitive pricing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Mobile Apps
              </h3>
              <p className="text-gray-600 text-sm">
                Create seamless mobile booking experiences with optimized
                endpoints and native SDKs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Corporate Travel
              </h3>
              <p className="text-gray-600 text-sm">
                Manage business travel with policy compliance, reporting, and
                approval workflows.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Metasearch
              </h3>
              <p className="text-gray-600 text-sm">
                Aggregate and compare hotel prices from multiple sources in
                real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm p-6 text-center shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">2M+</div>
              <div className="text-gray-600">Hotels Worldwide</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm p-6 text-center shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600">API Uptime</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm p-6 text-center shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">50ms</div>
              <div className="text-gray-600">Avg Response Time</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm p-6 text-center shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Expert Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "The most reliable hotel API we've used. Integration was
                seamless and the data quality is exceptional."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-color rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">
                    Sarah Johnson
                  </div>
                  <div className="text-gray-600">CTO, TravelTech Inc</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "Outstanding performance and support. Our booking conversion
                increased by 40% after switching to this API."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-color rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Mike Chen</div>
                  <div className="text-gray-600">
                    Lead Developer, BookingPro
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "Comprehensive documentation and excellent developer experience.
                Highly recommended for any travel platform."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-color rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Emma Davis</div>
                  <div className="text-gray-600">
                    Product Manager, Wanderlust
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers building amazing travel experiences
          </p>
          <Link
            href="/pricing"
            className="bg-white text-slate-900 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold text-lg inline-flex items-center group shadow-lg hover:shadow-xl"
          >
            Start Building Today
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-color rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">HotelAPI</span>
              </div>
              <p className="text-gray-400">
                The most comprehensive hotel API platform for developers and
                businesses worldwide.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    API Reference
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 HotelAPI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
