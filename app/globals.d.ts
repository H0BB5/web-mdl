/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
    interface CredentialCreationOptions {
      digital?: {
        protocol: string;
        data: any;
      };
    }
  
    interface CredentialRequestOptions {
      digital?: {
        providers: Array<{
          protocol: string;
          request: any;
        }>;
      };
    }
  
    interface DigitalCredential extends Credential {
      readonly data: string;
      readonly protocol: string;
    }
  
    interface IdentityCredential extends Credential {
      readonly token: string;
    }
  }

  export {};