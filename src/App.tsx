import { Atmosphere, CursorHud } from "@/components/Atmosphere";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { LeadForm } from "@/components/LeadForm";
import { Process } from "@/components/Process";
import { SpecOverlay } from "@/components/SpecOverlay";
import { Ticker } from "@/components/Ticker";

export default function App() {
  return (
    <div className="relative min-h-screen bg-void text-chalk">
      <Atmosphere />
      <CursorHud />
      <Header />

      <main className="relative z-10">
        <Hero />
        <Ticker />
        <LeadForm />
        <Process />
      </main>

      <Footer />
      <SpecOverlay />
    </div>
  );
}
