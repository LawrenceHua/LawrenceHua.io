"use client";

import { useRef } from "react";
import ParallaxImage from "@/components/fancy/parallax-image";

function Hero() {
  const container = useRef<HTMLDivElement>(null);

  return (
    <section
      className="bg-background/[0.96] relative w-full overflow-hidden"
      ref={container}
    >
      <div className="relative z-10 h-[42.5dvh] md:h-[51.2dvh] md:min-h-[50dvh] xl:h-[61.2dvh]">
        <div className="relative flex h-full flex-col items-center justify-center">
          <div className="flex w-full items-center justify-center px-4 md:px-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-light leading-tight">
              <span className="block">A </span>
              <span className="block">developer</span>
              <br />
              <span className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 md:gap-4">
                <span className="block">Who</span>
                <span
                  className={
                  `relative mx-1 sm:mx-2 md:mx-4 my-auto inline-block aspect-[1.5/1] h-[2.5rem] sm:h-[3rem] md:h-[4rem] lg:h-[5rem] xl:h-[6rem] 2xl:h-[7rem] overflow-hidden rounded-full bg-linear-to-br from-pink-200 from-40% to-pink-400`
                  }
                >
                  <span className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl select-none">
                    ❤️
                  </span>
                </span>
                <span className="block">to</span>
                <span className="block">code</span>
              </span>
            </h1>
          </div>
        </div>
      </div>

      <ParallaxImage
        src="/images/hero.jpg"
        containerRef={container}
        alt="Hero image"
        containerClassName="aspect-4/2 w-screen lg:mt-28"
        priority
        parallaxOptions={{
          yStart: "-10%",
          yEnd: "10%",
          scaleStart: 1,
          scaleEnd: 1.5,
        }}
      />
    </section>
  );
}

export default Hero;
