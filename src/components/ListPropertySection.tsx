"use client";

import React, { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileBadge,
  Maximize2,
  Coins,
  Compass,
  ArrowRight,
  BadgeCheck,
  Lock,
  PhoneCall,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { submitEnquiry } from "@/app/actions/enquiries";

export default function ListPropertySection() {
  const { locale, t } = useI18n();
  const isAr = locale === "ar";
  const lp = t.listProperty;
  const honeypotId = useId();

  // Form states
  const [propertyType, setPropertyType] = useState("penthouse");
  const [location, setLocation] = useState("");
  const [squareFeet, setSquareFeet] = useState("");
  const [priceToSell, setPriceToSell] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+971 ");
  const [emiratesId, setEmiratesId] = useState("");
  const [passportVisa, setPassportVisa] = useState("");
  const [notes, setNotes] = useState("");
  const [company, setCompany] = useState(""); // Honeypot

  // UI flow states
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Helpers for quick presets
  const pricePresets = [
    { label: isAr ? "3 - 5 مليون" : "3M - 5M", val: "4,000,000" },
    { label: isAr ? "5 - 10 مليون" : "5M - 10M", val: "7,500,000" },
    { label: isAr ? "10 - 25 مليون" : "10M - 25M", val: "15,000,000" },
    { label: isAr ? "25+ مليون" : "25M+", val: "30,000,000" },
  ];

  const sqftPresets = [
    { label: isAr ? "1,500 - 2,500" : "1.5k - 2.5k", val: "2,000" },
    { label: isAr ? "2,500 - 4,500" : "2.5k - 4.5k", val: "3,500" },
    { label: isAr ? "4,500 - 7,500" : "4.5k - 7.5k", val: "6,000" },
    { label: isAr ? "7,500+" : "7.5k+", val: "9,000" },
  ];

  const formatEmiratesId = (val: string) => {
    // Keep numbers and format as 784-XXXX-XXXXXXX-X
    const digits = val.replace(/\D/g, "").slice(0, 15);
    let res = "";
    for (let i = 0; i < digits.length; i++) {
      if (i === 3 || i === 7 || i === 14) res += "-";
      res += digits[i];
    }
    return res;
  };

  const handleEmiratesIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmiratesId(formatEmiratesId(e.target.value));
  };

  const formatNumberWithCommas = (val: string) => {
    const raw = val.replace(/,/g, "").replace(/\D/g, "");
    if (!raw) return "";
    return Number(raw).toLocaleString();
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceToSell(formatNumberWithCommas(e.target.value));
  };

  const handleSqftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSquareFeet(formatNumberWithCommas(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage(isAr ? "يرجى تعبئة الاسم والبريد ورقم الهاتف" : "Please fill in your name, email and phone.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const propertyTypeName =
      lp.types[propertyType as keyof typeof lp.types] || propertyType;

    const formattedMessage = `[LIST YOUR PROPERTY SUBMISSION]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Property Type: ${propertyTypeName}
• Location / Community: ${location || "Not specified"}
• Built-up Area: ${squareFeet ? `${squareFeet} sq.ft` : "Not specified"}
• Target Selling Price: ${priceToSell ? `AED ${priceToSell}` : "Not specified"}
• Emirates ID: ${emiratesId || "Not provided"}
• Passport / Residential Visa: ${passportVisa || "Not provided"}
• Special Features / Notes: ${notes || "None"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    try {
      const result = await submitEnquiry({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: formattedMessage,
        company, // Honeypot field
      });

      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(result.error || (isAr ? "حدث خطأ أثناء إرسال البيانات" : "Submission failed. Please try again."));
      }
    } catch {
      setStatus("error");
      setErrorMessage(isAr ? "تعذر الاتصال بالخادم" : "Server connection failed.");
    }
  };

  const resetForm = () => {
    setActiveStep(1);
    setStatus("idle");
    setFullName("");
    setEmail("");
    setPhone("+971 ");
    setEmiratesId("");
    setPassportVisa("");
    setNotes("");
    setPriceToSell("");
    setSquareFeet("");
    setLocation("");
  };

  return (
    <section
      id="list-with-us"
      className="relative py-20 sm:py-28 overflow-hidden transition-colors duration-500"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(184, 134, 11, 0.04) 0%, transparent 60%)",
      }}
    >
      {/* Decorative ambient subtle backdrop lights (gentle on the eyes) */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 -start-40 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 dark:opacity-15"
        style={{ background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)" }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-10 -end-40 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 dark:opacity-10"
        style={{ background: "radial-gradient(circle, #8A6B29 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Top Header Badge & Titles */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lp.badge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-foreground mb-4">
            {lp.title}{" "}
            <span className="font-semibold text-accent relative inline-block">
              {lp.titleHighlight}
              <motion.span
                layoutId="gold-underline"
                className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-80"
              />
            </span>
          </h2>

          <p className="text-foreground/70 text-sm sm:text-base md:text-lg font-light leading-relaxed">
            {lp.subtitle}
          </p>
        </motion.div>

        {/* 2-Column Luxury Layout: Left = Editorial / Live Preview, Right = Eye-Comfort Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Key Pillars + Live Property Summary Card */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? 24 : -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Live Interactive Property Ticket Preview */}
            <div className="relative rounded-3xl p-6 sm:p-7 border border-border/80 bg-card/60 backdrop-blur-xl shadow-xl overflow-hidden group">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium uppercase tracking-widest text-foreground/70">
                    {lp.livePreviewBadge}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-accent font-medium">
                  <BadgeCheck className="w-4 h-4" />
                  <span>SPEC Verified</span>
                </div>
              </div>

              {/* Dynamic summary items */}
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-foreground/50 block mb-1">
                    {lp.propertyType}
                  </span>
                  <div className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-accent shrink-0" />
                    <span>{lp.types[propertyType as keyof typeof lp.types] || propertyType}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-background/80 rounded-2xl p-3.5 border border-border/60">
                    <div className="flex items-center gap-1.5 text-xs text-foreground/50 mb-1">
                      <Maximize2 className="w-3.5 h-3.5 text-accent" />
                      <span>{isAr ? "المساحة" : "Area"}</span>
                    </div>
                    <div className="text-base font-semibold text-foreground">
                      {squareFeet ? `${squareFeet} ${lp.sqftUnit}` : `— ${lp.sqftUnit}`}
                    </div>
                  </div>

                  <div className="bg-background/80 rounded-2xl p-3.5 border border-border/60">
                    <div className="flex items-center gap-1.5 text-xs text-foreground/50 mb-1">
                      <Coins className="w-3.5 h-3.5 text-accent" />
                      <span>{isAr ? "سعر البيع" : "Listing Price"}</span>
                    </div>
                    <div className="text-base font-semibold text-accent">
                      {priceToSell ? `${priceToSell} ${lp.aedCurrency}` : `— ${lp.aedCurrency}`}
                    </div>
                  </div>
                </div>

                {location && (
                  <div className="flex items-center gap-2 text-xs text-foreground/70 pt-1">
                    <Compass className="w-3.5 h-3.5 text-accent" />
                    <span className="truncate">{location}</span>
                  </div>
                )}
              </div>

              {/* Verification status pill */}
              <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-foreground/60">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-accent/80" />
                  {emiratesId || passportVisa
                    ? (isAr ? "تم إدخال وثيقة التحقق" : "Identity Ref Added")
                    : (isAr ? "بانتظار مستندات المالك" : "Pending Owner Ref")}
                </span>
                <span className="text-[11px] text-accent/90 font-medium">Dubai, UAE</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Eye-Comfort Animated Form */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-7"
          >
            <div className="relative rounded-3xl sm:rounded-[2.5rem] border border-border/80 bg-card/85 dark:bg-card/75 backdrop-blur-2xl p-6 sm:p-8 md:p-10 shadow-2xl transition-all">
              {/* Stepper Tabs for effortless cognitive flow */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-border/70">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeStep === 1
                        ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                        : "bg-muted text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                    <span>{lp.step1Title}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeStep === 2
                        ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                        : "bg-muted text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                    <span>{lp.step2Title}</span>
                  </button>
                </div>

                <span className="text-xs text-foreground/50 hidden sm:inline-block">
                  {activeStep === 1 ? "Step 1 of 2" : "Step 2 of 2"}
                </span>
              </div>

              {/* Form Content */}
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success-box"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500 shadow-lg">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground tracking-tight">
                      {lp.successTitle}
                    </h3>
                    <p className="text-foreground/70 text-sm max-w-md mx-auto leading-relaxed">
                      {lp.successDesc}
                    </p>
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-2.5 rounded-full bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        {isAr ? "تسجيل عقار آخر" : "List Another Property"}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Honeypot field for anti-spam */}
                    <input
                      id={honeypotId}
                      type="text"
                      name="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      className="absolute opacity-0 h-0 w-0 overflow-hidden pointer-events-none"
                      aria-hidden="true"
                    />

                    {/* Step 1: Property Specifications */}
                    {activeStep === 1 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-5"
                      >
                        {/* Property Type Selector */}
                        <div>
                          <label className="block text-xs font-medium text-foreground/80 mb-2">
                            {lp.propertyType}
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(lp.types).map(([key, name]) => {
                              const isSelected = propertyType === key;
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => setPropertyType(key)}
                                  className={`px-3 py-2.5 rounded-2xl text-xs font-medium text-center transition-all border ${
                                    isSelected
                                      ? "bg-accent/15 border-accent text-foreground font-semibold shadow-sm"
                                      : "bg-background/80 border-border/80 text-foreground/70 hover:border-accent/40"
                                  }`}
                                >
                                  {name}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Location / Community */}
                        <div>
                          <label className="block text-xs font-medium text-foreground/80 mb-1.5">
                            {lp.location}
                          </label>
                          <div className="relative">
                            <Compass className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                            <input
                              type="text"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              placeholder={lp.locationPlaceholder}
                              className="w-full bg-background border border-border rounded-2xl ps-11 pe-4 py-3 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                            />
                          </div>
                        </div>

                        {/* Two Columns: Square Feet + Price to Sell With Us */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* How Many Square Feet */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-medium text-foreground/80">
                                {lp.squareFeet}
                              </label>
                              <span className="text-[10px] text-accent font-semibold">
                                {lp.sqftUnit}
                              </span>
                            </div>
                            <div className="relative">
                              <Maximize2 className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                              <input
                                type="text"
                                inputMode="numeric"
                                value={squareFeet}
                                onChange={handleSqftChange}
                                placeholder={lp.squareFeetPlaceholder}
                                className="w-full bg-background border border-border rounded-2xl ps-11 pe-4 py-3 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-mono"
                              />
                            </div>
                            {/* Sqft quick chips */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {sqftPresets.map((chip) => (
                                <button
                                  key={chip.val}
                                  type="button"
                                  onClick={() => setSquareFeet(chip.val)}
                                  className="text-[10px] px-2 py-1 rounded-lg bg-muted text-foreground/60 hover:text-accent transition-colors"
                                >
                                  {chip.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Price to Sell With Us */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-medium text-foreground/80">
                                {lp.priceToSell}
                              </label>
                              <span className="text-[10px] text-accent font-semibold">
                                {lp.aedCurrency}
                              </span>
                            </div>
                            <div className="relative">
                              <Coins className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                              <input
                                type="text"
                                inputMode="numeric"
                                value={priceToSell}
                                onChange={handlePriceChange}
                                placeholder={lp.priceToSellPlaceholder}
                                className="w-full bg-background border border-border rounded-2xl ps-11 pe-4 py-3 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-mono"
                              />
                            </div>
                            {/* Price quick chips */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {pricePresets.map((chip) => (
                                <button
                                  key={chip.val}
                                  type="button"
                                  onClick={() => setPriceToSell(chip.val)}
                                  className="text-[10px] px-2 py-1 rounded-lg bg-muted text-foreground/60 hover:text-accent transition-colors"
                                >
                                  {chip.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Move to Step 2 Button */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setActiveStep(2)}
                            className="w-full h-12 bg-accent text-accent-foreground font-semibold rounded-2xl flex items-center justify-center gap-2 hover:opacity-95 shadow-md shadow-accent/20 transition-all"
                          >
                            <span>{isAr ? "متابعة بيانات المالك والتحقق" : "Continue to Owner & ID Verification"}</span>
                            <ArrowRight className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Legal Verification & Contact */}
                    {activeStep === 2 && (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        {/* Full Name & Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-foreground/80 mb-1.5">
                              {lp.fullName} *
                            </label>
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder={lp.fullNamePlaceholder}
                              className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-foreground/80 mb-1.5">
                              {lp.phone} *
                            </label>
                            <div className="relative">
                              <PhoneCall className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                              <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder={lp.phonePlaceholder}
                                className="w-full bg-background border border-border rounded-2xl ps-11 pe-4 py-3 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all dir-ltr"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-xs font-medium text-foreground/80 mb-1.5">
                            {lp.email} *
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={lp.emailPlaceholder}
                            className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                          />
                        </div>

                        {/* Required Owner IDs: Emirates ID & Residential Visa / Passport */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                          {/* Emirates ID */}
                          <div className="bg-accent/5 dark:bg-accent/10 p-3.5 rounded-2xl border border-accent/20">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <FileBadge className="w-3.5 h-3.5 text-accent" />
                                <span>{lp.emiratesId}</span>
                              </label>
                            </div>
                            <input
                              type="text"
                              value={emiratesId}
                              onChange={handleEmiratesIdChange}
                              placeholder={lp.emiratesIdPlaceholder}
                              className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-accent font-mono"
                            />
                            <span className="text-[10px] text-foreground/50 mt-1 block">
                              {lp.emiratesIdHint}
                            </span>
                          </div>

                          {/* Residential Visa / Passport */}
                          <div className="bg-accent/5 dark:bg-accent/10 p-3.5 rounded-2xl border border-accent/20">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                                <span>{lp.passportVisa}</span>
                              </label>
                            </div>
                            <input
                              type="text"
                              value={passportVisa}
                              onChange={(e) => setPassportVisa(e.target.value)}
                              placeholder={lp.passportVisaPlaceholder}
                              className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-accent"
                            />
                            <span className="text-[10px] text-foreground/50 mt-1 block">
                              {lp.passportVisaHint}
                            </span>
                          </div>
                        </div>

                        {/* Special Features & Notes */}
                        <div>
                          <label className="block text-xs font-medium text-foreground/80 mb-1.5">
                            {lp.notes}
                          </label>
                          <textarea
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={lp.notesPlaceholder}
                            className="w-full bg-background border border-border rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                          />
                        </div>

                        {/* Error Message */}
                        {status === "error" && (
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMessage}</span>
                          </div>
                        )}

                        {/* Buttons: Back to Step 1 & Submit */}
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setActiveStep(1)}
                            className="px-4 h-12 rounded-2xl border border-border text-foreground/70 hover:text-foreground hover:bg-muted text-xs font-medium transition-colors"
                          >
                            {isAr ? "العودة للمواصفات" : "Back"}
                          </button>

                          <button
                            type="submit"
                            disabled={status === "loading"}
                            className="flex-1 h-12 bg-accent text-accent-foreground font-semibold rounded-2xl flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/25 transition-all text-sm"
                          >
                            {status === "loading" ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>{lp.submitting}</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-4 h-4" />
                                <span>{lp.submitButton}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
