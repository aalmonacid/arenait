export interface ServiceSchema {
  _id: string;
  title: string;
  slug: { current: string };
  icon?: string;
  summary: string;
  description: string;
}

export interface CaseStudySchema {
  _id: string;
  title: string;
  slug: { current: string };
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
}

export interface TestimonialSchema {
  _id: string;
  authorName: string;
  role?: string;
  company?: string;
  quote: string;
  photo?: unknown;
}
