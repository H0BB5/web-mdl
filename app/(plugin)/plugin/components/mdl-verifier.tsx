'use client';

import { useState } from 'react';
import { useMDLVerification } from '@/hooks/use-mdl-verification';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MDLVerifier() {
  const { verifyMDL, loading, result } = useMDLVerification();
  const [showPreview, setShowPreview] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState({
    family_name: true,
    given_name: true,
    birth_date: true,
    portrait: true,
    document_number: false,
    driving_privileges: false,
    issue_date: false,
    expiry_date: false,
    issuing_authority: false,
    issuing_country: false,
    age_over_18: false,
    age_over_21: false,
    resident_address: false,
  });

  const handleAttributeChange = (attribute: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attribute]: !prev[attribute as keyof typeof prev]
    }));
  };

  const handleVerify = async () => {
    await verifyMDL(selectedAttributes);
  };

  // Generate a preview of the request that would be sent
  const generateRequestPreview = () => {
    // Create fields array based on selected attributes
    const fields = Object.entries(selectedAttributes)
      .filter(([, isSelected]) => isSelected)
      .map(([name]) => ({
        namespace: "org.iso.18013.5.1",
        name,
        intentToRetain: false,
      }));

    // Generate mock values for nonce and readerPublicKey
    const mockNonce = "vqoHh9hbiVT5KuZ0mWH_4ELpccxMV3f18JUbrlHiPWA=";
    const mockPublicKey = "BLJXpdEjMzMV34-vCbCof55zPF3Cq0Jp7S0pGhhJo1aNFRRQ704RVNxYZM1dvW3yZztpuVirvXZ1qbXJev8C3oI=";

    // Create the preview object
    const preview = {
      protocol: "preview",
      request: {
        selector: {
          format: ["mdoc"],
          doctype: "org.iso.18013.5.1.mDL",
          fields,
        },
        nonce: mockNonce,
        readerPublicKey: mockPublicKey,
      }
    };

    return preview;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mobile Driver&apos;s License Verification</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Select Attributes to Request</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(selectedAttributes).map(([attr, isSelected]) => (
            <div key={attr} className="flex items-center">
              <input
                type="checkbox"
                id={attr}
                checked={isSelected}
                onChange={() => handleAttributeChange(attr)}
                className="mr-2"
              />
              <label htmlFor={attr} className="capitalize">
                {attr.replace(/_/g, ' ')}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={handleVerify}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Verifying...' : 'Verify mDL'}
        </button>
        
        <button
          onClick={() => setShowPreview(true)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Show Preview
        </button>
      </div>
      
      {/* Preview Dialog using Shadcn UI */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Request Preview</DialogTitle>
            <DialogDescription>
              This is the request that will be sent to the Digital Credentials API.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Protocol</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-2 rounded">preview</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Request</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto max-h-[50vh]">
                  <pre className="bg-muted p-3 rounded text-sm whitespace-pre-wrap break-all">
                    {JSON.stringify(generateRequestPreview().request, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {result && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-3">
            {result.success ? 'Verification Successful' : 'Verification Failed'}
          </h2>
          
          {result.error && (
            <div className="text-red-600 mb-3">
              Error: {result.error}
            </div>
          )}
          
          {result.success && result.data && (
            <div>
              <h3 className="text-lg font-medium mb-2">Verified Data:</h3>
              <pre className="bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
              
              {result.data.portrait && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Portrait:</h3>
                  <Image 
                    width={200}
                    height={500}
                    src={`data:${result.data.portrait.mimeType};base64,${result.data.portrait.data}`}
                    alt="Portrait"
                    style={{ maxWidth: '100%', height: 'auto'}}
                    className="max-w-xs border"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}