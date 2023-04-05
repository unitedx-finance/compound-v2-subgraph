/* eslint-disable prefer-const */ // to satisfy AS compiler

import {
  MarketEntered,
  MarketExited,
  NewCloseFactor,
  NewCollateralFactor,
  NewLiquidationIncentive,
  NewPriceOracle,
} from '../types/comptroller/Comptroller'
import { log } from '@graphprotocol/graph-ts/index'

import { Market, Comptroller } from '../types/schema'
import { mantissaFactorBD, updateCommonCTokenStats } from './helpers'

export function handleMarketEntered(event: MarketEntered): void {
  let market = Market.load(event.params.xToken.toHexString())
  let accountID = event.params.account.toHex()
  let cTokenStats = updateCommonCTokenStats(
    market.id,
    market.symbol,
    accountID,
    event.transaction.hash,
    event.block.timestamp.toI32(),
    event.block.number.toI32(),
  )
  cTokenStats.enteredMarket = true
  cTokenStats.save()
}

export function handleMarketExited(event: MarketExited): void {
  let market = Market.load(event.params.xToken.toHexString())
  let accountID = event.params.account.toHex()
  let cTokenStats = updateCommonCTokenStats(
    market.id,
    market.symbol,
    accountID,
    event.transaction.hash,
    event.block.timestamp.toI32(),
    event.block.number.toI32(),
  )
  cTokenStats.enteredMarket = false
  cTokenStats.save()
}

export function handleNewCloseFactor(event: NewCloseFactor): void {
  let comptroller = loadOrCreateComptroller()
  comptroller.closeFactor = event.params.newCloseFactorMantissa
  comptroller.save()
}

export function handleNewCollateralFactor(event: NewCollateralFactor): void {
  let market = Market.load(event.params.xToken.toHexString())
  market.collateralFactor = event.params.newCollateralFactorMantissa
    .toBigDecimal()
    .div(mantissaFactorBD)
  market.save()
}

// This should be the first event acccording to etherscan but it isn't.... price oracle is. weird
export function handleNewLiquidationIncentive(event: NewLiquidationIncentive): void {
  let comptroller = loadOrCreateComptroller()
  comptroller.liquidationIncentive = event.params.newLiquidationIncentiveMantissa
  comptroller.save()
}

// export function handleNewMaxAssets(event: NewMaxAssets): void {
//   let comptroller = Comptroller.load('1')
//   comptroller.maxAssets = event.params.newMaxAssets
//   comptroller.save()
// }

export function handleNewPriceOracle(event: NewPriceOracle): void {
  let comptroller = loadOrCreateComptroller()

  comptroller.priceOracle = event.params.newPriceOracle
  // log.info('ORACLE: {}', [ comptroller.priceOracle.toString()])

  comptroller.save()
}

export function loadOrCreateComptroller(): Comptroller {
  let comptroller = Comptroller.load('1')

  if (comptroller == null) {
    comptroller = new Comptroller('1')
  }

  return comptroller as Comptroller
}
