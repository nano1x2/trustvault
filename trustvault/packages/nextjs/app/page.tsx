// app/page.tsx
"use client";

import { useAccount } from "wagmi";
import CreateEscrowForm from "~~/components/CreateEscowForm";
import ListEscrows from "~~/components/ListEscrows";

export default function Home() {
  const { address } = useAccount();

  return (
    <main className="flex flex-col items-center p-8 gap-8">
      <h1 className="text-4xl font-bold text-center">🤝 TrustVault</h1>
      {address ? (
        <>
          <CreateEscrowForm />
          <ListEscrows />
        </>
      ) : (
        <p>Please connect your wallet to get started.</p>
      )}
    </main>
  );
}