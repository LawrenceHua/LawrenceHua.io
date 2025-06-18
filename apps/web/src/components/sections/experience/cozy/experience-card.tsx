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
          className="dark:text-primary-200 mt-4 max-w-2xl text-2xl font-bold text-white drop-shadow-lg"
        >
          {mission}
        </TextReveal>

        {bullets && bullets.length > 0 && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary-300 hover:text-primary-100 dark:text-primary-300 dark:hover:text-primary-100 h-auto p-0 text-base"
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
              <div className="mt-3 space-y-3">
                {bullets.map((bullet, index) => (
                  <div
                    key={index}
                    className="text-primary-200 dark:text-primary-100 flex items-start space-x-2 text-lg"
                  >
                    <span className="bg-primary-300 dark:bg-primary-200 mt-2 h-2 w-2 flex-shrink-0 rounded-full" />
                    <span className="leading-relaxed font-medium">
                      {bullet}
                    </span>
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
