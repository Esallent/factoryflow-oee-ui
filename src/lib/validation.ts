import { UseFormSetError } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

// Numeric comparison tolerance
export const NUMERIC_TOLERANCE = 0.001;

/**
 * Compare two numbers with tolerance
 */
export function numbersEqual(a: number, b: number, tolerance = NUMERIC_TOLERANCE): boolean {
  return Math.abs(a - b) <= tolerance;
}

/**
 * Check if a number is greater than another with tolerance
 */
export function isGreaterThan(a: number, b: number, tolerance = NUMERIC_TOLERANCE): boolean {
  return a - b > tolerance;
}

/**
 * Check if a number is less than another with tolerance
 */
export function isLessThan(a: number, b: number, tolerance = NUMERIC_TOLERANCE): boolean {
  return b - a > tolerance;
}

/**
 * Check if a number is greater than or equal with tolerance
 */
export function isGreaterOrEqual(a: number, b: number, tolerance = NUMERIC_TOLERANCE): boolean {
  return a - b >= -tolerance;
}

/**
 * Check if a number is less than or equal with tolerance
 */
export function isLessOrEqual(a: number, b: number, tolerance = NUMERIC_TOLERANCE): boolean {
  return b - a >= -tolerance;
}

/**
 * Validation error types from backend
 */
export interface FieldError {
  field: string;
  message: string;
}

export interface ValidationErrorResponse {
  detail: string;
  errors?: FieldError[];
}

/**
 * Handle API validation errors globally
 * @param error - The error object from fetch/axios
 * @param setError - React Hook Form setError function (optional)
 * @returns boolean - true if error was handled
 */
export async function handleValidationError(
  error: any,
  setError?: UseFormSetError<any>
): Promise<boolean> {
  try {
    const status = error.status || error.response?.status;
    
    // 400 - Business Validation Error
    if (status === 400) {
      const errorData: ValidationErrorResponse = error.data || await error.json?.();
      
      if (errorData.errors && setError) {
        // Highlight individual fields with inline messages
        errorData.errors.forEach((fieldError) => {
          setError(fieldError.field as any, {
            type: "manual",
            message: fieldError.message,
          });
        });
        
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please correct the highlighted fields",
        });
        
        return true;
      }
      
      // Fallback if no field errors
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errorData.detail || "Please check your input",
      });
      
      return true;
    }
    
    // 422 - Unprocessable Entity (Schema Validation)
    if (status === 422) {
      const errorData: ValidationErrorResponse = error.data || await error.json?.();
      
      // Return error message for banner display
      return {
        showBanner: true,
        message: errorData.detail || "Incomplete or invalid data.",
      } as any;
    }
    
    return false;
  } catch (e) {
    console.error("Error handling validation error:", e);
    return false;
  }
}

/**
 * Validate numeric input constraints
 */
export function validateNumericInput(
  value: number,
  constraints: {
    min?: number;
    max?: number;
    positive?: boolean;
    nonNegative?: boolean;
  }
): string | null {
  if (constraints.positive && isLessOrEqual(value, 0)) {
    return "Value must be greater than 0";
  }
  
  if (constraints.nonNegative && isLessThan(value, 0)) {
    return "Value cannot be negative";
  }
  
  if (constraints.min !== undefined && isLessThan(value, constraints.min)) {
    return `Value must be at least ${constraints.min}`;
  }
  
  if (constraints.max !== undefined && isGreaterThan(value, constraints.max)) {
    return `Value must not exceed ${constraints.max}`;
  }
  
  return null;
}

/**
 * Validate production data constraints
 */
export function validateProductionData(data: {
  planned_time_min: number;
  planned_downtime_min: number;
  unplanned_downtime_min: number;
  total_units: number;
  defective_units: number;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  
  // Check downtime doesn't exceed planned time
  const totalDowntime = data.planned_downtime_min + data.unplanned_downtime_min;
  if (isGreaterThan(totalDowntime, data.planned_time_min)) {
    errors.unplanned_downtime_min = "Total downtime cannot exceed planned time";
  }
  
  // Check defective units don't exceed total units
  if (isGreaterThan(data.defective_units, data.total_units)) {
    errors.defective_units = "Defective units cannot exceed total units";
  }
  
  return errors;
}
