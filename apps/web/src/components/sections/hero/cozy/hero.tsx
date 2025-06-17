import React from "react";
import Image from "next/image";
import TextReveal from "@/components/fancy/text-reveal";
import MotionWrap from "@/components/motion-wrap";
// import { metadata as meta } from '@/app/config';
import { hero } from "@/components/sections/hero/config";

function Hero() {
  return (
    <MotionWrap className="flex h-[calc(100dvh-(--spacing(14)))] w-full items-center justify-center">
      <div className="grid items-start justify-center gap-4 px-4 md:grid-cols-2 md:px-6 lg:gap-10">
        <div className="space-y-3 text-left">
          <div className="dark:bg-foreground/10 inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">
            {hero.label}
          </div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
            Hi, I&apos;m <TextReveal>{hero.name}</TextReveal>
          </h1>
          <TextReveal
            as="p"
            className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
          >
            {hero.description}
          </TextReveal>
        </div>
        <Image
          alt="Lawrence Hua headshot"
          className="mx-auto aspect-square overflow-hidden rounded-full object-cover object-center border-4 border-blue-500 shadow-lg"
          height="240"
          width="240"
          src={"/images/hero.jpg"}
          priority
        />
        <div className="flex justify-center gap-4 mt-4">
          <a href="https://linkedin.com/in/lawrence-hua" target="_blank" rel="noopener" aria-label="LinkedIn">
            <svg width="28" height="28" fill="currentColor" className="text-blue-700 hover:text-blue-900"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.29c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.29h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/></svg>
          </a>
          <a href="https://github.com/LawrenceHua" target="_blank" rel="noopener" aria-label="GitHub">
            <svg width="28" height="28" fill="currentColor" className="text-gray-800 hover:text-black"><path d="M14 0c-7.73 0-14 6.27-14 14 0 6.18 4.01 11.41 9.57 13.27.7.13.96-.3.96-.67 0-.33-.01-1.21-.02-2.38-3.89.85-4.71-1.88-4.71-1.88-.64-1.62-1.56-2.05-1.56-2.05-1.27-.87.1-.85.1-.85 1.4.1 2.14 1.44 2.14 1.44 1.25 2.14 3.28 1.52 4.08 1.16.13-.91.49-1.52.89-1.87-3.11-.35-6.38-1.56-6.38-6.93 0-1.53.55-2.78 1.44-3.76-.14-.36-.62-1.8.14-3.75 0 0 1.17-.38 3.83 1.44 1.11-.31 2.3-.47 3.48-.47s2.37.16 3.48.47c2.66-1.82 3.83-1.44 3.83-1.44.76 1.95.28 3.39.14 3.75.89.98 1.44 2.23 1.44 3.76 0 5.39-3.28 6.58-6.4 6.93.5.43.94 1.28.94 2.58 0 1.86-.02 3.36-.02 3.82 0 .37.26.81.97.67 5.56-1.86 9.57-7.09 9.57-13.27 0-7.73-6.27-14-14-14z"/></svg>
          </a>
          <a href="https://expiredsolutions.com" target="_blank" rel="noopener" aria-label="Expired Solutions">
            <svg width="28" height="28" fill="currentColor" className="text-green-700 hover:text-green-900"><circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2" fill="none"/><text x="14" y="19" textAnchor="middle" fontSize="12" fill="currentColor">ES</text></svg>
          </a>
        </div>
      </div>
    </MotionWrap>
  );
}

export default Hero;
