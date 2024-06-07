import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useAccount } from 'wagmi';
import { useWriteContracts } from 'wagmi/experimental';
import { ContractAlertLayout } from 'app/buy-me-coffee/_components/ContractAlert';
import { usePaymasterBundlerContract } from '../_contracts/usePaymasterBundlerContract';
import { CallStatus } from './CallStatus';

const handleMint = (
  writeContracts: (args: unknown) => void,
  contract: unknown,
  address: unknown,
  capabilities: unknown,
) => {
  console.log('handleMint called with address:', address);
  if (!address) {
    console.error('No account address found');
    return;
  }
  writeContracts({
    contracts: [
      {
        address: contract.address,
        abi: contract.abi,
        functionName: 'safeMint',
        args: [address],
      },
    ],
    capabilities,
  });
};

export default function PaymasterBundlerDemo() {
  const account = useAccount();
  const [callID, setCallID] = useState<string | undefined>(undefined);
  // const { data: availableCapabilities } = useCapabilities({ account: account });
  const { writeContracts } = useWriteContracts({
    mutation: { onSuccess: (id: unknown) => setCallID(id as string) },
  });
  const contract = usePaymasterBundlerContract();
  const [defaultUrl, setDefaultUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    console.log('PaymasterBundlerDemo mounted');
    if (typeof document !== 'undefined') {
      const url = `${document.location.origin}/api/paymaster-proxy`;
      setDefaultUrl(url);
      console.log('defaultUrl set to:', url);
    } else {
      console.error('document is undefined');
    }
  }, []);

  const capabilities = useMemo(
    () => ({
      paymasterService: {
        url: defaultUrl,
      },
    }),
    [defaultUrl],
  );

  if (contract.status !== 'ready') {
    console.error('Contract is not ready', contract);
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
          onClick={
            account.address
              ? () => handleMint(writeContracts, contract, account.address, capabilities)
              : undefined
          }
          disabled={!account.address}
        >
          Mint NFT
        </button>
        {callID && <CallStatus id={callID} />}
      </section>
    </div>
  );
}
