import { isBase } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { UserOperation } from 'permissionless';
import { paymasterClient } from '@/utils/paymasterClient';
// import { isValidAAEntrypoint } from '@coinbase/onchainkit/wallet';
// import { isWalletASmartWallet } from '@coinbase/onchainkit/wallet';

type PaymasterRequest = {
  method: string;
  params: [UserOperation<'v0.6'>, string, string];
};

/**
 * POST function handles incoming POST requests for sponsoring operations.
 *
 * @param {Request} r - The incoming request object.
 * @returns {Promise<Response>} - The response object containing the result or an error message.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const reqBody: PaymasterRequest = (await req.json()) as PaymasterRequest;
  const { method, params } = reqBody;
  const [userOp] = params;

  const chainId = 8453;

  if (!isBase({ chainId })) {
    console.log('The chainId is not Base.');
    return NextResponse.json({ error: 'Invalid chainId' }, { status: 400 });
  } else {
    console.log('The chainId is Base.');
  }

  try {
    let result;
    // Initial checks and preliminary validation.
    if (method === 'pm_getPaymasterStubData') {
      result = await paymasterClient.getPaymasterStubData({
        userOperation: userOp,
      });
      // Full validation and actual sponsorship data.
    } else if (method === 'pm_getPaymasterData') {
      result = await paymasterClient.getPaymasterData({
        userOperation: userOp,
      });
    } else {
      return NextResponse.json({ error: 'Method not found' }, { status: 404 });
    }
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
