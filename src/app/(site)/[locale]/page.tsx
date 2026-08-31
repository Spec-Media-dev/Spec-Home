
import Hero from "@/components/Hero";
import SelectedOpportunities from "@/components/SelectedOpportunities";
import AreaGuides from "@/components/AreaGuides";
import Services from "@/components/Services";
import FeaturedInsights from "@/components/FeaturedInsights";
import InteractiveForm from "@/components/InteractiveForm";

export default function Home() {
  return (
    <div className="bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      <Hero />
      <SelectedOpportunities />
      <AreaGuides />
      <Services />
      <FeaturedInsights />
      <InteractiveForm />
    </div>
  );
}
