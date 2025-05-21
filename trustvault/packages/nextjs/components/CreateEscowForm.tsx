// components/CreateEscrowForm.tsx
"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useWalletClient, usePublicClient } from "wagmi";
import { InputField } from "~~/components/InputField";

export default function CreateEscrowForm() {
  const [arbiter, setArbiter] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("86400"); // Default: 1 day in seconds
  const [loading, setLoading] = useState(false);

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const escrowFactory = require("../contracts/deployedContracts").sepolia.EscrowFactory;

  const handleCreate = async () => {
    if (!walletClient || !publicClient) return;
    setLoading(true);
    try {
      const txHash = await walletClient.writeContract({
        address: escrowFactory.address,
        abi: escrowFactory.abi,
        functionName: "createEscrow",
        args: [beneficiary, duration],
        value: parseEther(amount),
      });

      await publicClient.waitForTransactionReceipt({ hash: txHash });
      alert("✅ Escrow created!");
      setArbiter("");
      setBeneficiary("");
      setAmount("");
    } catch (err) {
      console.error(err);
      alert("❌ Error creating escrow.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-4 p-6 bg-base-200 rounded-box">
      <h2 className="text-xl font-semibold">Create New Escrow</h2>
      <InputField label="Beneficiary" value={beneficiary} onChange={setBeneficiary} placeholder="0x..." />
      <InputField label="Deposit Amount (ETH)" value={amount} onChange={setAmount} placeholder="e.g., 0.1" />
      <InputField label="Duration (seconds)" value={duration} onChange={setDuration} placeholder="e.g., 86400" />
      <button className="btn btn-primary w-full" onClick={handleCreate} disabled={loading}>
        {loading ? "Creating..." : "Create Escrow"}
      </button>
    </div>
  );
}