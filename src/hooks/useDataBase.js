import IPFS from "ipfs";
import OrbitDB from "orbit-bd";
import { useEffect } from "react";

export default function useDataBase() {
  useEffect(() => {
    startServer();
  }, []);

  const startServer = async () => {
    // create ipfs
    const ipfs = await IPFS.create();

    //create orbit with ipfs
    const orbitdb = await OrbitDB.createInstance(ipfs);

    // create database
    const db = await orbitdb.log("hello");

    // open database
    await db.load();

    // listen updates
    db.events.on("replicated", (address) => {
      console.log(db.iterator({ limit: -1 }).collect());
    });

    // Add an entry
    const hash = await db.add("world");
    console.log(hash);

    // Query
    const result = db.iterator({ limit: -1 }).collect();
    console.log(JSON.stringify(result, null, 2));
  };
}
