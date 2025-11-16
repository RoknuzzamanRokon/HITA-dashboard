"use client";

import React, { useState, useEffect } from "react";

interface ImageDebuggerProps {
  url: string;
  index: number;
}

export const ImageDebugger: React.FC<ImageDebuggerProps> = ({ url, index }) => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";

    img.onload = () => {
      setStatus("success");
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      console.log(
        `✅ Image ${index} loaded:`,
        url,
        `${img.naturalWidth}x${img.naturalHeight}`
      );
    };

    img.onerror = (e) => {
      setStatus("error");
      console.error(`❌ Image ${index} failed:`, url, e);
    };

    img.src = url.replace(/^http:\/\//i, "https://");
  }, [url, index]);

  return (
    <div className="text-xs p-1 bg-white/90 absolute top-0 left-0 z-10">
      {status === "loading" && "⏳"}
      {status === "success" && `✅ ${dimensions.width}x${dimensions.height}`}
      {status === "error" && "❌"}
    </div>
  );
};
