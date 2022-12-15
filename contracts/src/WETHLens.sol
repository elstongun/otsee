// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.11;

import {IERC20, ILockedWETHOffer, IWETHToken, IOfferFactory, IOwnable} from "./Interfaces.sol";

contract WETHLens {
    // supported stablecoins
    address weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address usdc = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

      function getVolume(IOfferFactory factory) public view returns (uint256 sum) {
        address[1] memory stables = [usdc];
        address factoryOwner = IOwnable(address(factory)).owner();

        uint256 volume;
        for (uint256 i; i < stables.length; i++) {
            volume += IERC20(stables[i]).balanceOf(factoryOwner) * (10**(18 - IERC20(stables[i]).decimals()));
        }
        sum = volume * 333;
    }

    function getOfferInfo(ILockedWETHOffer offer)
        public
        view
        returns (
            uint256 WETHBalance,
            uint256 wethSize,
            uint256 usdcPerWETH,
            uint256 finalusdcPerWETH,
            uint256 endingBlock
        )
    {
        return (IERC20(weth).balanceOf(address(offer)), offer.wethSize(), offer.usdcPerWETH(), offer.finalusdcPerWETH(), offer.endingBlock());
    }
        
    function getActiveOffersPruned(IOfferFactory factory) public view returns (ILockedWETHOffer[] memory) {
        ILockedWETHOffer[] memory activeOffers = factory.getActiveOffers();
        // determine size of memory array
        uint count;
        for (uint i; i < activeOffers.length; i++) {
            if (address(activeOffers[i]) != address(0)) {
                count++;
            }
        }
        ILockedWETHOffer[] memory pruned = new ILockedWETHOffer[](count);
        for (uint j; j < count; j++) {
            pruned[j] = activeOffers[j];
        }
        return pruned;
    }

    function getAllActiveOfferInfo(IOfferFactory factory)
        public
        view
        returns (
            address[] memory offerAddresses,
            uint256[] memory WETHBalances,
            uint256[] memory wethSizes,
            uint256[] memory usdcPerWETHs,
            uint256[] memory finalusdcPerWETHs,
            uint256[] memory endingBlocks
        )
    {
        ILockedWETHOffer[] memory activeOffers = factory.getActiveOffers();
        uint256 offersLength = activeOffers.length;
        offerAddresses = new address[](offersLength);
        WETHBalances = new uint256[](offersLength);
        wethSizes = new uint256[](offersLength);
        usdcPerWETHs = new uint256[](offersLength);
        finalusdcPerWETHs = new uint256[](offersLength);
        endingBlocks = new uint256[](offersLength);

        uint256 count;
        for (uint256 i; i < activeOffers.length; i++) {
            uint256 bal = IERC20(weth).balanceOf(address(activeOffers[i]));
            if (bal > 0) {
                offerAddresses[count] = address(activeOffers[i]);
                WETHBalances[count] = bal;
                wethSizes[count] = activeOffers[i].wethSize();
                usdcPerWETHs[count] = activeOffers[i].usdcPerWETH();
                finalusdcPerWETHs[count] = activeOffers[i].finalusdcPerWETH();
                endingBlocks[count] = activeOffers[i].endingBlock();
                count++;
            }
        }
    }
}