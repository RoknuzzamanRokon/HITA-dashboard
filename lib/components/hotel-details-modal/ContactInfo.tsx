"use client";

import React from "react";
import { Phone, Mail, Globe } from "lucide-react";
import type { ContactsDetails } from "@/lib/types/full-hotel-details";

export interface ContactInfoProps {
  contacts: ContactsDetails;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ contacts }) => {
  // Check if there are any contacts to display
  const hasPhones = contacts.phone_numbers && contacts.phone_numbers.length > 0;
  const hasEmails = contacts.email_address && contacts.email_address.length > 0;
  const hasWebsites = contacts.website && contacts.website.length > 0;

  // If no contacts, don't render anything
  if (!hasPhones && !hasEmails && !hasWebsites) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-900">
        Contact Information
      </h4>

      <div className="space-y-3">
        {/* Phone Numbers */}
        {hasPhones && (
          <div className="flex items-start gap-3">
            <Phone
              className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div className="flex flex-col gap-1.5">
              {contacts.phone_numbers.map((phone, index) => (
                <a
                  key={`phone-${index}`}
                  href={`tel:${phone}`}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  aria-label={`Call ${phone}`}
                >
                  {phone}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Email Addresses */}
        {hasEmails && (
          <div className="flex items-start gap-3">
            <Mail
              className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div className="flex flex-col gap-1.5">
              {contacts.email_address.map((email, index) => (
                <a
                  key={`email-${index}`}
                  href={`mailto:${email}`}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded break-all"
                  aria-label={`Email ${email}`}
                >
                  {email}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Website Links */}
        {hasWebsites && (
          <div className="flex items-start gap-3">
            <Globe
              className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div className="flex flex-col gap-1.5">
              {contacts.website.map((website, index) => (
                <a
                  key={`website-${index}`}
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded break-all"
                  aria-label={`Visit website ${website} (opens in new tab)`}
                >
                  {website}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
