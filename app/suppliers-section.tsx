import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SuppliersSection() {
  const firstRowSuppliers = [
    "LetsFlyHotel",
    "Innstant",
    "Hotelston",
    "KiwiHotel",
    "Restel",
    "HyperGetesDirect",
    "Roomerang",
    "Hotelbeds",
    "GoGlobal Main",
    "Paximum",
    "TBO Hotel",
    "RateHawk Hotel",
    "EAN",
    "Rakuten",
  ];

  const secondRowSuppliers = [
    "TravelRobot Hotel",
    "Agoda",
    "DOTW",
    "Amadeus Hotel",
    "RNR Hotel",
    "HyperGuestDirect",
    "Irix Hotel",
    "RateHawk New",
    "Illusions Hotel",
    "Juniper Hotel",
    "Stuba",
    "GoGlobal",
    "GRN Connect",
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Connected to Leading Hotel Suppliers
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Access millions of properties through our extensive network of
            premium hotel suppliers and distribution channels
          </p>
        </div>

        {/* First Row - Scrolling Left */}
        <div className="relative mb-6">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-blue-50 via-indigo-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-purple-50 via-indigo-50 to-transparent z-10 pointer-events-none"></div>

          {/* Scrolling Container */}
          <div className="flex overflow-hidden">
            <div className="flex animate-scroll-left">
              {/* First Set */}
              {firstRowSuppliers.map((supplier, index) => (
                <div
                  key={`first-${index}`}
                  className="flex-shrink-0 mx-4 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-xl border border-gray-200 shadow-md"
                >
                  <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    {supplier}
                  </span>
                </div>
              ))}
              {/* Duplicate Set for Seamless Loop */}
              {firstRowSuppliers.map((supplier, index) => (
                <div
                  key={`first-dup-${index}`}
                  className="flex-shrink-0 mx-4 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-xl border border-gray-200 shadow-md"
                >
                  <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    {supplier}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row - Scrolling Right */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-blue-50 via-indigo-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-purple-50 via-indigo-50 to-transparent z-10 pointer-events-none"></div>

          {/* Scrolling Container */}
          <div className="flex overflow-hidden">
            <div className="flex animate-scroll-right">
              {/* First Set */}
              {secondRowSuppliers.map((supplier, index) => (
                <div
                  key={`second-${index}`}
                  className="flex-shrink-0 mx-4 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-xl border border-gray-200 shadow-md"
                >
                  <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    {supplier}
                  </span>
                </div>
              ))}
              {/* Duplicate Set for Seamless Loop */}
              {secondRowSuppliers.map((supplier, index) => (
                <div
                  key={`second-dup-${index}`}
                  className="flex-shrink-0 mx-4 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-xl border border-gray-200 shadow-md"
                >
                  <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    {supplier}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">
            Our unified API aggregates inventory from all suppliers, giving you
            access to the best rates and availability
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
          >
            Explore Our Coverage
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
