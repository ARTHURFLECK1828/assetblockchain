import { useState } from 'react'
import { css } from '@emotion/css'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import '../styles/globals.css';
import '../styles/header.css';
import Link from 'next/link';
import Image from 'next/image'

function MyApp({ Component, pageProps }) {
  /* create local state to save account information after signin */
  const [account, setAccount] = useState(null)
  /* web3Modal configuration for enabling wallet access */
  async function getWeb3Modal() {
    const web3Modal = new Web3Modal({
      cacheProvider: false,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: "your-infura-id"
          },
        },
      },
    })
    return web3Modal
  }

  async function connect() {
    try {
      const web3Modal = await getWeb3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const accounts = await provider.listAccounts()
      setAccount(accounts[0])
    } catch (err) {
      console.log('error:', err)
    }
  }

  return (
    <div>
      <nav className="header">
        <div className='header-container-1'>
          <Image className="header-logo" width={40} height={40} src={require('./assets/logo.png')} />
          <h1>Mongrove</h1>
          <div className={Search}>
          <input
          value={""}
          onChange={event => refine(event.currentTarget.value)}
          placeholder="Search for Assets"
          style={{ height:'40px',width:'1050px',borderRadius:"10px",backgroundColor:"//#endregion1B305C",padding:"10px"}}
          title='Search bar'
        />
        </div>
          {
            !account && (
              <div className={buttonContainer}>
                <button className={buttonStyle} onClick={connect}>Connect</button>
              </div>
            )
          }

          {account &&
            <p className={accountInfo}>Your Wallet Address: {account}</p>
          }
        </div>

        {account &&
          <>
            <div className="header-container-2">
              <div>
                <Link href="/">
                  <a className="header-navlinks">
                    Home
                  </a>
                </Link>
                <Link href="/create-nft">
                  <a className="header-navlinks">
                    Sell Assets
                  </a>
                </Link>

                <Link href="/my-nfts">
                  <a className="header-navlinks">
                    My Assets
                  </a>
                </Link>
                <Link href="/dashboard">
                  <a className="header-navlinks">
                    Loans
                  </a>
                </Link>
              </div>
            </div>
          </>
        }
      </nav>
      <Component {...pageProps} />
    </div>
  )
}
const Search = css`
  width: 100%;
  display: flex;
  flex: 1;
  justify-content: flex-start;
  padding-left:100px;
  font-size: 15px;
  color:  #00C3B3;
`
const accountInfo = css`
  width: 100%;
  display: flex;
  flex: 1;
  justify-content: flex-end;
  font-size: 15px;
  color:  #00C3B3;
`

const buttonContainer = css`
  // width: 100%;
  display: flex;
  flex: 1;
  justify-content: flex-end;
`
const buttonStyle = css`
  background-color:#46BD9D;
  color: black;
  outline: none;
  border: none;
  border: 2px solid green;
  font-size: 15px;
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
  &:hover {
    background-color:#2D81FF;
    color:white;
    transform:scale(1.5);
    transition-duration: 0.5s;

  }
`

export default MyApp