/**
 * Free Trial Registration Page
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicNavigation } from "@/lib/components/layout/public-navigation";
import {
  CheckCircle,
  User,
  Building2,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function FreeTrialPage() {
  const [formData, setFormData] = useState({
    username: "",
    business_name: "",
    email: "",
    phone_number: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    // Business name validation
    if (!formData.business_name.trim()) {
      errors.business_name = "Business name is required";
    } else if (formData.business_name.length < 2) {
      errors.business_name = "Business name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!formData.phone_number.trim()) {
      errors.phone_number = "Phone number is required";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone_number)) {
      errors.phone_number = "Please enter a valid phone number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get backend API URL from environment
      const BACKEND_API_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001";
      const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "v1.0";

      const response = await fetch(
        `${BACKEND_API_URL}/${API_VERSION}/free-trial/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicNavigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Start Your Free Trial Today
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get full access to our Hotel API for demo in 3 days. No credit card
            required. Start building amazing travel experiences today.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Benefits Section */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What's Included in Your Free Trial
              </h2>
              <p className="text-gray-600 mb-8">
                Experience the full power of our Hotel API with no limitations
                during your trial period.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Full API Access
                    </h3>
                    <p className="text-gray-600">
                      Access to all API endpoints including search, booking, and
                      property details.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      10,000 API Calls
                    </h3>
                    <p className="text-gray-600">
                      Generous API call limit to test and integrate our
                      services.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Technical Support
                    </h3>
                    <p className="text-gray-600">
                      Email support from our technical team to help you get
                      started.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Complete Documentation
                    </h3>
                    <p className="text-gray-600">
                      Access to guides, tutorials, and code examples in multiple
                      languages.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      No Credit Card Required
                    </h3>
                    <p className="text-gray-600">
                      Start your trial immediately without any payment
                      information.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div>
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Register for Free Trial
                </h2>

                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Request Submitted!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for your interest! We'll review your application
                      and send your API credentials to{" "}
                      <span className="font-semibold">{formData.email}</span>{" "}
                      within 24-48 hours.
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Return to Home
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Username <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border ${
                            validationErrors.username
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          placeholder="john_doe"
                        />
                      </div>
                      {validationErrors.username && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.username}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="business_name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Business Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          id="business_name"
                          name="business_name"
                          value={formData.business_name}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border ${
                            validationErrors.business_name
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          placeholder="Acme Travel Agency"
                        />
                      </div>
                      {validationErrors.business_name && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.business_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border ${
                            validationErrors.email
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          placeholder="john@acmetravel.com"
                        />
                      </div>
                      {validationErrors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="phone_number"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          id="phone_number"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border ${
                            validationErrors.phone_number
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          placeholder="+1-555-123-4567"
                        />
                      </div>
                      {validationErrors.phone_number && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.phone_number}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Message (Optional)
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        placeholder="Tell us about your use case, expected API usage, or any specific requirements..."
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Help us understand your needs better (optional)
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-800">
                        By submitting this form, you agree to our Terms of
                        Service and Privacy Policy. We'll review your
                        application and send your API credentials within 24-48
                        hours.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Start Free Trial"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
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
                    href="/contact"
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
