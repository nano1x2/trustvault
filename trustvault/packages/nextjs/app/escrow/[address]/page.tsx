// app/escrow/[address]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { parseEther } from "viem";
import { formatUnits } from "viem";

export default function EscrowDetailPage() {
  const { address } = useParams<{ address: string }>();
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [payer, setPayer] = useState<string | null>(null);
  const [payee, setPayee] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [state, setState] = useState<number | null>(null);
  const [expiration, setExpiration] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load escrow data
  useEffect(() => {
    const loadEscrowData = async () => {
      if (!publicClient) return;
      try {
        const abi = require("~~/contracts/abi/Escrow").default;

        const [payerData, payeeData, amountData, expirationData, stateData] =
          await Promise.all([
            publicClient.readContract({
              address: address as `0x${string}`,
              abi,
              functionName: "payer",
              args: []
            }),
            publicClient.readContract({
              address: address as `0x${string}`,
              abi,
              functionName: "payee",
              args: []
            }),
            publicClient.readContract({
              address: address as `0x${string}`,
              abi,
              functionName: "amount",
              args: []
            }),
            publicClient.readContract({
              address: address as `0x${string}`,
              abi,
              functionName: "expiration",
              args: []
            }),
            publicClient.readContract({
              address: address as `0x${string}`,
              abi,
              functionName: "state",
              args: []
            }),
          ]);

        setPayer(payerData as string);
        setPayee(payeeData as string);
        setAmount(formatUnits(amountData as bigint, 18));
        setExpiration(Number(expirationData));
        setState(Number(stateData));
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading escrow data:", err);
        setIsLoading(false);
      }
    };

    loadEscrowData();
  }, [address, publicClient]);

  // Handle fund release
  const handleRelease = async () => {
    if (!walletClient || !publicClient) return;
    try {
      const txHash = await walletClient.writeContract({
        address: address as `0x${string}`,
        abi: require("~~/contracts/abi/Escrow").default,
        functionName: "release",
        account: walletClient.account,
        args: []
      });

      await publicClient.waitForTransactionReceipt({ hash: txHash });
      alert("✅ Funds released!");
    } catch (err) {
      console.error("Release failed:", err);
      alert("❌ Failed to release funds.");
    }
  };

  // Handle refund
  const handleRefund = async () => {
    if (!walletClient || !publicClient) return;
    try {
      const txHash = await walletClient.writeContract({
        address: address as `0x${string}`,
        abi: require("@/contracts/abi/Escrow").default,
        functionName: "refund",
        account: walletClient.account,
        args: []
      });

      await publicClient.waitForTransactionReceipt({ hash: txHash });
      alert("✅ Refunded!");
    } catch (err) {
      console.error("Refund failed:", err);
      alert("❌ Failed to refund.");
    }
  };

  const getStatusLabel = () => {
    if (state === 0) return "Created";
    if (state === 1) return "Funded";
    if (state === 2) return "Released";
    if (state === 3) return "Refunded";
    return "Unknown";
  };

  if (isLoading) return <p>Loading escrow details...</p>;

  return (
    <main className="flex flex-col items-center p-8 gap-6">
      <h1 className="text-3xl font-bold">Escrow Details</h1>

      <div className="card bg-base-200 p-6 w-full max-w-md text-center shadow-lg">
        <p className="mb-2">
          Status: <strong>{getStatusLabel()}</strong>
        </p>
        <p className="mb-2">Payer: {payer}</p>
        <p className="mb-2">Payee: {payee}</p>
        <p className="mb-2">
          Amount: {amount} ETH
        </p>
        <p className="mb-4">
          Expires:{" "}
          {new Date(Number(expiration) * 1000).toLocaleString()}
        </p>

        {state === 1 && userAddress?.toLowerCase() === payer?.toLowerCase() && (
          <>
            <button
              className="btn btn-success mr-2"
              onClick={handleRelease}
            >
              Release Funds
            </button>
            {expiration && Date.now() / 1000 > expiration && (
              <button
                className="btn btn-warning"
                onClick={handleRefund}
              >
                Refund (Expired)
              </button>
            )}
          </>
        )}

        {userAddress?.toLowerCase() !== payer?.toLowerCase() && (
          <p className="text-sm text-gray-500 mt-4">
            You are not the payer for this escrow.
          </p>
        )}
      </div>
    </main>
  );
}