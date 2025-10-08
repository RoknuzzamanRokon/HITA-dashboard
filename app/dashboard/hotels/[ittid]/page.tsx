/**
 * Hotel Details Page
 * Dynamic page for displaying detailed hotel information
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { HotelDetailsView } from "@/lib/components/hotels/hotel-details";

interface HotelDetailsPageProps {
  params: {
    ittid: string;
  };
}

export default function HotelDetailsPage({ params }: HotelDetailsPageProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log("Edit hotel:", params.ittid);
  };

  return (
    <HotelDetailsView
      ittid={params.ittid}
      onBack={handleBack}
      onEdit={handleEdit}
    />
  );
}
