import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import CustomCursor from "@/components/CustomCursor";
import { I18nProvider, Locale } from "@/lib/i18n";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams?.locale === "ar" ? "ar" : "en";

  return (
    <I18nProvider locale={locale}>
      <Preloader />
      <CustomCursor />
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </I18nProvider>
  );
}
