export interface Metric {
  label: string;
  value: string;
}

export interface ServiceSchema {
  _id: string;
  title: string;
  slug: { current: string };
  description: string;
  icon?: string;
  tcoSavingsPercentage: number;
  sla: string;
  iso27001Compliant: boolean;
  metrics: Metric[];
}

export interface CaseStudySchema {
  _id: string;
  title: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
}
