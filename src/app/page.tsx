import { Scene } from "@/components/scene/Scene";
import { FloorSelector } from "@/components/ui/FloorSelector";
import { HeroIntro } from "@/components/ui/HeroIntro";
import { InquiryModal } from "@/components/ui/InquiryModal";
import { IntroFallback } from "@/components/ui/IntroFallback";
import { Loader } from "@/components/ui/Loader";
import {
  AmenitiesSection,
  LocationSection,
  ProjectSection,
  SiteFooter,
} from "@/components/ui/sections";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { SunControl } from "@/components/ui/SunControl";
import { UnitDetail } from "@/components/ui/UnitDetail";
import { UsageHint } from "@/components/ui/UsageHint";

export default function Home() {
  return (
    <>
      <main className="flex flex-1 flex-col">
        {/* Hero: en mobile el edificio arriba a todo el ancho y el texto debajo. */}
        <section aria-label="Edificio interactivo" className="relative lg:h-svh lg:min-h-[640px]">
          <div className="relative h-[68svh] min-h-[460px] lg:absolute lg:inset-0 lg:h-auto lg:min-h-0">
            <Scene />
            <FloorSelector />
            <UsageHint />
          </div>
          <SunControl />
          <HeroIntro />
        </section>
        <ProjectSection />
        <AmenitiesSection />
        <LocationSection />
      </main>
      <SiteFooter />
      <UnitDetail />
      <InquiryModal />
      <SmoothScroll />
      <IntroFallback />
      <Loader />
    </>
  );
}
