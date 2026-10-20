import { Scene } from "@/components/scene/Scene";
import { FloorSelector } from "@/components/ui/FloorSelector";
import { HeroIntro } from "@/components/ui/HeroIntro";
import { InquiryModal } from "@/components/ui/InquiryModal";
import { IntroFallback } from "@/components/ui/IntroFallback";
import { LandingReveal } from "@/components/ui/LandingReveal";
import { Loader } from "@/components/ui/Loader";
import {
  AmenitiesSection,
  LocationSection,
  ProjectSection,
  PurchaseSection,
  SiteFooter,
} from "@/components/ui/sections";
import { SiteNav } from "@/components/ui/SiteNav";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { SunControl } from "@/components/ui/SunControl";
import { UnitDetail } from "@/components/ui/UnitDetail";
import { UsageHint } from "@/components/ui/UsageHint";

export default function Home() {
  return (
    <>
      <main id="landing" className="flex flex-1 flex-col">
        {/*
          Hero en tarjeta (DESIGN §8, variante A): el edificio 3D dentro de una
          tarjeta con radio grande y 12 px de margen al viewport. En mobile el
          texto va debajo de la tarjeta; desde lg, flotando dentro.
        */}
        <section id="inicio" aria-label="Edificio interactivo" className="relative p-2 sm:p-3 lg:h-svh lg:min-h-[680px]">
          <div className="relative h-[72svh] min-h-[480px] overflow-hidden rounded-md bg-stone-100 sm:rounded-lg lg:h-full lg:min-h-0">
            <Scene />
            <SiteNav />
            <FloorSelector />
            <UsageHint />
          </div>
          <SunControl />
          <HeroIntro />
        </section>
        <ProjectSection />
        <AmenitiesSection />
        <LocationSection />
        <PurchaseSection />
      </main>
      <SiteFooter />
      <UnitDetail />
      <InquiryModal />
      <SmoothScroll />
      <LandingReveal />
      <IntroFallback />
      <Loader />
    </>
  );
}
