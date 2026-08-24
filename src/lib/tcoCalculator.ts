export interface TcoResult {
  annualSpend: number;
  savings: number;
  newAnnualSpend: number;
}

/**
 * Calcula el ahorro anual estimado de FinOps a partir del gasto mensual
 * cloud actual y una meta de eficiencia (%). Valores negativos o no
 * numéricos se tratan como 0, igual que hacía el script original.
 */
export function calculateTco(monthlySpend: number, efficiencyGoalPercent: number): TcoResult {
  const spend = monthlySpend || 0;
  const efficiency = efficiencyGoalPercent || 0;

  const annualSpend = spend * 12;
  const savings = annualSpend * (efficiency / 100);
  const newAnnualSpend = annualSpend - savings;

  return { annualSpend, savings, newAnnualSpend };
}
