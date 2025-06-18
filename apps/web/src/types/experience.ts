export interface Experience {
  name: string;
  company: string;
  duration: string;
  mission: string; // One-liner mission statement
  bullets?: string[]; // Expandable bullet points
  description?: string; // Keep for backward compatibility
}
