import { AlchemyProvider } from "@ethersproject/providers";
import { BigNumber, ethers } from "ethers";
import {
  formatEther,
  formatUnits,
  parseUnits,
  parseEther,
} from "@ethersproject/units";
import {
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
} from '@chakra-ui/react'
import { Chain, configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import "../abi/LockedWETHOffer.json";
import "../abi/ERC20.json"
import "../abi/OfferFactory.json"
import React, { Component, useEffect, useState } from "react";
import { Goerli } from "@usedapp/core";
import { interactivity, Link, Table, Tbody, Td, Tr } from "@chakra-ui/react";
import { url } from "inspector";
import { Ordercard } from "./Ordercard";
import { Ordertable } from "./OrderTable";

export function Listings() {
  const provider = new AlchemyProvider(
    "goerli",
    "9jzB567qfCjDccM7S1V2qpmv052YIhv7"
  );
    const FactoryAddress = "0x43bd1F4593ED15b3ca1D8d2dA981b89eDADAAB70";
    const LensAddress = "0x78A7D8EA0F1D4A82D44167ACc935094F2e5B0d3A";
    const LensABI = [
      {
        inputs: [
          {
            internalType: "contract IOfferFactory",
            name: "factory",
            type: "address",
          },
        ],
        name: "getActiveOffersPruned",
        outputs: [
          {
            internalType: "contract ILockedWETHOffer[]",
            name: "",
            type: "address[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "contract IOfferFactory",
            name: "factory",
            type: "address",
          },
        ],
        name: "getAllActiveOfferInfo",
        outputs: [
          {
            internalType: "address[]",
            name: "offerAddresses",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "WETHBalances",
            type: "uint256[]",
          },
          {
            internalType: "uint256[]",
            name: "wethSizes",
            type: "uint256[]",
          },
          {
            internalType: "uint256[]",
            name: "usdcPerWETHs",
            type: "uint256[]",
          },
          {
            internalType: "uint256[]",
            name: "finalusdcPerWETHs",
            type: "uint256[]",
          },
          {
            internalType: "uint256[]",
            name: "endingBlocks",
            type: "uint256[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "contract ILockedWETHOffer",
            name: "offer",
            type: "address",
          },
        ],
        name: "getOfferInfo",
        outputs: [
          {
            internalType: "uint256",
            name: "WETHBalance",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "wethSize",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "usdcPerWETH",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "finalusdcPerWETH",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endingBlock",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "contract IOfferFactory",
            name: "factory",
            type: "address",
          },
        ],
        name: "getVolume",
        outputs: [
          {
            internalType: "uint256",
            name: "sum",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ];
    const listingABI = [
      {
        inputs: [
          {
            internalType: "address",
            name: "_seller",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "_usdcPerWETH",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_finalusdcPerWETH",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_fee",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_duration",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_wethSize",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "buyer",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "WETHAmount",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "AmountFilled",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "bool",
            name: "hasEnded",
            type: "bool",
          },
        ],
        name: "Filled",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "seller",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "WETHAmount",
            type: "uint256",
          },
        ],
        name: "OfferCanceled",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "seller",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "wethSize",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "duration",
            type: "uint256",
          },
        ],
        name: "OfferFunded",
        type: "event",
      },
      {
        inputs: [],
        name: "cancel",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "duration",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "endingBlock",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "factory",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "fee",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amountOfUSDC",
            type: "uint256",
          },
        ],
        name: "fill",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "finalusdcPerWETH",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "fundContract",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "getAmountFilled",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getCurrentBalance",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getCurrentPrice",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getDuration",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getEndingBlock",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getFinalPrice",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getSeller",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getstartingPrice",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getwethSize",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "hasEnded",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "hasWETH",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "x",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "y",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "z",
            type: "uint256",
          },
        ],
        name: "mulDiv",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "pure",
        type: "function",
      },
      {
        inputs: [],
        name: "seller",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "startingBlock",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "usdcPerWETH",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "wethSize",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
        ],
        name: "withdrawTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];
    const LensContract = new ethers.Contract(
        LensAddress,
        LensABI,
      provider
    );
  const [allOffers, setallOffers] = useState<any[]>([]);


  
  useEffect(() => {
    const allOffers = LensContract.getActiveOffersPruned(
      FactoryAddress
    ).then((listingData: React.SetStateAction<any[]>) =>
      setallOffers(listingData)
    );
  }, []);
  
  
  console.log(allOffers)

  return (
    <div>
      <Table>
        <Tbody>
          <Tr>
            <Td>Balance</Td>
            {/* fourth cell for each reg table row */}
            <Td>Size</Td>
            <Td>Price</Td>
            <Td>EndingPrice:</Td>
            <Td>Blocks Left</Td>
          </Tr>
        </Tbody>
      </Table>
      {allOffers ? (
        <Ordertable allOffers={allOffers} />
      ) : (
        <Td>No NFTs to show</Td>
      )}
    </div>
  );
}
