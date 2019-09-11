
const LOG_LIMIT = 100

/**
 * Create middleware for logging requests and responses to restricted and
 * permissions-related methods.
 */
module.exports = function createLoggerMiddleware ({
  walletPrefix, restrictedMethods, store, storeKey
}) {
  return (req, res, next, _end) => {

    const isInternal = req.method.startsWith(walletPrefix)

    if (isInternal || restrictedMethods.includes(req.method)) {
      log(req, true, isInternal)
    } else {
      return next()
    }

    next((cb) => {
      log(res, false, isInternal)
      cb()
    })
  }

  function log(rpcObject, isRequest, isInternal) {
    writeLog({
      rpcObject,
      time: (new Date()).getTime(),
      rpcType: isRequest ? 'request' : 'response',
      methodType: isInternal ? 'internal' : 'restricted'
    })
  }

  function writeLog(entry) {
    const logs = store.getState()[storeKey]
    if (logs.length > LOG_LIMIT - 2) {
      logs.pop()
    }
    logs.push(entry)
    store.updateState({ [storeKey]: logs })
  }
}
