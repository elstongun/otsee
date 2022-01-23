// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.11;

import {DSTest} from "../../lib/ds-test/src/test.sol";

import {OfferFactory} from "../OfferFactory.sol";
import {LockedWETHOffer} from "../LockedWETHOffer.sol";

contract OfferFactoryTest is DSTest {
    OfferFactory factory;

    address public USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    function setUp() public {
        factory = new OfferFactory();
    }

    function testSetFee() public {
        assertEq(factory.fee(), 250);
        factory.setFee(350);
        assertEq(factory.fee(), 350);
    }

    function testSetFeeDoesntPropagate() public {
        LockedWETHOffer offer = factory.createOffer(USDC, 1000);

        uint256 oldFee = offer.fee();
        factory.setFee(oldFee + 100);
        assertEq(oldFee, offer.fee());
        assertTrue(oldFee != factory.fee());
    }

    function testCreateOffer() public {
        LockedWETHOffer offer = factory.createOffer(USDC, 10);

        assertEq(address(factory.offers(0)), address(offer));
        assertEq(offer.factory(), address(factory));
        assertEq(offer.seller(), address(this));
        assertEq(offer.tokenWanted(), USDC);
        assertEq(offer.amountWanted(), 10);
    }
    function testActiveOffers() public {
        
    }
}