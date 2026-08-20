// Mirrors `enum CompanyStatus { None, ValueInvesting, Trading, Overvalued }` in TruffedMethod.sol
export type CompanyStatusKey = "VALUE" | "TRADING" | "OVERVALUED";

export const COMPANY_STATUS_TO_UINT: Record<CompanyStatusKey, number> = {
  VALUE: 1,
  TRADING: 2,
  OVERVALUED: 3,
};

export const COMPANY_STATUS_LABELS = [
  "None",
  "Value Investing",
  "Trading",
  "Overvalued",
];
