import { useSendTransaction } from "wagmi";
import { parseEther } from "viem";

export const SentETHButton = () => {
  const { data: hash, isPending, sendTransaction } = useSendTransaction();
  return (
    <section className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-medium text-gray-700 mb-4">Send ETH</h2>
      <button
        onClick={() =>
          sendTransaction({
            to: "0x9629A0B683A6F66F979655F33788D7D63cF530E3",
            value: parseEther("0.001"),
          })
        }
        className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700"
      >
        Send 0.001 ETH
      </button>
      {hash && (
        <p className="mt-2 text-sm text-gray-600">Transaction Hash: {hash}</p>
      )}
    </section>
  );
};
