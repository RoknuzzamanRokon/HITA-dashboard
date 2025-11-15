"use client";

import React from "react";
import { Star, Phone, Mail, Building2, MapPin } from "lucide-react";
import type {
  HotelBasicInfo,
  ContactDetail,
} from "@/lib/types/full-hotel-details";

export interface BasicInfoProps {
  basic: HotelBasicInfo;
  contacts: ContactDetail[];
}

export const BasicInfo: React.FC<BasicInfoProps> = ({ basic, contacts }) => {
  // Parse rating to number
  const numericRating = basic.rating ? parseFloat(basic.rating) : 0;
  const fullStars = Math.floor(numericRating);

  // Filter contacts by type
  const phoneContacts = contacts.filter((c) => c.contact_type === "phone");
  const emailContacts = contacts.filter((c) => c.contact_type === "email");

  return (
    <div className="space-y-4">
      {/* Property Type and Star Rating */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Property Type */}
        {basic.property_type && (
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-600" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-900">
              {basic.property_type}
            </span>
          </div>
        )}

        {/* Star Rating - Visual and Numeric */}
        {numericRating > 0 && (
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1"
              aria-label={`${numericRating} star rating`}
            >
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`w-4 h-4 ${
                    index < fullStars
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {numericRating.toFixed(1)} stars
            </span>
          </div>
        )}
      </div>

      {/* Address */}
      <div className="space-y-1">
        <div className="flex items-start gap-2">
          <MapPin
            className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0"
            aria-hidden="true"
          />
          <div className="text-sm text-gray-700">
            {basic.address_line1 && (
              <div className="font-medium">{basic.address_line1}</div>
            )}
            {basic.address_line2 && <div>{basic.address_line2}</div>}
            <div className="flex flex-wrap gap-1">
              {basic.postal_code && <span>{basic.postal_code}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      {(phoneContacts.length > 0 || emailContacts.length > 0) && (
        <div className="space-y-2 pt-2 border-t border-gray-200">
          {/* Phone Numbers */}
          {phoneContacts.length > 0 && (
            <div className="flex items-start gap-2">
              <Phone
                className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0"
                aria-hidden="true"
              />
              <div className="flex flex-wrap gap-2">
                {phoneContacts.map((contact, index) => (
                  <a
                    key={`phone-${index}`}
                    href={`tel:${contact.value}`}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    aria-label={`Call ${contact.value}`}
                  >
                    {contact.value}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Email Addresses */}
          {emailContacts.length > 0 && (
            <div className="flex items-start gap-2">
              <Mail
                className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0"
                aria-hidden="true"
              />
              <div className="flex flex-wrap gap-2">
                {emailContacts.map((contact, index) => (
                  <a
                    key={`email-${index}`}
                    href={`mailto:${contact.value}`}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    aria-label={`Email ${contact.value}`}
                  >
                    {contact.value}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
