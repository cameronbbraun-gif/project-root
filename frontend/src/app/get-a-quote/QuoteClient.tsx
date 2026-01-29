"use client";

import { useEffect } from "react";

export default function QuoteClient() {
  useEffect(() => {
    import("./quote");
  }, []);

  return null;
}