// components/ListEscrows.tsx
"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import Link from "next/link";

export default function ListEscrows() {
  const publicClient = usePublicClient();
  const [escrows, setEscrows] = useState<string[]>([]);

  useEffect(() => {
    const loadEscrows = async () => {
      if (!publicClient) return;
      try {
        const result = await publicClient.readContract({
          address: deployedContracts[11155111].EscrowFactory.address as `0x${string}`,
          abi: deployedContracts[11155111].EscrowFactory.abi,
          functionName: "getEscrows",
        });
        setEscrows(result as string[]);
      } catch (err) {
        console.error("Failed to fetch escrows:", err);
      }
    };
    loadEscrows();
  }, [publicClient]);

  return (
    <div className="mt-8 w-full max-w-2xl">
      <h2 className="text-2xl font-semibold mb-4">Your Escrows</h2>
      {escrows.length > 0 ? (
        <ul className="space-y-2">
          {escrows.map((escrow, idx) => (
            <li key={idx}>
              <Link href={`/escrow/${escrow}`}>
                <div className="p-3 rounded bg-base-200 hover:bg-base-300 transition cursor-pointer break-all">
                  {escrow}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No escrows found.</p>
      )}
    </div>
  );
}