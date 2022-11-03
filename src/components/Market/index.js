import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import debounce from "just-debounce-it";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Skeleton } from "@mui/material";
import { WalletWarning } from "../WalletWarning";
import useNFTStorage from "../../hooks/useNFTStorage";
import { Loader } from "../Loader";
import FavoriteIcon from "@mui/icons-material/Favorite";
import useNearScreen from "../../hooks/useNearScreen";

export default function Market({ account, network, contract, web3 }) {
  const { nftList, getAllNfts, randomPosition } = useNFTStorage();
  const [items, setItems] = useState(20);
  const skeletonList = useMemo(
    () => [...Array(500)].map((x) => randomPosition(3)),
    []
  );
  const screenRef = useRef();
  const { isNearScreen } = useNearScreen({
    externalRef: screenRef,
    once: false,
  });

  console.log(items);

  useEffect(() => {
    if (nftList) {
      setItems(20);
    } else {
      getAllNfts();
    }
  }, [nftList]);

  const debounceHandleLoad = useCallback(
    debounce(() => {
      setItems((prevState) => prevState + 20);
    }, 250),
    []
  );

  useEffect(() => {
    if (isNearScreen) debounceHandleLoad();
  }, [debounceHandleLoad, isNearScreen]);

  return (
    <>
      {account && network && contract && web3 ? (
        <>
          <div className="masonry-container">
            {nftList &&
              nftList.slice(0, items).map((nft, index) => (
                <div className={nft.position} key={index}>
                  <div className="picture">
                    <div className="front">
                      <img
                        src={`https://nftstorage.link/ipfs/${nft.data.image.substring(
                          7,
                          nft.data.image.length
                        )}`}
                        alt=""
                      />
                    </div>
                    <div className="back">
                      <h4>{nft.data.name}</h4>
                      <span>{nft.data.description}</span>
                    </div>
                  </div>
                </div>
              ))}
            {skeletonList &&
              !nftList &&
              skeletonList.slice(0, items).map((position, index) => (
                <div className={position} key={index}>
                  <div className="picture">
                    <div className="front">
                      <Skeleton
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        variant="rectangular"
                      />
                    </div>
                    <div className="back"></div>
                  </div>
                </div>
              ))}
            <div id="final-page" ref={screenRef}></div>
          </div>
        </>
      ) : (
        <WalletWarning />
      )}
    </>
  );
}
