import crypto from 'crypto';
import { createEphemeralKey } from './route';

describe('createEphemeralKey', () => {
  it('should generate a valid ephemeral key pair', () => {
    const keyPair = createEphemeralKey();
    
    // Convert base64url to regular base64 for Buffer creation
    const privateKeyBase64 = keyPair.privateKey
      .replaceAll('-', '+')
      .replaceAll('_', '/');
    
    const publicKeyBase64 = keyPair.publicKey
      .replaceAll('-', '+')
      .replaceAll('_', '/');
    
    const privateKeyBuffer = Buffer.from(privateKeyBase64, 'base64');
    const publicKeyBuffer = Buffer.from(publicKeyBase64, 'base64');
    
    expect(privateKeyBuffer).toHaveLength(32);
    expect(publicKeyBuffer).toHaveLength(65);
    
    const ecdh = crypto.createECDH('prime256v1');
    ecdh.setPrivateKey(privateKeyBuffer);
    const computedPublicKey = ecdh.getPublicKey();
    expect(computedPublicKey).toStrictEqual(publicKeyBuffer);
  });
});


// Wallet -> [request] -> [respond back with epehemeral key pair] -> [*if keypair is good* wallet responds contrent] -> VICAL list to validate/decode -> respond back with data 