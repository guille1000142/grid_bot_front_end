import { useEffect } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Loader } from "../Loader";
import { WalletWarning } from "../WalletWarning";
import useNFTStorage from "../../hooks/useNFTStorage";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

export default function Market({ account, network, contract, web3 }) {
  const { nftList, getAllNfts } = useNFTStorage();

  useEffect(() => {
    if (account && network && contract && web3) {
      getAllNfts({ account, network, contract, web3 });
    }
  }, [account, network, contract, web3]);

  return (
    <>
      {account && network && contract && web3 ? (
        <>
          <div className="masonry">
            <ResponsiveMasonry
              columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
            >
              <Masonry gutter={40}>
                {nftList ? (
                  nftList.map((data, index) => (
                    <div className="flip-container">
                      <div class="card">
                        <img
                          className="front"
                          key={index}
                          src={`https://nftstorage.link/ipfs/${data.image.substring(
                            7,
                            data.image.length
                          )}`}
                          alt=""
                        />
                        <div className="back">
                          <span>{data.name}</span>
                          <small>{data.description}</small>
                          <span>
                            <FavoriteBorderIcon />
                            <FavoriteIcon />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <Loader />
                )}
              </Masonry>
            </ResponsiveMasonry>
          </div>
        </>
      ) : (
        <WalletWarning />
      )}
    </>
  );
}
