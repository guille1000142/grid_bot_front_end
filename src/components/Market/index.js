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
  } = useNFTStorage();
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

  const handleLike = (nft, index) => {
    const api = `${process.env.REACT_APP_API_URL}/api/v1/nft/create`;
    const newNftData = {
      cid: nft.cid,
      name: nft.name,
      description: nft.description,
      image: nft.image,
      position: nft.position,
      createdAt: nft.createdAt,
      likes: nft.isWallet ? nft.likes - 1 : nft.likes + 1,
      isWallet: nft.isWallet ? false : true,
    };

    return fetch(`${api}?cid=${nft.cid}&wallet=${account}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        nftGlobalList.splice(index, 1, newNftData);
        setChange(!change);
        return res;
      })
      .catch((err) => {
        return err;
      });
  };

  return (
    <>
      {account && contract && web3 ? (
        <>
          <div className="masonry-container">
            {nftGlobalList.length > 0 &&
              nftGlobalList.map((nft, index) => (
                <div className={nft.position} key={index}>
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
                          onClick={() => handleLike(nft, index)}
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
