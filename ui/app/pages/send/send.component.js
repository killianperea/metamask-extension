import React from 'react'
import PropTypes from 'prop-types'
import PersistentForm from '../../../lib/persistent-form'
import {
  getAmountErrorObject,
  getGasFeeErrorObject,
  getToAddressForGasUpdate,
  doesAmountErrorRequireUpdate,
} from './send.utils'

import SendHeader from './send-header'
import AddRecipient from './send-content/add-recipient'
import SendContent from './send-content'
import SendFooter from './send-footer'
import EnsInput from './send-content/add-recipient/ens-input'

export default class SendTransactionScreen extends PersistentForm {

  static propTypes = {
    amount: PropTypes.string,
    amountConversionRate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    blockGasLimit: PropTypes.string,
    conversionRate: PropTypes.number,
    editingTransactionId: PropTypes.string,
    from: PropTypes.object,
    gasLimit: PropTypes.string,
    gasPrice: PropTypes.string,
    gasTotal: PropTypes.string,
    to: PropTypes.string,
    history: PropTypes.object,
    network: PropTypes.string,
    primaryCurrency: PropTypes.string,
    recentBlocks: PropTypes.array,
    selectedAddress: PropTypes.string,
    selectedToken: PropTypes.object,
    tokenBalance: PropTypes.string,
    tokenContract: PropTypes.object,
    fetchBasicGasEstimates: PropTypes.func,
    updateAndSetGasTotal: PropTypes.func,
    updateSendErrors: PropTypes.func,
    updateSendTokenBalance: PropTypes.func,
    scanQrCode: PropTypes.func,
    qrCodeDetected: PropTypes.func,
    qrCodeData: PropTypes.object,
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  state = {
    query: '',
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.qrCodeData) {
      if (nextProps.qrCodeData.type === 'address') {
        const scannedAddress = nextProps.qrCodeData.values.address.toLowerCase()
        const currentAddress = this.props.to && this.props.to.toLowerCase()
        if (currentAddress !== scannedAddress) {
          this.props.updateSendTo(scannedAddress)
          this.updateGas({ to: scannedAddress })
          // Clean up QR code data after handling
          this.props.qrCodeDetected(null)
        }
      }
    }
  }

  updateGas = ({ to: updatedToAddress, amount: value, data } = {}) => {
    const {
      amount,
      blockGasLimit,
      editingTransactionId,
      gasLimit,
      gasPrice,
      recentBlocks,
      selectedAddress,
      selectedToken = {},
      to: currentToAddress,
      updateAndSetGasLimit,
    } = this.props

    updateAndSetGasLimit({
      blockGasLimit,
      editingTransactionId,
      gasLimit,
      gasPrice,
      recentBlocks,
      selectedAddress,
      selectedToken,
      to: getToAddressForGasUpdate(updatedToAddress, currentToAddress),
      value: value || amount,
      data,
    })
  }

  componentDidUpdate (prevProps) {
    const {
      amount,
      amountConversionRate,
      conversionRate,
      from: { address, balance },
      gasTotal,
      network,
      primaryCurrency,
      selectedToken,
      tokenBalance,
      updateSendErrors,
      updateSendTokenBalance,
      tokenContract,
    } = this.props

    const {
      from: { balance: prevBalance },
      gasTotal: prevGasTotal,
      tokenBalance: prevTokenBalance,
      network: prevNetwork,
      selectedToken: prevSelectedToken,
    } = prevProps

    const uninitialized = [prevBalance, prevGasTotal].every(n => n === null)

    const amountErrorRequiresUpdate = doesAmountErrorRequireUpdate({
      balance,
      gasTotal,
      prevBalance,
      prevGasTotal,
      prevTokenBalance,
      selectedToken,
      tokenBalance,
    })

    if (amountErrorRequiresUpdate) {
      const amountErrorObject = getAmountErrorObject({
        amount,
        amountConversionRate,
        balance,
        conversionRate,
        gasTotal,
        primaryCurrency,
        selectedToken,
        tokenBalance,
      })
      const gasFeeErrorObject = selectedToken
        ? getGasFeeErrorObject({
          amountConversionRate,
          balance,
          conversionRate,
          gasTotal,
          primaryCurrency,
          selectedToken,
        })
        : { gasFee: null }
      updateSendErrors(Object.assign(amountErrorObject, gasFeeErrorObject))
    }

    if (!uninitialized) {

      if (network !== prevNetwork && network !== 'loading') {
        updateSendTokenBalance({
          selectedToken,
          tokenContract,
          address,
        })
        this.updateGas()
      }
    }

    const prevTokenAddress = prevSelectedToken && prevSelectedToken.address
    const selectedTokenAddress = selectedToken && selectedToken.address

    if (selectedTokenAddress && prevTokenAddress !== selectedTokenAddress) {
      this.updateSendToken()
    }
  }

  componentDidMount () {
    this.props.fetchBasicGasEstimates()
    .then(() => {
      this.updateGas()
    })
  }

  componentWillMount () {
    this.updateSendToken()

    // Show QR Scanner modal  if ?scan=true
    if (window.location.search === '?scan=true') {
      this.props.scanQrCode()

      // Clear the queryString param after showing the modal
      const cleanUrl = location.href.split('?')[0]
      history.pushState({}, null, `${cleanUrl}`)
      window.location.hash = '#send'
    }
  }

  componentWillUnmount () {
    this.props.resetSendState()
  }

  onRecipientInputChange = query => {
    this.setState({ query })
  }

  updateSendToken () {
    const {
      from: { address },
      selectedToken,
      tokenContract,
      updateSendTokenBalance,
    } = this.props

    updateSendTokenBalance({
      selectedToken,
      tokenContract,
      address,
    })
  }

  render () {
    const { history, to } = this.props

    return (
      <div className="page-container">
        <SendHeader history={history}/>
        { this.renderInput() }
        { to ? this.renderSendContent() : this.renderAddRecipient() }
      </div>
    )
  }

  renderInput () {
    const { to, toNickname } = this.props

    return (
      <EnsInput
        className="send__to-row"
        // scanQrCode={_ => {
        //   this.context.metricsEvent({
        //     eventOpts: {
        //       category: 'Transactions',
        //       action: 'Edit Screen',
        //       name: 'Used QR scanner',
        //     },
        //   })
        //   this.props.scanQrCode()
        // }}
        onChange={this.onRecipientInputChange}
        // resetRecipient={this.resetRecipient}
        // selectedAddress={to}
        // selectedName={toNickname}
      />
    )
  }

  renderAddRecipient () {
    const { scanQrCode } = this.props

    return (
      <AddRecipient
        updateGas={this.updateGas}
        scanQrCode={scanQrCode}
        query={this.state.query}
      />
    )
  }

  renderSendContent () {
    const { history, showHexData, scanQrCode } = this.props

    return [
      <SendContent
        key="send-content"
        updateGas={this.updateGas}
        scanQrCode={scanQrCode}
        showHexData={showHexData}
      />,
      <SendFooter key="send-footer" history={history} />,
    ]
  }

}
