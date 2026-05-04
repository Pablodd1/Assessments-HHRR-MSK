/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EMPLOYER COST ENGINE — BLS-Grounded Absence & Presenteeism Calculator
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Sources & Provenance:
 *   Compensation — BLS Employer Costs for Employee Compensation, Dec 2025
 *   Absence Rates — BLS Current Population Survey, 2025 annual averages
 *   Wage Multipliers — Nicholson et al. (2006) median 1.28; Pauly et al. (2008)
 *     absenteeism 1.97, acute presenteeism 1.70, chronic presenteeism 1.54
 *   WPAI Formula — Reilly et al. (1993) Work Productivity & Activity Impairment
 *   Paid Leave — BLS National Compensation Survey, March 2025
 *
 * DESIGN PRINCIPLE:
 *   - Use company payroll/benefits data when available
 *   - Fall back to BLS occupation/industry averages when payroll unavailable
 *   - Keep direct_cost and multiplied_cost as SEPARATE fields
 *   - Never present multiplied cost as official regulatory number
 */

// ─── BLS Reference Data (Dec 2025) ─────────────────────────────────────

export const BLS_COMPENSATION_2025 = {
  privateIndustry: {
    totalHourly: 46.15,     // Total compensation per hour worked
    wagesHourly: 32.36,     // Wages and salaries
    benefitsHourly: 13.79,  // Benefits
    source: 'BLS Employer Costs for Employee Compensation, December 2025',
    note: 'Private-industry workers average'
  },
  dailyCompensation8hr: 369.20,  // $46.15 × 8 hours
} as const;

export const BLS_ABSENCE_RATES_2025 = {
  allWorkers: {
    totalRate: 3.2,              // percent
    illnessInjuryRate: 2.2,      // percent
  },
  privateSector: {
    totalRate: 3.0,
    illnessInjuryRate: 2.1,
  },
  byOccupation: {
    healthcareSupport: { totalRate: 4.1, note: 'Highest occupational group' },
    healthcareAndSocialAssistance: { totalRate: 3.8 },
    manufacturing: { totalRate: 2.7 },
    professionalServices: { totalRate: 2.4 },
    construction: { totalRate: 3.1 },
    retail: { totalRate: 3.3 },
  },
  source: 'BLS Current Population Survey, 2025 annual averages',
  caveat: '2025 estimates are 11-month averages (October 2025 data not collected during shutdown)'
} as const;

export const BLS_PAID_LEAVE_2025 = {
  privateSectorAccess: 0.80,        // 80% have paid sick leave
  civilianAccess: 0.82,             // 82%
  avgSickDaysAfter1Year: 7,         // from chart package
  avgSickDaysFixedPlan: 8,          // from broader factsheet (different denominator)
  source: 'BLS National Compensation Survey, March 2025'
} as const;


// ─── Wage Multipliers (Peer-Reviewed) ──────────────────────────────────

export const WAGE_MULTIPLIERS = {
  conservative: {
    value: 1.00,
    label: 'Direct compensation only',
    description: 'No indirect cost assumption — pure wage + benefits',
    source: 'Baseline (no multiplier)'
  },
  standard: {
    value: 1.28,
    label: 'Standard team-production multiplier',
    description: 'Median multiplier for missed work in team production environments',
    source: 'Nicholson et al. (2006). How to present the business case for healthcare quality to employers. Applied Health Economics & Health Policy, 5(3), 135-145.'
  },
  highFriction: {
    value: 1.97,
    label: 'High-collaboration / hard-to-replace roles',
    description: 'Mean manager-estimated multiplier for absenteeism',
    source: 'Pauly et al. (2008). Valuing reductions in on-the-job illness. Health Economics, 17(4), 469-485.'
  },
  presenteeismAcute: {
    value: 1.70,
    label: 'Acute presenteeism multiplier',
    description: 'Short-term productivity loss when working while ill',
    source: 'Pauly et al. (2008)'
  },
  presenteeismChronic: {
    value: 1.54,
    label: 'Chronic presenteeism multiplier',
    description: 'Ongoing reduced productivity from chronic conditions',
    source: 'Pauly et al. (2008)'
  },
  workEnvironment: {
    value: 1.72,
    label: 'Work-environment-related productivity problems',
    description: 'Losses from poor ergonomics, noise, temperature, etc.',
    source: 'Pauly et al. (2008)'
  }
} as const;


// ─── Cost Calculation Engine ────────────────────────────────────────────

export interface CostInput {
  // Company-specific data (preferred)
  totalEmployees: number;
  avgAnnualSalary?: number;           // If available, use this
  avgHourlyCompensation?: number;     // Alternative to salary
  avgBenefitsPerHour?: number;
  scheduledHoursPerDay?: number;      // Default: 8
  // Absence data
  avgSickDaysPerYear: number;
  avgLateMinutesPerWeek?: number;
  // Workforce friction
  turnoverRatePercent?: number;
  recruitmentCostPerHire?: number;
  trainingWeeks?: number;
  // Multiplier selection
  multiplierProfile: 'conservative' | 'standard' | 'highFriction';
  // Industry for BLS fallback
  industry?: keyof typeof BLS_ABSENCE_RATES_2025.byOccupation;
}

export interface CostResult {
  // Direct costs (no multiplier)
  directAbsenceCostPerDay: number;
  directAbsenceCostTotal: number;
  // Multiplied costs (with wage multiplier)
  adjustedAbsenceCostPerDay: number;
  adjustedAbsenceCostTotal: number;
  // Presenteeism (WPAI-based)
  presenteeismCostTotal: number;
  overallWorkImpairment: number;
  // Turnover costs
  turnoverCostTotal: number;
  costPerTurnover: number;
  annualTurnoverCount: number;
  // Lateness costs
  latenessCostTotal: number;
  lateHoursPerYear: number;
  // Grand totals
  grandTotalDirect: number;
  grandTotalAdjusted: number;
  costPerEmployeeDirect: number;
  costPerEmployeeAdjusted: number;
  // Metadata
  multiplierUsed: { value: number; label: string; source: string };
  dataSource: 'company_provided' | 'bls_fallback';
  calculations: CostCalculationBreakdown;
}

export interface CostCalculationBreakdown {
  hourlyCompensation: number;
  dailyCompensation: number;
  workingDaysPerYear: number;
  formulas: {
    directAbsence: string;
    adjustedAbsence: string;
    presenteeism: string;
    turnover: string;
    lateness: string;
  };
}

/**
 * WPAI Overall Work Impairment Formula:
 * overall_work_impairment = absenteeism + ((1 - absenteeism) × presenteeism)
 *
 * Where absenteeism and presenteeism are proportions (0-1).
 * Then cost = hours_worked × compensation × impairment × multiplier
 */
export function calculateWPAI(
  absenteeismRate: number,  // proportion 0-1 (e.g., 0.032 for 3.2%)
  presenteeismRate: number  // proportion 0-1 (self-reported productivity loss)
): { overallImpairment: number; formula: string } {
  const overallImpairment = absenteeismRate + ((1 - absenteeismRate) * presenteeismRate);
  return {
    overallImpairment,
    formula: `${(absenteeismRate * 100).toFixed(1)}% + ((1 - ${(absenteeismRate * 100).toFixed(1)}%) × ${(presenteeismRate * 100).toFixed(1)}%) = ${(overallImpairment * 100).toFixed(1)}%`
  };
}

export function calculateEmployerCosts(input: CostInput): CostResult {
  const hoursPerDay = input.scheduledHoursPerDay ?? 8;
  const workingDaysPerYear = 260;

  // Determine hourly compensation
  let hourlyComp: number;
  let dataSource: CostResult['dataSource'];

  if (input.avgHourlyCompensation) {
    hourlyComp = input.avgHourlyCompensation + (input.avgBenefitsPerHour ?? 0);
    dataSource = 'company_provided';
  } else if (input.avgAnnualSalary) {
    // Convert salary to hourly, add 42.6% for benefits (BLS ratio: 13.79/32.36)
    const hourlyWage = input.avgAnnualSalary / (workingDaysPerYear * hoursPerDay);
    const benefitsRatio = BLS_COMPENSATION_2025.privateIndustry.benefitsHourly / BLS_COMPENSATION_2025.privateIndustry.wagesHourly;
    hourlyComp = hourlyWage * (1 + benefitsRatio);
    dataSource = 'company_provided';
  } else {
    hourlyComp = BLS_COMPENSATION_2025.privateIndustry.totalHourly;
    dataSource = 'bls_fallback';
  }

  const dailyComp = hourlyComp * hoursPerDay;
  const multiplier = WAGE_MULTIPLIERS[input.multiplierProfile];

  // ─── Direct Absence Costs ───
  const directAbsenceCostPerDay = dailyComp;
  const directAbsenceCostTotal = dailyComp * input.avgSickDaysPerYear * input.totalEmployees;
  const adjustedAbsenceCostPerDay = dailyComp * multiplier.value;
  const adjustedAbsenceCostTotal = adjustedAbsenceCostPerDay * input.avgSickDaysPerYear * input.totalEmployees;

  // ─── Presenteeism (WPAI) ───
  const absenteeismRate = input.avgSickDaysPerYear / workingDaysPerYear;
  const assumedPresenteeismRate = 0.12; // conservative estimate from literature
  const wpai = calculateWPAI(absenteeismRate, assumedPresenteeismRate);
  const presenteeismMultiplier = WAGE_MULTIPLIERS.presenteeismAcute.value;
  const hoursWorked = (workingDaysPerYear - input.avgSickDaysPerYear) * hoursPerDay;
  const presenteeismCostTotal = hoursWorked * hourlyComp * assumedPresenteeismRate * presenteeismMultiplier * input.totalEmployees;

  // ─── Turnover ───
  const turnoverRate = (input.turnoverRatePercent ?? 18) / 100;
  const annualTurnoverCount = Math.round(input.totalEmployees * turnoverRate);
  const recruitCost = input.recruitmentCostPerHire ?? 4500;
  const trainingCost = dailyComp * (input.trainingWeeks ?? 6) * 5; // 5 days/week
  const lostProductivityCost = (input.avgAnnualSalary ?? dailyComp * workingDaysPerYear) * 0.5; // 50% productivity loss during ramp
  const costPerTurnover = recruitCost + trainingCost + lostProductivityCost;
  const turnoverCostTotal = annualTurnoverCount * costPerTurnover;

  // ─── Lateness ───
  const lateMinPerWeek = input.avgLateMinutesPerWeek ?? 15;
  const lateHoursPerYear = (lateMinPerWeek / 60) * 52;
  const latenessCostTotal = hourlyComp * lateHoursPerYear * input.totalEmployees;

  // ─── Grand Totals ───
  const grandTotalDirect = directAbsenceCostTotal + presenteeismCostTotal + turnoverCostTotal + latenessCostTotal;
  const grandTotalAdjusted = adjustedAbsenceCostTotal + presenteeismCostTotal + turnoverCostTotal + latenessCostTotal;

  return {
    directAbsenceCostPerDay,
    directAbsenceCostTotal,
    adjustedAbsenceCostPerDay,
    adjustedAbsenceCostTotal,
    presenteeismCostTotal,
    overallWorkImpairment: wpai.overallImpairment,
    turnoverCostTotal,
    costPerTurnover,
    annualTurnoverCount,
    latenessCostTotal,
    lateHoursPerYear,
    grandTotalDirect,
    grandTotalAdjusted,
    costPerEmployeeDirect: grandTotalDirect / input.totalEmployees,
    costPerEmployeeAdjusted: grandTotalAdjusted / input.totalEmployees,
    multiplierUsed: { value: multiplier.value, label: multiplier.label, source: multiplier.source },
    dataSource,
    calculations: {
      hourlyCompensation: hourlyComp,
      dailyCompensation: dailyComp,
      workingDaysPerYear,
      formulas: {
        directAbsence: `daily_comp ($${dailyComp.toFixed(2)}) × sick_days (${input.avgSickDaysPerYear}) × employees (${input.totalEmployees})`,
        adjustedAbsence: `daily_comp × sick_days × employees × multiplier (${multiplier.value})`,
        presenteeism: `hours_worked × hourly_comp × presenteeism_rate (12%) × multiplier (${presenteeismMultiplier})`,
        turnover: `turnover_count (${annualTurnoverCount}) × (recruitment + training + lost_productivity)`,
        lateness: `hourly_comp × late_hours_per_year (${lateHoursPerYear.toFixed(1)}) × employees`
      }
    }
  };
}


// ─── Quick Reference Calculations (for display) ────────────────────────

export function getQuickCostEstimates() {
  return {
    directMissedDay: {
      value: BLS_COMPENSATION_2025.dailyCompensation8hr,
      label: 'Direct compensation-only missed day (BLS avg)',
      formula: '$46.15/hr × 8 hours'
    },
    standardAdjustedMissedDay: {
      value: BLS_COMPENSATION_2025.dailyCompensation8hr * WAGE_MULTIPLIERS.standard.value,
      label: 'Standard employer-adjusted missed day (×1.28)',
      formula: '$369.20 × 1.28'
    },
    highFrictionMissedDay: {
      value: BLS_COMPENSATION_2025.dailyCompensation8hr * WAGE_MULTIPLIERS.highFriction.value,
      label: 'High-friction missed day (×1.97)',
      formula: '$369.20 × 1.97'
    }
  };
}


// ─── ROI Calculator ────────────────────────────────────────────────────

export interface ROIInput {
  currentCosts: CostResult;
  interventionCostPerEmployee: number;
  projectedAbsenceReduction: number;     // proportion (e.g., 0.20 = 20% reduction)
  projectedTurnoverReduction: number;
  projectedPresenteeismReduction: number;
}

export interface ROIResult {
  annualSavings: number;
  interventionCost: number;
  netROI: number;
  roiPercent: number;
  paybackMonths: number;
  savingsBreakdown: {
    absenceSavings: number;
    turnoverSavings: number;
    presenteeismSavings: number;
  };
}

export function calculateROI(input: ROIInput): ROIResult {
  const absenceSavings = input.currentCosts.adjustedAbsenceCostTotal * input.projectedAbsenceReduction;
  const turnoverSavings = input.currentCosts.turnoverCostTotal * input.projectedTurnoverReduction;
  const presenteeismSavings = input.currentCosts.presenteeismCostTotal * input.projectedPresenteeismReduction;

  const annualSavings = absenceSavings + turnoverSavings + presenteeismSavings;
  const interventionCost = input.interventionCostPerEmployee * input.currentCosts.grandTotalDirect / input.currentCosts.costPerEmployeeDirect; // total employees
  const netROI = annualSavings - interventionCost;
  const roiPercent = interventionCost > 0 ? ((annualSavings - interventionCost) / interventionCost) * 100 : 0;
  const paybackMonths = interventionCost > 0 ? (interventionCost / (annualSavings / 12)) : 0;

  return {
    annualSavings,
    interventionCost,
    netROI,
    roiPercent: Math.round(roiPercent),
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    savingsBreakdown: { absenceSavings, turnoverSavings, presenteeismSavings }
  };
}
