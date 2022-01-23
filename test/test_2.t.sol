// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.11;

import {DSTest} from "../../lib/ds-test/src/test.sol";

import {IERC20, IWETHToken} from "../interfaces/Interfaces.sol";
import {OfferFactory} from "../OfferFactory.sol";
import {LockedWETHOffer} from "../LockedWETHOffer.sol";

import {FactoryDeployer} from "./user/FactoryDeployer.sol";
import {Trader} from "./user/Trader.sol";
import {Vm} from "./util/Vm.sol";

contract LockedWETHOfferTest is DSTest {
    OfferFactory factory;

    FactoryDeployer factoryDeployer;
    Trader trader;

    Vm constant VM = Vm(HEVM_ADDRESS);

    address public constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    IWETHToken WETH = IWETHToken(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    function setUp() public {
        factoryDeployer = new FactoryDeployer();
        trader = new Trader();

        factory = factoryDeployer.factory();

        // give us 100k locked WETH to work with
        VM.store(address(WETH), keccak256(abi.encode(address(this), 15)), bytes32(uint256(100_000 * 1e18)));

        // fund the offer user with 1m usdc
        VM.store(address(USDC), keccak256(abi.encode(address(trader), 0)), bytes32(uint256(1_000_000 * 1e6)));
    }

    function testFailFillNoApproval() public {
        LockedWETHOffer offer = factory.createOffer(USDC, 5 * 1e6);

        // fund the contract
        WETH.transferAll(address(offer));

        trader.fillOffer(offer);
    }

    function testFailFillCantAfford() public {
        LockedWETHOffer offer = factory.createOffer(USDC, 11 * 1e6);

        // fund the contract
        WETH.transferAll(address(offer));

        // would cost 1.1m USDC but we only have 1.0m
        trader.fillOffer(offer);
    }

    function testFill() public {
        LockedWETHOffer offer = factory.createOffer(USDC, 5 * 1e6);

        // fund the contract
        WETH.transferAll(address(offer));
        // approve USDC spending
        trader.approve(USDC, address(offer));

        uint256 prevBal = WETH.totalBalanceOf(address(offer));

        trader.fillOffer(offer);

        uint256 txFee = (5 * 1e6 * offer.fee()) / 10_000;
        uint256 maxFee = 25_000 * 1e6;
        txFee = txFee > maxFee ? maxFee : txFee;

        // buyer gets WETH
        assertEq(WETH.totalBalanceOf(address(trader)), prevBal);
        // trader gets USDC
        assertEq(IERC20(USDC).balanceOf(address(this)), 5 * 1e6 - txFee);
        // factory deployer gets fee
        assertEq(IERC20(USDC).balanceOf(address(factoryDeployer)), txFee);
    }

    function testWithdraw() public {
        LockedWETHOffer offer = factory.createOffer(USDC, 5 * 1e6);

        trader.approve(USDC, address(this));
        // transfer 1000 USDC to offer
        IERC20(USDC).transferFrom(address(trader), address(offer), 1000 * 1e6);

        // withdraw the lost USDC to the deployer
        factoryDeployer.withdraw(offer, USDC);

        assertEq(IERC20(USDC).balanceOf(address(factoryDeployer)), 1000 * 1e6);
    }

    function testFailCancel() public {
        LockedWETHOffer offer = factory.createOffer(USDC, 5 * 1e6);
        offer.cancel();
    }

    function testCancel() public {
        LockedWETHOffer offer = factory.createOffer(USDC, 5 * 1e6);

        uint256 preBal = WETH.totalBalanceOf(address(this));
        // transfer all of our locked WETH
        WETH.transferAll(address(offer));
        // sanity check
        assertEq(WETH.totalBalanceOf(address(this)), 0);
        // get our locked WETH back by cancelling
        offer.cancel();

        assertEq(preBal, WETH.totalBalanceOf(address(this)));
    }
}