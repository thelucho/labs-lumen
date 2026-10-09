import { Scene } from "@/components/scene/Scene";
import { project } from "@/data/building";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative h-svh min-h-[560px] w-full">
        <Scene />
        <div className="pointer-events-none absolute left-4 top-6 sm:left-8 sm:top-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate">
            {project.address}
          </p>
          <h1 className="mt-2 font-serif text-4xl leading-none sm:text-5xl">{project.name}</h1>
        </div>
      </section>
    </main>
  );
}
