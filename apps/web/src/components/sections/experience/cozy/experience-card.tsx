"use client";

import type { Experience } from "@/types/experience";
import { useState } from "react";
import TextReveal from "@/components/fancy/text-reveal";
import { ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@repo/ui";
import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";

interface ExperienceCardProps extends Experience {
  className?: string;
}

function ExperienceCard({
  company,
  name,
  duration,
  mission,
  bullets,
  className,
}: ExperienceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={cn("border-none bg-transparent shadow-none", className)}>
      <CardContent className="p-1">
        <div className="flex items-baseline justify-between">
          <TextReveal as="h3" className="text-3xl font-semibold">
            {company}
          </TextReveal>
          <TextReveal as="span" className="text-sm font-medium">
            {duration}
          </TextReveal>
        </div>
        <TextReveal as="h4" className="mt-2 text-xl font-medium uppercase">
          {name}
        </TextReveal>
        <TextReveal
          as="p"
          className="mt-2 max-w-2xl text-lg font-light text-zinc-700 dark:text-zinc-400"
        >
          {mission}
        </TextReveal>

        {bullets && bullets.length > 0 && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-auto p-0 text-sm text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="mr-1 h-4 w-4" />
                  Hide details
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-4 w-4" />
                  Show details
                </>
              )}
            </Button>

            {isExpanded && (
              <div className="mt-3 space-y-2">
                {bullets.map((bullet, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-2 text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                    <span className="leading-relaxed">{bullet}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <hr className="border-border my-6 border-t" />
      </CardContent>
    </Card>
  );
}

export default ExperienceCard;
