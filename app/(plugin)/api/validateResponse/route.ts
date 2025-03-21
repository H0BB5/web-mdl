import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, ephemeralKey, nonce, protocol } = body;
    
    console.log("Received validation request with protocol:", protocol);

    console.log("Received validation request with protocol:", protocol);
    console.log("Token length:", token?.length);
    console.log("Ephemeral key:", ephemeralKey);
    console.log("Nonce:", nonce);
    
    return NextResponse.json({
      success: true,
      data: {
        family_name: "Doe",
        given_name: "John",
        birth_date: "1990-01-01",
        portrait: {
          mimeType: "image/jpeg",
          data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" // A tiny 1x1 pixel
        },
        age_over_18: true,
        age_over_21: true
      }
    });
  } catch (error) {
    console.error('Error in validateResponse:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate response' 
      },
      { status: 500 }
    );
  }
}