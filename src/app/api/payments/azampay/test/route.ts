import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { env, clientId, clientSecret, appName } = body;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Incomplete AzamPay credentials' }, { status: 400 });
    }

    const baseUrl = env === 'production' 
      ? 'https://authenticator.azampay.co.tz' 
      : 'https://authenticator-sandbox.azampay.co.tz';

    const response = await fetch(`${baseUrl}/AppRegistration/GenerateToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appName: appName || 'Sandbox',
        clientId: clientId,
        clientSecret: clientSecret,
      }),
    });

    const data = await response.json();
    console.log('AzamPay Auth Response:', JSON.stringify(data));

    // AzamPay sometimes returns { success: true, data: "token" } 
    // or sometimes just { data: "token" } or even { token: "..." }
    const token = data.data || data.token || (typeof data === 'string' ? data : null);
    const isSuccess = data.success !== false && !!token;

    if (response.ok && isSuccess) {
      return NextResponse.json({
        success: true,
        message: 'AzamPay Token generated successfully',
        data: {
          expires_in: data.expires_in || 3600,
          token_type: data.token_type || 'Bearer',
          token_preview: typeof token === 'string' ? `${token.substring(0, 10)}...` : 'Received',
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || 'Failed to generate token',
        details: data
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('AzamPay test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
