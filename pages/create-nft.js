/* pages/create-nft.js */
import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

import crustAuth from '../scripts/crustAuth';
import crustPinning from '../scripts/crustPinning';
import placeStorageOrder from '../scripts/placeStorageOrder';

import { css } from '@emotion/css'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
// import { url } from 'inspector'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const [fileCid, setFileCid] = useState(null)
  const [fileSize, setFileSize] = useState(null)
  const [coverImageUrl, setCoverImageUrl] = useState(null)
  const router = useRouter()

  async function onChange(e) {
    /* upload image to IPFS */
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const cid = added.cid;
      setFileCid(cid);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function onChangeCoverImage(e) {
    /* upload image to IPFS */
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const cid = added.cid;
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setCoverImageUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function uploadToIPFS() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl || !fileCid) return
    /* first, upload metadata to IPFS */
    const data = JSON.stringify({
      name, description, file: fileUrl, image: coverImageUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after metadata is uploaded to IPFS, return the URL to use it in the transaction */
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function listNFTForSale() {
    const url = await uploadToIPFS()
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* create the NFT */
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    let transaction = await contract.createToken(url, price, { value: listingPrice })
    await transaction.wait()

    router.push('/')
  }

  return (
    <div className={sellPage}>
      <div className={sellPageContainer}>
      To add your Asset fill in the following details
        <p className={titles}>Enter Name of Asset to be Sold:</p>
        <input 
          placeholder="Asset Name"
          className={sellPageInput}
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
          style={{color:'white'}}/>
        <p className={titles}>Enter a short Description of the Asset:</p>
        <textarea
          placeholder="Asset Description"
          className={sellPageInput}
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
          style={{color:'white'}}/>
        <p className={titles}>Enter the Price of the Asset in ETH:</p>
        <input
          placeholder="Asset Price in Eth"
          className={sellPageInput}
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        style={{color:'white'}}/>
        <p className={titles}>Upload Cover Image:</p>
        <input
          type="file"
          name="Asset"
          className={sellPageInput}
          onChange={onChangeCoverImage}
          style={{color: 'white'}}
          />
          {
            coverImageUrl && (<img className={uploadedImg} width="350" src={coverImageUrl} />)
          }
        <p className={titles}>Upload Document:</p>
        <input
          type="file"
          name="Asset"
          className={sellPageInput}
          onChange={onChange}
          style={{color: 'white'}}
          onClick={() => document.getElementById("loading").style.display = "block"}
        />
        <p className={loading} id='loading'>Loading....</p>
        {
          fileUrl && (document.getElementById('loading').innerHTML="")
        }
        <button onClick={listNFTForSale} className={PostDoc}>
          Sell
        </button>
      </div>
    </div>
  )
}
const titles=css`
display: flex;
justify-content:left;
align-items: left;
flex-direction: column;
width: 100%;
color:white;
`
const sellPage = css`
    padding-top:10px;
    display: flex;
    justify-content: left;
    align-items: center;
    width: 100%;
    padding-left:380px;
`
const sellPageContainer = css`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 65%;
    font-size:25px;
    color:white;
    background-color:#1b305c;
    margin: 10px 0px;
    padding: 10px 10px;
    border-radius: 20px;
    padding-bottom: 1px;
    margin-bottom: 1px;
    `
const sellPageInput = css`
    width: 100%;
    margin: 10px 0px;
    padding: 10px 10px;
    border-radius: 10px;
    background-color:#02C4B2;
    color:white;
`
const loading = css`
    display: none;
    color: white;
`
const uploadedImg = css`
    
`
const PostDoc = css`
    margin: 20px 0px;
    padding: 10px 20px;
    border-radius: 5px;
    background-color: #046EFC;
    color:white;
    font-weight: 600;
    transition: all 0.3s ease-in-out;
    :hover {
      border-radius: 15px;
      background-color:#AA6EC8;
    }
`