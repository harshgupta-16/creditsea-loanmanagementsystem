export interface BREResult {
  passed: boolean;
  errors: string[];
}

/**
 * Business Rule Engine (BRE)
 * Validates borrower eligibility before allowing loan application.
 * All checks must pass for the borrower to proceed.
 */
export const runBRE = (data: {
  dateOfBirth?: Date | string;
  monthlySalary?: number;
  pan?: string;
  employmentMode?: string;
}): BREResult => {
  const errors: string[] = [];

  // Rule 1: Age must be between 23 and 50
  if (data.dateOfBirth) {
    const dob = new Date(data.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 23 || age > 50) {
      errors.push(`Age must be between 23 and 50 years. Your age: ${age}`);
    }
  } else {
    errors.push('Date of birth is required.');
  }

  // Rule 2: Monthly salary must be at least ₹25,000
  if (data.monthlySalary !== undefined) {
    if (data.monthlySalary < 25000) {
      errors.push(
        `Monthly salary must be at least ₹25,000. Your salary: ₹${data.monthlySalary.toLocaleString()}`
      );
    }
  } else {
    errors.push('Monthly salary is required.');
  }

  // Rule 3: PAN must match valid format [A-Z]{5}[0-9]{4}[A-Z]{1}
  if (data.pan) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(data.pan.toUpperCase())) {
      errors.push(
        'PAN does not match the valid format (e.g., ABCDE1234F).'
      );
    }
  } else {
    errors.push('PAN is required.');
  }

  // Rule 4: Employment mode must not be 'unemployed'
  if (data.employmentMode) {
    if (data.employmentMode === 'unemployed') {
      errors.push('Unemployed applicants are not eligible for loans.');
    }
  } else {
    errors.push('Employment mode is required.');
  }

  return {
    passed: errors.length === 0,
    errors,
  };
};

/**
 * Calculate loan details using Simple Interest
 * SI = (P × R × T) / (365 × 100)  where T = tenure in days
 * Total Repayment = P + SI
 */
export const calculateLoan = (
  principal: number,
  tenureDays: number,
  ratePercent: number = 12
): { simpleInterest: number; totalRepayment: number } => {
  const simpleInterest = (principal * ratePercent * tenureDays) / (365 * 100);
  const totalRepayment = principal + simpleInterest;

  return {
    simpleInterest: Math.round(simpleInterest * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
  };
};
