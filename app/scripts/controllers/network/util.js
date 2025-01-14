const {
  ROPSTEN,
  RINKEBY,
  KOVAN,
  MAINNET,
  GOERLI,
  BLOOMEN,
  ROPSTEN_CODE,
  RINKEBY_CODE,
  KOVAN_CODE,
  GOERLI_CODE,
  BLOOMEN_CODE,
  ROPSTEN_DISPLAY_NAME,
  RINKEBY_DISPLAY_NAME,
  KOVAN_DISPLAY_NAME,
  MAINNET_DISPLAY_NAME,
  GOERLI_DISPLAY_NAME,
  BLOOMEN_DISPLAY_NAME,
} = require('./enums')

const networkToNameMap = {
  [ROPSTEN]: ROPSTEN_DISPLAY_NAME,
  [RINKEBY]: RINKEBY_DISPLAY_NAME,
  [KOVAN]: KOVAN_DISPLAY_NAME,
  [MAINNET]: MAINNET_DISPLAY_NAME,
  [GOERLI]: GOERLI_DISPLAY_NAME,
  [BLOOMEN]: BLOOMEN_DISPLAY_NAME,
  [ROPSTEN_CODE]: ROPSTEN_DISPLAY_NAME,
  [RINKEBY_CODE]: RINKEBY_DISPLAY_NAME,
  [KOVAN_CODE]: KOVAN_DISPLAY_NAME,
  [GOERLI_CODE]: GOERLI_DISPLAY_NAME,
  [BLOOMEN_CODE]: BLOOMEN_DISPLAY_NAME,
}

const getNetworkDisplayName = key => networkToNameMap[key]

module.exports = {
  getNetworkDisplayName,
}
