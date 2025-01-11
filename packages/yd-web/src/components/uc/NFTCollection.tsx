import { truncateText } from "@/utils/shortenAddress"
import { NFT } from "@/types"
type NFTCollectionProps = {
  nfts: NFT[];
};

export default function NFTCollection({ nfts }: NFTCollectionProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">  
  {nfts.map((nft) => (  
    <div   
      key={nft.nftId}   
      className="card bg-base-100 shadow-md group"  
    >  
      <figure className="overflow-hidden">  
        <img   
          src={nft.imageUrl}   
          alt={nft.title}   
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out   
                     group-hover:scale-105 group-hover:brightness-90"   
        />  
      </figure>  
      <div className="card-body text-center">  
        <p className=" text-primary">{truncateText(nft.title, 20)}</p> 
        <p className="text-sm text-gray-400">Minting Time: {nft.nftMintedTimestamp}</p> 
      </div>  
    </div>  
  ))}  
</div>
  );
}