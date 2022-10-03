import { useEffect, useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as SPLToken from "@solana/spl-token";


const connection = new Connection("https://ssc-dao.genesysgo.net/");

const GameUserInfo = () => {

  //TO GET THE PUBLIC KEY OF THE CONNECTED WALLET
  const { publicKey } = useWallet();
  // TO SHOW OR HIDE THE AMOUNT BALANCE OF $BOO WHEN USER CONNECT
  const [showBooBalance, setBooBalance] = useState(0);

  useEffect(() => {

    (async () => {
        //IF THERE IS NOT PUBLIC KEY -AKA NO CONNECTED WALLET- STOP THE CODE AN SHOW 0 ON THE SCREEN
        if(!publicKey) {
        setBooBalance(0)
        return;
        }
    
        let response = await connection.getTokenAccountsByOwner(
          publicKey,
          {
            programId: TOKEN_PROGRAM_ID,
          }
        );
        response.value.forEach((e) => {
          //IF PUBKEY STRING EQUAL TO BOO TOKEN ACCOUNT -NOT TOKEN ADDRESS-, RUN AND SHOW
          const accountInfo = SPLToken.AccountLayout.decode(e.account.data);
          if (`${new PublicKey(accountInfo.mint)}` === '2vfgEPJStq761qrkyh8xedrj9zpew1GQ8CobjtQ4wtyM') {
            const booBalance = parseFloat(`${SPLToken.u64.fromBuffer(accountInfo.amount)}`)/1e9;
            setBooBalance(booBalance)
          } 
        })
    })()
    }, [ publicKey]);


  return (
    <>
    <div className="upperleft-menu">
      <div style={{ cursor: 'pointer', imageRendering:'pixelated', width:116, height:104, position: 'absolute', left: -30, top: -54, backgroundSize:532 }} >
       </div>
       <div style={{ cursor: 'pointer', position: 'absolute', right:20, top: 5}}>
        { //IF PUBLIC KEY EXIST, SHOW THE BALANCE
        (publicKey)
          ? <span className="text-3xl" style={{ textShadow: '2px 2px #4c75fb', fontSize:'xx-large'}}>{showBooBalance} BOO!</span>
          : null 
        }
       
       </div>
    </div>
    </>
  );
};
  
  export default GameUserInfo;