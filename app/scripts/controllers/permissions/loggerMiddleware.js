
const clone = require('clone')
const LOG_LIMIT = 100

/**
 * Create middleware for logging requests and responses to restricted and
 * permissions-related methods.
 */
module.exports = function createLoggerMiddleware ({
  walletPrefix, restrictedMethods, store, storeKey,
}) {
  return (req, res, next, _end) => {

    let entry
    const isInternal = req.method.startsWith(walletPrefix)

    if (isInternal || restrictedMethods.includes(req.method)) {
      entry = log(req, isInternal)
    } else {
      return next()
    }

    next((cb) => {
      addResponse(entry, res)
      cb()
    })
  }

  function log (request, isInternal) {
    const entry = {
      method: request.method,
      methodType: isInternal ? 'internal' : 'restricted',
      origin: request.origin,
      request: cloneObj(request),
      requestTime: Date.now(),
      response: null,
      responseTime: null,
      success: null,
    }
    commit(entry)
    return entry
  }

  function addResponse (entry, response) {
    if (!response) return
    entry.response = cloneObj(response)
    entry.responseTime = Date.now()
    entry.success = !response.error
  }

  function commit (entry) {
    const logs = store.getState()[storeKey]
    if (logs.length > LOG_LIMIT - 2) {
      logs.pop()
    }
    logs.push(entry)
    store.updateState({ [storeKey]: logs })
  }

  // the call to clone is set to disallow circular references
  // we attempt cloning at a depth of 3 and 2, then return a
  // shallow copy of the object
  function cloneObj (obj) {
    for (let i = 3; i > 1; i--) {
      try {
        return clone(obj, false, i)
      } catch (_) {}
    }
    return { ...obj }
  }
}
