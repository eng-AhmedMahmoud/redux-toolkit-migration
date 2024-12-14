import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { PageRoutes } from "@/lib/pageroutes";
import Particles from "@/components/ui/particles";

export default function Home() {
  return (
    <div className="min-h-[80.5vh] flex flex-col justify-center items-center text-center px-2 py-8">
      <Particles
        className="absolute inset-0 -z-10 animate-fade-in"
        quantity={100}
      />
      <h1 className="text-4xl font-bold mb-4 sm:text-7xl">
        Redux toolkit Migration Docs
      </h1>
      <p className="max-w-[600px] text-foreground mb-8 sm:text-base">
        A simple documentation that will guide you through the migration <br className="hidden sm:inline"/> from <strong className="font-semibold">Redux Saga</strong> to <strong className="font-semibold">Redux Toolkit</strong> for the <a href="https://github.vodafone.com/sails-vvl-device-details-app" className="text-primary hover:underline">sails-vvl-device-details</a> repo
      </p>
      <div className="flex items-center gap-5">
        <Link
          href={`/docs${PageRoutes[0].href}`}
          className={buttonVariants({ className: "px-6", size: "lg" })}
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}