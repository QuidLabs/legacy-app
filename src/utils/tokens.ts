import omit from 'lodash/omit'
import ual from "../../config/ual";
import { TAssetSymbol } from '@deltalabs/eos-utils';

export const ALL_TOKEN_SYMBOLS = Object.keys(ual.chain.tokens)
export const BORROWABLE_TOKEN_SYMBOLS = ALL_TOKEN_SYMBOLS
export const BORROWABLE_TOKEN_SYMBOLS_NO_VIG = ALL_TOKEN_SYMBOLS.filter(x => !['VIG'].includes(x))
export const BORROWABLE_TOKEN_SYMBOLS_NO_VIGOR = BORROWABLE_TOKEN_SYMBOLS.filter(x => !['VIGOR'].includes(x))

export const symbolCode2Symbol = (symbolCode: string):TAssetSymbol => {
  return (ual.chain.tokens as any)[symbolCode].symbol;
}