"use client";
import { Address } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useSwitchChain,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import { SentETHButton } from "@/app/components/SentETH";
import { TokenButton } from "@/app/components/MintToken";
import Header from "@/app/components/header";
import CourseList from "@/components/CourseList";
import Footer from "@/app/components/Footer";

function App() {
  const account = useAccount();
  const [userAddress, setUserAddress] = useState("");
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { chains, switchChain } = useSwitchChain();
  const { data: userBalance } = useBalance({
    address: userAddress as Address,
  });

  useEffect(() => {
    if (account && account.address) {
      setUserAddress(account.address);
    } else {
      setUserAddress("");
    }
  }, [account]);

  return (
    <div className="min-h-screen bg-dark-light text-gray-900 p-6">
      <Header />
      <main className="max-w-4xl mx-auto mt-14">
        <section>
          <CourseList></CourseList>
        </section>
        {/* Account Details Section */}
        <section className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-medium text-gray-700 mb-4">
            Account Details
          </h2>
          <div className="text-sm space-y-2 text-gray-600">
            <p>Status: {account.status}</p>
            <p>Address: {JSON.stringify(account.addresses)}</p>
            <p>Chain ID: {account.chainId}</p>
            <p>
              Balance: {userBalance?.formatted} {userBalance?.symbol}
            </p>
          </div>
          {account.status === "connected" && (
            <button
              onClick={() => disconnect()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
            >
              Disconnect
            </button>
          )}
        </section>
        {/* Connect Wallet Section */}
        <section className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-medium text-gray-700 mb-4">
            Connect Wallet
          </h2>
          <ConnectButton />
          <div className="grid grid-cols-2 gap-4 mt-4">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
              >
                {connector.name}
              </button>
            ))}
          </div>
          <p className="mt-2 text-red-500">{error?.message}</p>
        </section>
        {/* Switch Chain Section */}
        <section className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-medium text-gray-700 mb-4">
            Switch Chain
          </h2>
          <div className="flex flex-wrap gap-3">
            {chains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => switchChain({ chainId: chain.id })}
                className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
              >
                {chain.name}
              </button>
            ))}
          </div>
        </section>
        {/* Send ETH Section */}
        <SentETHButton />
        {/* Mint Token Section */}
        <TokenButton />
      </main>
      <Footer />
    </div>
  );
}

export default App;
