/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";

export default function WebflowScripts() {
  useEffect(() => {
    (window as any).Webflow = (window as any).Webflow || [];

    const jq = document.createElement("script");
    jq.src = "/js/jquery.min.js";
    jq.async = false;

    jq.onload = () => {
      (window as any).jQuery = (window as any).jQuery || (window as any).$;

      document.querySelectorAll(".w-form form").forEach((form) => {
        if (!form.getAttribute("action")) {
          form.setAttribute("action", "#");
        }
      });

      const wf = document.createElement("script");
      wf.src = "/js/webflow.js";
      wf.async = false;

      document.body.appendChild(wf);
    };

    document.body.appendChild(jq);
  }, []);

  return null;
}
