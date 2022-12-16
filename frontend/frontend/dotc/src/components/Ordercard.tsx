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
import {
  ChakraProvider,
  Container,
  Stack,
  Heading,
  Text,
} from "@chakra-ui/react";
import fonts from "./fonts";
import theme from "./theme";

export const Ordercard = ({ order }: any) => {
    const [orderData, setorderData] = useState<any[]>([[]]);
    const [WETHBalance, setWETHBalance] = useState("");
    const [wethSize, setwethSize] = useState("");
    const [usdcPerWETH, setusdcPerWETH] = useState("");
    const [finalusdcPerWETH, setfinalusdcPerWETH] = useState("");
    const [endingBlock, setendingBlock] = useState("");

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
    const provider = new AlchemyProvider(
        "goerli",
        "9jzB567qfCjDccM7S1V2qpmv052YIhv7"
    );
    const LensAddress = "0x78A7D8EA0F1D4A82D44167ACc935094F2e5B0d3A";

    const LensRead = new ethers.Contract(
        LensAddress,
        LensABI,
        provider
    );

    useEffect(() => {
        const init = async () => {
            const ActiveOfferInfo = await LensRead.getOfferInfo(
                order
            );
            setorderData(ActiveOfferInfo)
            setWETHBalance(formatEther(ActiveOfferInfo[0]))
            setwethSize(formatEther(ActiveOfferInfo[1]));
            setusdcPerWETH(formatUnits(ActiveOfferInfo[2], 6));
            setfinalusdcPerWETH(formatUnits(ActiveOfferInfo[3], 6));
            setendingBlock(formatUnits(ActiveOfferInfo[4], 0));
        }
        init();
    }, []);
    


    console.log(orderData)
    console.log(WETHBalance)
    console.log(wethSize)
    console.log(usdcPerWETH)
    console.log(finalusdcPerWETH)
    console.log(endingBlock)
    return (
      <div>
        {orderData ? (
                <Table>
                    <Tr>
            <Td>{Number(WETHBalance).toFixed(2)}</Td>
            <Td>{Number(wethSize).toFixed(4)}</Td>
            <Td>${Number(usdcPerWETH).toFixed(2)}</Td>
            <Td>${Number(finalusdcPerWETH).toFixed(2)}</Td>
                        <Td>{endingBlock}</Td>
                        </Tr>
                    </Table>
          
        ) : (
          <Tr>No NFTs to show</Tr>
        )}
      </div>
    );
};