import { MDLVerificationResult } from "@/hooks/use-mdl-verification";
import { base64UrlEncode } from "@/lib/utils";

export interface MDLAttributes {
  family_name?: boolean;
  given_name?: boolean;
  birth_date?: boolean;
  portrait?: boolean;
  document_number?: boolean;
  driving_privileges?: boolean;
  issue_date?: boolean;
  expiry_date?: boolean;
  issuing_authority?: boolean;
  issuing_country?: boolean;
  age_over_18?: boolean;
  age_over_21?: boolean;
  resident_address?: boolean;
  [key: string]: boolean | undefined;
}

interface EphemeralKeyResponse {
  publicKey: string;
  privateKey: string;
}

interface CredentialResponse {
  protocol: string;
  data: unknown;
}

function isValidCredentialResponse(
  response: unknown
): response is CredentialResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "protocol" in response &&
    "data" in response
  );
}

interface CredentialDataJSON {
  token: string;
}

function toBase64(str: string): string {
  return btoa(str);
}

type ValidationResult = MDLVerificationResult & {
  [key: string]: unknown;
};

export class DigitalCredentialService {
  // Get ephemeral key pair from server
  private async getEphemeralKeyPair(): Promise<EphemeralKeyResponse> {
    try {
      const response = await fetch("/api/ephemeralKey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to generate ephemeral key: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching ephemeral key:", error);
      throw error;
    }
  }

  // Request mDL
  async requestMDL(
    attributes: MDLAttributes
  ): Promise<ValidationResult> {
    try {
      console.log("Starting mDL request with attributes:", attributes);

      // 1. Get ephemeral key pair from server
      const { privateKey, publicKey } = await this.getEphemeralKeyPair();
      console.log(
        "Received ephemeral key pair from server",
        privateKey,
        publicKey
      );

      // Generate a nonce
      const nonceBuffer = new Uint8Array(32);
      crypto.getRandomValues(nonceBuffer);
      const nonce = base64UrlEncode(Buffer.from(nonceBuffer));
      // Prepare the fields for the request based on selected attributes
      const fields = Object.entries(attributes)
        .filter(([, isSelected]) => isSelected)
        .map(([name]) => ({
          namespace: "org.iso.18013.5.1",
          name,
          intentToRetain: false,
        }));

      console.log("Fields to request:", fields);

      // Create the credential request options
      const controller = new AbortController();
      const credentialOptions = {
        signal: controller.signal,
        digital: {
          providers: [
            {
              protocol: "preview",
              request: {
                selector: {
                  format: ["mdoc"],
                  doctype: "org.iso.18013.5.1.mDL",
                  fields,
                },
                nonce: toBase64(nonce),
                readerPublicKey: publicKey,
              },
            },
          ],
        },
      };

      console.log(
        "Credential options:",
        JSON.stringify(credentialOptions, null, 2)
      );

      // 2. Request the credential
      const credential = await navigator.credentials.get(
        credentialOptions as unknown as CredentialRequestOptions
      );

      console.log("Received credential response:", credential);

      if (!credential) {
        return {
          success: false,
          error: "No credential returned",
        };
      }

      if (!isValidCredentialResponse(credential)) {
        return {
          success: false,
          error: "Invalid credential format received",
        };
      }

      // 3. Process the response
      if (typeof credential.data !== "string") {
        return {
          success: false,
          error: "Expected response data to be a string",
        };
      }

      // Parse the token from the wallet response
      console.log("Attempting to parse response data:", credential.data);
      let parsedData: CredentialDataJSON;
      try {
        parsedData = JSON.parse(
          credential.data as string
        ) as CredentialDataJSON;
        console.log("Successfully parsed data:", parsedData);
      } catch (error) {
        console.error("Error parsing JSON from phone:", error);
        console.log("Raw response data:", credential.data);
        // Try to handle different response formats
        if (typeof credential.data === "object") {
          console.log("Data is already an object, trying to use directly");
          parsedData = credential.data as unknown as CredentialDataJSON;
        } else {
          return {
            success: false,
            error: "Error parsing response data",
          };
        }
      }

      if (!parsedData.token) {
        return {
          success: false,
          error: "No token found in phone response",
        };
      }

      // 4. Validate with server
      console.log("About to call validateWithServer with data:", {
        token: parsedData.token ? "token exists" : "no token",
        protocol: credential.protocol
      });
      return await this.validateWithServer({
        token: toBase64(parsedData.token),
        ephemeralKey: {
          privateKey: toBase64(privateKey),
          publicKey: toBase64(publicKey),
        },
        nonce: toBase64(nonce),
        protocol: credential.protocol,
      });
    } catch (error: unknown) {
      console.error("Error requesting mDL:", error);

      if (error instanceof Error) {
        console.error("Error type:", error.constructor.name);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);

        // Check for specific error types
        if (error instanceof DOMException) {
          if (error.name === "NotSupportedError") {
            return {
              success: false,
              error: "Digital Credential API not supported in this browser",
            };
          } else if (error.name === "AbortError") {
            return {
              success: false,
              error: "Request was cancelled by user",
            };
          } else if (error.name === "NotFoundError") {
            return {
              success: false,
              error: "No ID found on this device",
            };
          }
        }

        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: String(error),
      };
    }
  }

  private async validateWithServer(data: {
    token: string;
    ephemeralKey: {
      privateKey: string;
      publicKey: string;
    };
    nonce: string;
    protocol: string;
  }): Promise<ValidationResult> {
    console.log("Validating with server, sending data:", {
      protocol: data.protocol,
      tokenExists: !!data.token,
      keyExists: !!data.ephemeralKey
    });
    
    try {
      const response = await fetch('/api/validateResponse', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      console.log("Validation response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Validation failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Validation result:", result);
      return result as ValidationResult;
    } catch (error) {
      console.error("Error in validateWithServer:", error);
      throw error;
    }
  }
}
