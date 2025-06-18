import type { Experience } from "@/types/experience";
import TextReveal from "@/components/fancy/text-reveal";

import { cn } from "@repo/ui";
import { Card, CardContent } from "@repo/ui/card";

interface ExperienceCardProps extends Experience {
  className?: string;
}

function ExperienceCard({
  company,
  name,
  duration,
  description,
  className,
}: ExperienceCardProps) {
  return (
    <Card
      className={cn(
        "flex min-h-full flex-col justify-between shadow-none w-full max-w-sm",
        className,
      )}
    >
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <TextReveal as="h3" className="text-xl sm:text-2xl md:text-3xl font-semibold break-words">
            {company}
          </TextReveal>
          <TextReveal as="span" className="text-xs sm:text-sm font-medium whitespace-nowrap">
            {duration}
          </TextReveal>
        </div>
        <TextReveal as="h4" className="mt-2 text-lg sm:text-xl font-medium uppercase break-words">
          {name}
        </TextReveal>
        <TextReveal
          as="p"
          className="mt-2 max-w-2xl text-sm sm:text-base md:text-lg font-light text-zinc-700 dark:text-zinc-400 break-words"
        >
          {description}
        </TextReveal>
      </CardContent>
    </Card>
  );
}

export default ExperienceCard;
