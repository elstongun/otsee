// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.11;

import {IERC20, IWETHToken, IOwnable} from "./Interfaces.sol";

contract LockedWETHOffer {
    address public immutable factory;
    address public immutable seller;
    uint256 public immutable usdcPerWETH;
    uint256 public immutable finalusdcPerWETH;
    uint256 public wethSize;
    uint256 public immutable fee; // in bps
    uint256 public immutable duration;
    uint256 public immutable discountPerBlock;

    bool public hasEnded = false;

    address weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address usdc = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    uint256 public startingBlock;
    uint256 public endingBlock;

    event OfferFunded(address seller, uint256 wethSize, uint256 duration);
    event Filled(address buyer, uint256 WETHAmount, uint256 AmountFilled, bool hasEnded);
    event OfferCanceled(address seller, uint256 WETHAmount);

    constructor(
        address _seller,
        uint256 _usdcPerWETH,
        uint256 _finalusdcPerWETH,
        uint256 _fee,
        uint256 _duration,
        uint256 _wethSize
    ) {
        factory = msg.sender;
        seller = _seller;
        usdcPerWETH = _usdcPerWETH;
        finalusdcPerWETH = _finalusdcPerWETH;
        fee = _fee;
        duration = _duration;
        wethSize = _wethSize;
        discountPerBlock = (usdcPerWETH - finalusdcPerWETH) / duration;
    }

    // release trapped funds
    function withdrawTokens(address token) public {
        require(msg.sender == IOwnable(factory).owner());
        if (token == 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) {
            payable(IOwnable(factory).owner()).transfer(address(this).balance);
        } else {
            uint256 balance = IERC20(token).balanceOf(address(this));
            safeTransfer(token, IOwnable(factory).owner(), balance);
        }
    }

    function fundContract() public {
        require(msg.sender == seller);
        require(IERC20(weth).balanceOf(msg.sender) >= wethSize);
        IERC20(weth).transferFrom(msg.sender, address(this), wethSize);
        //officially begin the countdown
        startingBlock = block.number;
        endingBlock = startingBlock - duration;
        emit OfferFunded(seller, wethSize, duration);
    }

    function fill(uint256 amountOfUSDC) public {
        
        require(hasWETH(), "no WETH balance");
        require(!hasEnded, "sell has been previously cancelled");
        require(block.number >= endingBlock);

        //getting live data
        uint256 currentPricePerWETH = getCurrentPrice();
        uint256 txFee = mulDiv(amountOfUSDC, fee, 10000);
        uint256 amountWantedAfterFee = amountOfUSDC - txFee;
        uint256 wethRequested = (amountOfUSDC / currentPricePerWETH) * 1e18; //scaled to WETH

        if ((wethSize - getCurrentBalance()) == 0) {
            hasEnded = true;
        } else {
            hasEnded = false;
        }

        
        //transfers from the buyer
        IERC20(usdc).transferFrom(msg.sender, IOwnable(factory).owner(), txFee);
        IERC20(usdc).transferFrom(msg.sender, seller, amountWantedAfterFee);

        //transfer to the buyer
        IERC20(weth).transfer(msg.sender, wethRequested);
        emit Filled(msg.sender, wethRequested, amountOfUSDC, hasEnded);
    }

    function cancel() public {
        require(hasWETH(), "no WETH balance");
        require(msg.sender == seller);
        uint256 balance = IERC20(weth).balanceOf(address(this));
        
        IERC20(weth).transfer(msg.sender, balance);
        hasEnded = true;
        emit OfferCanceled(seller, balance);
    }

    function hasWETH() public view returns (bool) {
        return IERC20(weth).balanceOf(address(this)) > 0;
    }

    function mulDiv(
        uint256 x,
        uint256 y,
        uint256 z
    ) public pure returns (uint256) {
        return (x * y) / z;
    }

    function safeTransfer(
        address token,
        address to,
        uint256 value
    ) internal {
        // bytes4(keccak256(bytes('transfer(address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "safeTransfer: failed");
    }

    function safeTransferFrom(
        address token,
        address from,
        address to,
        uint256 value
    ) internal {
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "safeTransferFrom: failed");
    }

    function getCurrentPrice() public view returns (uint256) {
        if (block.number <= endingBlock) {
            uint256 blockDelta = block.number - startingBlock;
            return usdcPerWETH - (blockDelta * discountPerBlock);
        } else {
            return finalusdcPerWETH;
        }
    }

    function getCurrentBalance() public view returns (uint256) {
        return IERC20(weth).balanceOf(address(this));
    }
    function getAmountFilled() public view returns (uint256) {
        return (wethSize - getCurrentBalance());
    }
    function getwethSize() public view returns (uint256) {
        return wethSize;
    }
    function getDuration() public view returns (uint256) {
        return duration;
    }
    function getEndingBlock() public view returns (uint256) {
        return endingBlock;
    }
    function getstartingPrice() public view returns (uint256) {
        return usdcPerWETH;
    }
    function getFinalPrice() public view returns (uint256) {
        return finalusdcPerWETH;
    }
    function getSeller() public view returns (address) {
        return seller;
    }
    function gethasEnded() public view returns (bool) {
        return hasEnded;
    }

}
