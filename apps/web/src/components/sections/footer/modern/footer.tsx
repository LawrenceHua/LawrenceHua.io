"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

import Content from "./content";

export default function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5]);

  return (
    <div
      ref={containerRef}
      className="relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] xl:h-[600px] 2xl:h-[700px]"
      style={{
        clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)",
      }}
    >
      <motion.div
        className="fixed bottom-0 h-[300px] w-full sm:h-[350px] md:h-[400px] lg:h-[500px] xl:h-[600px] 2xl:h-[700px]"
        style={{ opacity }}
      >
        <Content />
      </motion.div>
    </div>
  );
}
