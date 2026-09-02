"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Loader2, Check, MessageCircle, ExternalLink } from "lucide-react";
import { submitEnquiry } from "@/app/actions/enquiries";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/context/SiteSettingsContext";

export default function ContactClient() {
  const { t } = useI18n();
  const { officeAddress, contactPhone, contactEmail, whatsappNumber } = useSiteSettings();
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    interest: "Buying a Property",
    message: "",
    phone: "",
    company: "", // Honeypot
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");
    setErrorMsg("");

    const result = await submitEnquiry({
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone || "+971 00 000 0000",
      message: `[${formData.interest}] ${formData.message}`,
      company: formData.company, // Honeypot
    });

    if (result.success) {
      setFormState("success");
    } else {
      setFormState("error");
      setErrorMsg(result.error || "Failed to submit");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-background min-h-screen text-foreground pt-32 pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter mb-6 text-foreground">
            {t.contactPage.title.split(" ")[0]} <span className="font-bold text-accent">{t.contactPage.title.split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl font-light">
            {t.contactPage.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-2xl font-bold mb-6 text-foreground">{t.contactPage.contactInfo}</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-card rounded-full border border-border text-accent shadow-sm">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{t.contactPage.headOffice}</h3>
                    <a
                      href="https://maps.app.goo.gl/7mh3nYbk4BSytV167?g_st=ic"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/60 hover:text-accent text-sm leading-relaxed whitespace-pre-line block transition-colors"
                    >
                      {officeAddress || t.contactPage.address}
                    </a>
                  </div>
                </div>
                {contactPhone && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-card rounded-full border border-border text-accent shadow-sm">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">{t.contactPage.phone}</h3>
                      <a href={`tel:${contactPhone.replace(/\s+/g, "")}`} className="text-foreground/80 hover:text-accent text-sm dir-ltr transition-colors">
                        {contactPhone}
                      </a>
                    </div>
                  </div>
                )}
                {/* {contactEmail && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-card rounded-full border border-border text-accent shadow-sm">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">{t.contactPage.email}</h3>
                      <a href={`mailto:${contactEmail}`} className="text-foreground/80 hover:text-accent text-sm transition-colors">
                        {contactEmail}
                      </a>
                    </div>
                  </div>
                )} */}
                {whatsappNumber && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-card rounded-full border border-border text-accent shadow-sm">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">WhatsApp Concierge</h3>
                      <a
                        href={`https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground/80 hover:text-accent text-sm dir-ltr transition-colors"
                      >
                        {whatsappNumber}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="h-64 bg-card rounded-3xl border border-border overflow-hidden relative shadow-md group">
              <iframe
                title="SPEC Home Office Location"
                src="https://maps.google.com/maps?q=25.096834,55.176888&hl=en&z=15&output=embed"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  filter: "invert(90%) hue-rotate(180deg) brightness(85%) contrast(92%)",
                }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute bottom-3 end-3 z-20">
                <a
                  href="https://maps.app.goo.gl/7mh3nYbk4BSytV167?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-background/90 backdrop-blur-md border border-border text-foreground text-xs font-medium hover:border-accent hover:text-accent transition-all shadow-lg"
                >
                  <MapPin size={12} className="text-accent" />
                  <span>Google Maps</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-card text-card-foreground p-8 md:p-12 rounded-3xl border border-border shadow-2xl"
          >
            {formState === "success" ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-accent-foreground" />
                </div>
                <p className="text-2xl font-bold tracking-tighter text-foreground">{t.contactPage.messageSent}</p>
                <p className="text-foreground/60 text-sm mt-2">{t.contactPage.teamContact}</p>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-8 text-foreground">{t.contactPage.sendEnquiry}</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Honeypot — hidden from real users */}
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    className="absolute opacity-0 h-0 w-0 overflow-hidden pointer-events-none"
                    aria-hidden="true"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground/70">{t.contactPage.firstName}</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:ring-2 focus:ring-accent focus:border-accent focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground/70">{t.contactPage.lastName}</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:ring-2 focus:ring-accent focus:border-accent focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/70">{t.contactPage.emailAddress}</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:ring-2 focus:ring-accent focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/70">{t.contactPage.phoneNumber}</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+971 50 000 0000"
                      className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:ring-2 focus:ring-accent focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/70">{t.contactPage.interest}</label>
                    <select
                      value={formData.interest}
                      onChange={(e) => handleChange("interest", e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:ring-2 focus:ring-accent focus:border-accent focus:outline-none appearance-none transition-colors"
                    >
                      <option value="Buying a Property">{t.contactPage.buyProperty}</option>
                      <option value="Investment Opportunities">{t.contactPage.investOpps}</option>
                      <option value="General Enquiry">{t.contactPage.generalEnquiry}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/70">{t.contactPage.message}</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:ring-2 focus:ring-accent focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>

                  {formState === "error" && (
                    <p className="text-red-500 text-sm">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={formState === "loading"}
                    className="w-full bg-foreground text-background font-semibold py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                  >
                    {formState === "loading" ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> {t.contactPage.sending}</>
                    ) : (
                      t.contactPage.sendMessage
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
