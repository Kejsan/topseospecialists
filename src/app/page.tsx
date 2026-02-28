import { SpecialistDirectory } from "@/components/custom/SpecialistDirectory";
import { initialSpecialistData } from "@/lib/data";

export default function Home() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 lg:py-16 space-y-12 max-w-7xl">
      <section className="text-center space-y-6 max-w-4xl mx-auto flex flex-col items-center pb-8 border-b border-border/40">
        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 rounded-full">
          The Curated List
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-balance bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
          Discover the top SEO minds.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl leading-relaxed">
          A definitive, community-curated list of the best Search Engine Optimization specialists. Find your next hire, mentor, or collaborator to skyrocket your organic traffic.
        </p>
      </section>

      <section>
        <SpecialistDirectory initialData={initialSpecialistData} />
      </section>
    </div>
  );
}
