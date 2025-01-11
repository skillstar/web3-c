import {
  useAccount,
  useWriteContract,
  useBalance,
  useSimulateContract,
} from "wagmi";
const tokenAddress = "0xf3e8A51975180e3223e976569cbD222661756715";
import tokenABI from "../abi/MetaCoin.json";

export const TokenButton = () => {
  const { address: useAddress } = useAccount();
  const { data: tokenBlance } = useBalance({
    address: useAddress,
    token: tokenAddress,
  });
  const { data: contractData, isLoading } = useSimulateContract({
    address: tokenAddress,
    abi: tokenABI.abi,
    functionName: "mint",
    args: [
      "0x9629A0B683A6F66F979655F33788D7D63cF530E3",
      "233000000000000000000",
    ],
  });

  const { data: hash, isSuccess, writeContract } = useWriteContract();
  const mintFun = async () => {
    if (useAddress) {
      await writeContract(contractData!.request);
    }
    if (isSuccess) {
      console.log("Mint Successful");
    }
  };

  return (
    <section className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-medium text-gray-700 mb-4">Mint Tokens</h2>
      <p className="text-sm text-gray-600">
        Token Balance: {tokenBlance?.formatted} {tokenBlance?.symbol}
      </p>
      <button
        onClick={mintFun}
        className="mt-4 px-6 py-2 bg-yellow-600 text-white rounded-lg shadow-md hover:bg-yellow-700"
      >
        Mint Token
      </button>
      {hash && (
        <p className="mt-2 text-sm text-gray-600">Transaction Hash: {hash}</p>
      )}
    </section>
  );
};
