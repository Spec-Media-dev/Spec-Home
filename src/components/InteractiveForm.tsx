"use client";

import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitEnquiry } from "@/app/actions/enquiries";
import { useI18n } from "@/lib/i18n";

function InteractiveFormComponent() {
  const { t } = useI18n();
  const [isFocused, setIsFocused] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [value, setValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [company, setCompany] = useState(""); // Honeypot

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    
    setStatus("loading");
    setErrorMsg("");

    const isEmail = value.includes("@") && value.includes(".");
    const isPhone = /^[+\d\s-]{7,}$/.test(value.trim());

    const result = await submitEnquiry({
      name: isEmail ? value.split("@")[0] : "VIP Inbound Lead",
      email: isEmail ? value.trim() : "client.interest@spechome.com",
      phone: isPhone ? value.trim() : "+971 50 000 0000",
      message: `Private Consultation Request: ${value.trim()}`,
      company, // Honeypot
    });

    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMsg(result.error || "Failed to submit");
    }
  };

  return (
    <section id="sell" className="py-32 bg-background w-full relative flex justify-center overflow-hidden min-h-[600px] items-center">
      {/* High performance hardware-accelerated ambient glow */}
      <div 
        aria-hidden="true"
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none opacity-20 dark:opacity-15 -z-10 gpu-layer"
        style={{
          background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
          willChange: "transform",
        }}
      />

      <div className="w-full max-w-xl mx-auto px-6 relative z-10">
        <div className="bg-card/70 backdrop-blur-2xl border border-border p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
          <h2 className="text-4xl font-bold mb-4 text-center tracking-tighter text-foreground">{t.interactiveForm.title}</h2>
          <p className="text-center text-foreground/60 mb-10 text-sm">{t.interactiveForm.subtitle}</p>
          
          <AnimatePresence mode="wait">
            {status !== "success" ? (
              <motion.form 
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="w-full space-y-6"
              >
                {/* Honeypot — hidden */}
                <input
                  type="text"
                  name="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="absolute opacity-0 h-0 w-0 overflow-hidden pointer-events-none"
                  aria-hidden="true"
                />

                <div className="relative">
                  <motion.label
                    initial={false}
                    animate={{
                      y: isFocused || value ? -24 : 14,
                      scale: isFocused || value ? 0.85 : 1,
                      color: isFocused ? "var(--color-accent)" : "var(--color-foreground)"
                    }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute start-4 origin-start pointer-events-none transition-colors opacity-60 text-sm"
                  >
                    {t.interactiveForm.placeholder}
                  </motion.label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={cn(
                      "w-full bg-background border border-border rounded-2xl px-4 pt-6 pb-2 text-foreground outline-none transition-colors duration-200",
                      isFocused && "border-accent shadow-[0_0_16px_rgba(184,134,11,0.2)]"
                    )}
                  />
                </div>

                {status === "error" && (
                  <p className="text-red-500 text-sm text-center">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading" || !value}
                  className="w-full relative h-14 bg-accent text-accent-foreground rounded-2xl font-semibold overflow-hidden transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 gpu-layer"
                >
                  <AnimatePresence mode="wait">
                    {status === "idle" && (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                      >
                        {t.interactiveForm.submit}
                      </motion.span>
                    )}
                    {status === "loading" && (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </motion.span>
                    )}
                    {status === "error" && (
                      <motion.span
                        key="retry"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                      >
                        {t.interactiveForm.retry}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center justify-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4 shadow-lg">
                  <Check className="w-8 h-8 text-accent-foreground" />
                </div>
                <p className="text-2xl font-bold text-foreground tracking-tighter">{t.interactiveForm.received}</p>
                <p className="text-foreground/60 text-sm mt-2">{t.interactiveForm.receivedDesc}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default memo(InteractiveFormComponent);
