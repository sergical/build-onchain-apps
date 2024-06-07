import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import { useAccount } from 'wagmi';
import { useWriteContracts, useCapabilities } from 'wagmi/experimental';
import { ContractAlertLayout } from 'app/buy-me-coffee/_components/ContractAlert';
import { usePaymasterBundlerContract } from '../_contracts/usePaymasterBundlerContract';
import { CallStatus } from './CallStatus';

export default function PaymasterBundlerDemo() {
  const account = useAccount();
  const [callID, setCallID] = useState<string | undefined>(undefined);
  const { writeContracts } = useWriteContracts({
    mutation: { onSuccess: (id) => setCallID(id) },
  });
  const { data: availableCapabilities } = useCapabilities({ account: account.address });
  const contract = usePaymasterBundlerContract();

  const capabilities = useMemo(() => {
    if (!availableCapabilities || !account.chainId) return;
    const capabilitiesForChain = availableCapabilities[account.chainId];
    if (capabilitiesForChain?.paymasterService?.supported) {
      return {
        paymasterService: {
          url: `${document.location.origin}/api/paymaster-proxy`,
        },
      };
    }
  }, [availableCapabilities, account.chainId]);

  if (contract.status !== 'ready') {
    console.error('Contract is not ready');
    return null;
  }

  return (
    <div className={clsx('flex w-full flex-col items-center justify-center text-white')}>
      <section className={clsx('mb-5 w-full max-w-3xl rounded-lg bg-gray-900 p-6 shadow-md')}>
        <header>
          <h2 className={clsx('border-b-2 border-gray-700 pb-2 text-xl font-semibold')}>
            Account Details
          </h2>
        </header>
        {account.address && (
          <div className={clsx('mt-2 text-lg')}>
            <strong>Smart Wallet Address:</strong> {account.address}
          </div>
        )}
      </section>
      <section className={clsx('w-full max-w-3xl rounded-lg bg-gray-900 p-6 shadow-md')}>
        <header>
          <h1 className={clsx('border-b-2 border-gray-700 pb-2 text-center text-2xl font-bold')}>
            Mint NFTs with Coinbase Paymaster
          </h1>
        </header>
        {!account.address && (
          <ContractAlertLayout>Please connect your wallet to continue.</ContractAlertLayout>
        )}
        <button
          type="button"
          className={clsx(
            'mt-4 block w-full rounded-full py-3.5 text-lg font-bold text-white transition duration-300',
            account.address
              ? 'cursor-pointer bg-blue-600 hover:bg-blue-700'
              : 'cursor-not-allowed bg-gray-600',
          )}
          onClick={() => {
            if (account.address) {
              writeContracts({
                contracts: [
                  {
                    address: contract.address,
                    abi: contract.abi,
                    functionName: 'safeMint',
                    args: [account.address],
                  },
                ],
                capabilities,
              });
            }
          }}
          disabled={!account.address}
        >
          Mint NFT
        </button>
        {callID && <CallStatus id={callID} />}
      </section>
    </div>
  );
}
