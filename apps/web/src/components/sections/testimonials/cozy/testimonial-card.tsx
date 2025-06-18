import type { Testimonial } from "@/types/testimonial";
import React from "react";
import Image from "next/image";

import { cn } from "@repo/ui";
import { Card, CardContent, CardHeader } from "@repo/ui/card";

interface TestimonialCardProps extends Testimonial {
  className?: string;
}

function TestimonialCard({
  image,
  name,
  username,
  testimonial,
  linkedin,
  className,
}: TestimonialCardProps) {
  return (
    <Card
      className={cn("h-full w-full gap-4 rounded-xl", "bg-muted/40", className)}
    >
      <CardHeader className="flex items-center gap-3">
        <div className="relative flex items-center">
          {linkedin ? (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${name}'s LinkedIn`}
              className="group"
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={name || "Anonymous"}
                className="aspect-square h-12 w-12 rounded-full border-2 border-white object-cover transition hover:ring-2 hover:ring-blue-600"
                height={40}
                width={40}
              />
              <span className="absolute -right-2 -bottom-1 flex items-center justify-center rounded-full bg-white p-0.5 group-hover:bg-blue-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="text-blue-700 group-hover:text-blue-900"
                >
                  <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.29c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.29h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z" />
                </svg>
              </span>
            </a>
          ) : (
            <Image
              src={image || "/placeholder.svg"}
              alt={name || "Anonymous"}
              className="aspect-square h-12 w-12 rounded-full border-2 border-white object-cover"
              height={40}
              width={40}
            />
          )}
        </div>
        <div>
          <p className="font-semibold">{name || "Anonymous"}</p>
          {username && <p className="text-sm text-gray-500">{username}</p>}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-loose">
          {testimonial || "No testimonial provided."}
        </p>
      </CardContent>
    </Card>
  );
}

export default TestimonialCard;
