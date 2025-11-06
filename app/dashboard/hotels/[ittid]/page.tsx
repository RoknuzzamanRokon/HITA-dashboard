/**
 * Hotel Details Page
 * Dynamic page for displaying detailed hotel information
 */

"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { HotelDetailsView } from "@/lib/components/hotels/hotel-details";

interface HotelDetailsPageProps {
  params: Promise<{
    ittid: string;
  }>;
}

export default function HotelDetailsPage({ params }: HotelDetailsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log("Edit hotel:", resolvedParams.ittid);
  };

  return (
    <HotelDetailsView
      ittid={resolvedParams.ittid}
      onBack={handleBack}
      onEdit={handleEdit}
    />
  );
}
