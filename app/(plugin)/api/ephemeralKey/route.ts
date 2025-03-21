import { toBase64Url } from '@/lib/utils';
import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

export async function POST() {
  try {
    const ecdh = crypto.createECDH('prime256v1'); // P-256
    ecdh.generateKeys();
    
    // Get the raw private key
    const privateKey = ecdh.getPrivateKey();
    
    const publicKey = ecdh.getPublicKey();
    
    const privateKeyBase64 = toBase64Url(privateKey);
    const publicKeyBase64 = toBase64Url(publicKey);
    
    console.log("Generated ephemeral key pair:");
    console.log("Private key length:", privateKey.length);
    console.log("Public key length:", publicKey.length);
    
    return NextResponse.json({
      privateKey: privateKeyBase64,
      publicKey: publicKeyBase64
    });
  } catch (error) {
    console.error('Error generating ephemeral key:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate ephemeral key' },
      { status: 500 }
    );
  }
}
