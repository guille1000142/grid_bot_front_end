import { useEffect, useState, useRef, useMemo } from "react";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Skeleton } from "@mui/material";
import { Warning } from "../Warning";
import useNFTStorage from "../../hooks/useNFTStorage";
import useNearScreen from "../../hooks/useNearScreen";

export default function Market({ account, contract, web3 }) {
  const {
    nftGlobalList,
    cidsGlobalList,
    getGlobalNfts,
    randomPosition,
    readLimitNFT,
    handleLike,
  } = useNFTStorage(account);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(10);
  const skeletonList = useMemo(
    () => [...Array(10)].map((x) => randomPosition(3)),
    []
  );
  const [change, setChange] = useState(false);
  const screenRef = useRef();
  const { isNearScreen } = useNearScreen({
    externalRef: nftGlobalList.length > 0 ? screenRef : null,
    once: false,
  });

  useEffect(() => {
    getGlobalNfts();
  }, []);

  useEffect(() => {
    if (isNearScreen && nftGlobalList.length === to) {
      setFrom((prevState) => prevState + 10);
      setTo((prevState) => prevState + 10);
    }
  }, [isNearScreen, nftGlobalList, to]);

  useEffect(() => {
    if (
      nftGlobalList.length < to &&
      cidsGlobalList.length > 0 &&
      nftGlobalList.length < cidsGlobalList.length
    ) {
      readLimitNFT({
        cids: cidsGlobalList,
        from,
        to: cidsGlobalList.length > to ? to : cidsGlobalList.length,
        actualData: nftGlobalList,
        account,
      });
    }
  }, [nftGlobalList, from, to, cidsGlobalList]);

  const SkeletonImage = ({ limit }) => {
    return skeletonList.slice(0, limit).map((position, index) => (
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
    ));
  };

  const handleShare = async (nft) => {
    const response = await fetch(
      `https://${nft.image}.ipfs.nftstorage.link/nft-image.avif`
    );
    const blob = await response.blob();
    const filesArray = [
      new File([blob], "meme.jpg", {
        type: "image/jpeg",
        lastModified: new Date().getTime(),
      }),
    ];
    const share = {
      files: filesArray,
      title: `${nft.name} - NFT GRID BOT`,
      text: `${nft.descripion}.\n${nft.likes} likes.\nhttp://localhost:3000/`,
    };
    if (!navigator.canShare) {
      console.log("share not supported");
      return false;
    } else if (navigator.canShare(share)) {
      navigator.share(share);
      return true;
    } else {
      console.log("invalid share data");
      return false;
    }
  };

  return (
    <>
      {account && contract && web3 ? (
        <>
          <div className="masonry-container">
            {nftGlobalList.length > 0 &&
              nftGlobalList.map((nft, index) => (
                <div
                  className={nft.position}
                  key={index}
                  onClick={() => handleShare(nft)}
                >
                  <div className="picture">
                    <div className="front">
                      <img
                        src={`https://${nft.image}.ipfs.nftstorage.link/nft-image.avif`}
                        alt=""
                      />
                    </div>
                    <div className="back">
                      <h4>{nft.name}</h4>
                      <span>{nft.description}</span>
                      <div className="likes">
                        <div
                          className="heart"
                          onClick={() =>
                            handleLike(nft, change, setChange, index)
                          }
                        >
                          {nft.isWallet ? (
                            <FavoriteIcon />
                          ) : (
                            <FavoriteBorderIcon />
                          )}
                        </div>
                        <div>{nft.likes}</div>
                      </div>
                    </div>
                  </div>
                  <div id="final-page" ref={screenRef}></div>
                </div>
              ))}
            {skeletonList && nftGlobalList.length === 0 && (
              <SkeletonImage limit={6} />
            )}
            {skeletonList &&
              nftGlobalList.length !== cidsGlobalList.length &&
              nftGlobalList.length < to &&
              nftGlobalList.length !== 0 && <SkeletonImage limit={6} />}
          </div>
        </>
      ) : (
        <Warning label={"CONNECT WALLET"} />
      )}
    </>
  );
}
