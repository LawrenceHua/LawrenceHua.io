"use client";

import React, { useState } from "react";
import TextReveal from "@/components/fancy/text-reveal";
import MotionWrap from "@/components/motion-wrap";
import { experiences } from "@/components/sections/experience/config";

import ExperienceCard from "./experience-card";

// Helper to parse start and end year from duration string
function parseYears(duration: string): { start: number; end: number } {
  const [startStr, endStr] = duration.split("-").map((s) => s.trim());
  const start = parseInt(startStr, 10);
  let end: number;
  if (endStr?.toLowerCase() === "present") {
    end = new Date().getFullYear();
  } else {
    end = parseInt(endStr, 10);
  }
  return { start, end };
}

// Get all years covered by any experience
const allYears = Array.from(
  new Set(
    experiences.flatMap((exp) => {
      const { start, end } = parseYears(exp.duration);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }),
  ),
).sort((a, b) => b - a);

function Experiences() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Filter experiences by selected year
  const filtered = selectedYear
    ? experiences.filter((exp) => {
        const { start, end } = parseYears(exp.duration);
        return start <= selectedYear && end >= selectedYear;
      })
    : experiences;

  return (
    <MotionWrap className="w-full py-24 lg:py-32" id="experiences">
      <div className="px-4 md:px-6">
        <div className="flex flex-col gap-10">
          <div className="space-y-4">
            <TextReveal
              as="h2"
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl/none"
            >
              My Experience
            </TextReveal>
            <TextReveal as="p" className="text-gray-500 dark:text-gray-400">
              Here are some of my work experiences where I&apos;ve turned
              challenges into accomplishments, making things happen.
            </TextReveal>
            <div className="mt-2 flex flex-wrap gap-2">
              {allYears.map((year) => (
                <button
                  key={year}
                  className={`rounded border px-3 py-1 text-sm font-medium transition-colors ${
                    selectedYear === year
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-zinc-300 dark:border-zinc-700"
                  }`}
                  onClick={() =>
                    setSelectedYear(year === selectedYear ? null : year)
                  }
                >
                  {year}
                </button>
              ))}
              {selectedYear && (
                <button
                  className="bg-muted text-muted-foreground ml-2 rounded border border-zinc-300 px-3 py-1 text-sm font-medium dark:border-zinc-700"
                  onClick={() => setSelectedYear(null)}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="grid min-w-max grid-cols-1 gap-4 md:min-w-0 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((experience, index) => (
                <ExperienceCard
                  key={`experience_${index}`}
                  name={experience.name}
                  description={experience.description}
                  company={experience.company}
                  duration={experience.duration}
                />
              ))}
              {filtered.length === 0 && (
                <div className="text-muted-foreground col-span-full py-8 text-center">
                  No experiences found for {selectedYear}.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MotionWrap>
  );
}

export default Experiences;
