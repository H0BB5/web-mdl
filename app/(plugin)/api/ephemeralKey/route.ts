import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { base64UrlEncode } from '@/lib/utils';



export function createEphemeralKey(): {
  publicKey: string;
  privateKey: string;
} {
  const ecdh = crypto.createECDH('prime256v1'); // P-256
  ecdh.generateKeys();

  return {
    privateKey: base64UrlEncode(ecdh.getPrivateKey()),
    publicKey: base64UrlEncode(ecdh.getPublicKey()) // Uncompressed (65 bytes)
  };
}

export async function POST() {
  try {
    const keyPair = createEphemeralKey();
    
    return NextResponse.json(keyPair, { status: 200 });
  } catch (error) {
    console.error('Error generating ephemeral key:', error);
    return NextResponse.json(
      { error: 'Failed to generate ephemeral key' },
      { status: 500 }
    );
  }
}