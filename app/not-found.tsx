"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isGlitching, setIsGlitching] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client flag to true after hydration
    setIsClient(true);

    // Only add event listeners on client side
    if (typeof window !== "undefined") {
      // Mouse tracking for interactive effects
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };

      // Random glitch effect
      const glitchInterval = setInterval(() => {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 100);
      }, 3000);

      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        clearInterval(glitchInterval);
      };
    }
  }, []);

  // Calculate gradient position based on mouse (only after hydration)
  const gradientX =
    isClient && typeof window !== "undefined"
      ? (mousePosition.x / window.innerWidth) * 100
      : 50;
  const gradientY =
    isClient && typeof window !== "undefined"
      ? (mousePosition.y / window.innerHeight) * 100
      : 50;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Elements - Only render on client */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ x: -100, y: -100 }}
            animate={{
              x: [0, 100, 0],
              y: [0, 100, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ x: "100%", y: "100%" }}
            animate={{
              x: ["100%", "0%", "100%"],
              y: ["100%", "0%", "100%"],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-pink-200/20 rounded-full blur-3xl"
          />
        </div>
      )}

      <div className="max-w-2xl mx-auto text-center relative z-10">
        {/* Animated 404 Number */}
        <div className="mb-8 relative">
          {/* Dynamic gradient background - only render on client */}
          {isClient && (
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${gradientX}% ${gradientY}%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)`,
              }}
            />
          )}

          <div className="relative">
            {/* Main 404 with gradient animation */}
            <motion.h1
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                rotate: [0, 1, -1, 1, 0],
              }}
              transition={{
                scale: {
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1,
                },
                opacity: { duration: 0.5 },
                rotate: {
                  duration: 0.1,
                  times: [0, 0.25, 0.5, 0.75, 1],
                  repeat: Infinity,
                  repeatDelay: 2,
                },
              }}
              className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
            >
              404
            </motion.h1>

            {/* Glitch Effect Overlay - Only render on client */}
            {isClient && isGlitching && (
              <>
                <motion.div
                  initial={{ x: -5, opacity: 0.5 }}
                  animate={{ x: 5, opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="absolute inset-0 text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500"
                  style={{ filter: "blur(1px)" }}
                >
                  404
                </motion.div>
                <motion.div
                  initial={{ x: 5, opacity: 0.5 }}
                  animate={{ x: -5, opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="absolute inset-0 text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-yellow-500"
                  style={{ filter: "blur(1px)" }}
                >
                  404
                </motion.div>
              </>
            )}

            {/* Animated Border/Shadow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.02, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                opacity: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-xl rounded-full -z-10"
            />
          </div>

          {/* Animated Dots Pattern */}
          <div className="flex justify-center gap-4 mt-8">
            {[1, 2, 3].map((dot) => (
              <motion.div
                key={dot}
                initial={{ scale: 0, y: -20 }}
                animate={{
                  scale: [1, 1.5, 1],
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  delay: dot * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Error Message with Stagger Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>
        </motion.div>

        {/* Illustration with Bounce Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{
            scale: 1,
            y: [0, -10, 0],
          }}
          transition={{
            scale: {
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.3,
            },
            y: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 relative">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="absolute inset-4 border-2 border-white/30 rounded-full"
            />
            <Search className="w-16 h-16 text-white relative z-10" />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden group"
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700"
              initial={{ x: "-100%" }}
              whileHover={{ x: "0%" }}
              transition={{ duration: 0.3 }}
            />
            <Home className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Go to Homepage</span>
          </Link>

          <motion.button
            initial={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isClient && typeof window !== "undefined") {
                window.history.back();
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </motion.button>
        </motion.div>

        {/* Additional Help with Fade-in */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            What can you do?
          </h3>
          <ul className="text-gray-600 space-y-2">
            {[
              "Check if the URL is spelled correctly",
              "Go back to the previous page",
              "Visit our homepage to find what you're looking for",
              "Contact support if you believe this is an error",
            ].map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                />
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Floating Particles */}
        {isClient && (
          <div className="absolute inset-0 -z-10 overflow-hidden">
            {[...Array(20)].map((_, i) => {
              // Use deterministic values based on index to avoid hydration mismatch
              const xPos = (i * 17 + 23) % 100;
              const yPos = (i * 13 + 37) % 100;
              const duration = 2 + (i % 3);
              const delay = (i * 0.1) % 2;
              const moveDistance = 20 + (i % 30);

              return (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full"
                  initial={{
                    x: xPos + "%",
                    y: yPos + "%",
                    opacity: 0,
                  }}
                  animate={{
                    y: [null, `-${moveDistance}px`],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: duration,
                    repeat: Infinity,
                    delay: delay,
                    ease: "linear",
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
