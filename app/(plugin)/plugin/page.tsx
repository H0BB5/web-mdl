"use client";
import MDLVerifier from './components/mdl-verifier';

export default function PluginPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">mDL Verification</h1>
      <MDLVerifier />
    </div>
  );
}
