import { DigitalCredentialService } from '@/services/digital-credential-service';
import { useState, useCallback, useMemo } from 'react';

interface DrivingPrivilege {
  vehicle_category_code: string;
  issue_date?: string;
  expiry_date?: string;
  code?: string;
  [key: string]: string | undefined;
}

export interface MDLData {
  family_name?: string;
  given_name?: string;
  birth_date?: string;
  document_number?: string;
  driving_privileges?: DrivingPrivilege[]; 
  issue_date?: string;
  expiry_date?: string;
  issuing_authority?: string;
  issuing_country?: string;
  age_over_18?: boolean;
  age_over_21?: boolean;
  resident_address?: string;
  portrait?: {
    mimeType: string;
    data: string;
  };
  [key: string]: string | boolean | object | undefined;
}

export interface MDLVerificationResult {
  success: boolean;
  data?: MDLData;
  error?: string;
}

export function useMDLVerification() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<MDLVerificationResult | null>(null);
    
    // Memoize the service instance
    const service = useMemo(() => new DigitalCredentialService(), []);
  
    const verifyMDL = useCallback(async (attributes: Record<string, boolean>) => {
      try {
        setLoading(true);
        setResult(null);
  
        // Check if Digital Credentials API is supported
        if (!isDigitalCredentialSupported()) {
          setResult({
            success: false,
            error: 'Digital Credentials API is not supported in this browser'
          });
          return false;
        }
  
        // Request mDL with specified attributes
        const verificationResult = await service.requestMDL(
          attributes
        );
  
        setResult(verificationResult as MDLVerificationResult);
        return verificationResult.success;
      } catch (error) {
        console.error('MDL verification error:', error);
        
        setResult({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
        
        return false;
      } finally {
        setLoading(false);
      }
    }, [service]);
  
    return { verifyMDL, loading, result };
  }
  

// Helper function to check if Digital Credentials API is supported
function isDigitalCredentialSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'credentials' in navigator &&
    typeof navigator.credentials.get === 'function'
  );
}
