import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class PermissionsHistory extends Component {

  static propTypes = {
    permissionsHistory: PropTypes.object.isRequired,
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  renderPermissionsHistoryList () {
    const { permissionsHistory } = this.props

    /**
     * Permissions History Shape
     * {
     *   [origin]: {
     *     [methodName]: {
     *       lastApproved: Date.now()
     *     },
     *     ...
     *   },
     *   ...
     * }
     */

    return (
      <ul>
        {
          Object.keys(permissionsHistory).sort().map(domain => (
            <li key={domain}>
              <details className="settings-page__content-list-details">
                <summary>
                  {domain}
                  <i className="caret"></i>
                </summary>
                <ul>
                  {this.renderMethodList(permissionsHistory[domain])}
                </ul>
              </details>
            </li>
          ))
        }
      </ul>
    )
  }

  renderMethodList (methods) {
    return Object.keys(methods).sort().map(m => {
      const date = new Date(methods[m].lastApproved)
      const dateString = date.toLocaleDateString()
      const timeString = date.toLocaleTimeString(
        [], {hour: '2-digit', minute: '2-digit'}
      )
      return (
        <li key={m} className="settings-page__content-list-item">
          {m}
          <ul>
            <li className="settings-page__content-list-item__sub">
              {`Last Approved: ${dateString} ${timeString}`}
            </li>
          </ul>
        </li>
      )
    })
  }

  render () {
    const { t } = this.context
    return (
      <div className="settings-page__content-row">
        <div className="settings-page__content-item">
          <span>{ t('permissionsHistorySettings') }</span>
          <span className="settings-page__content-description">
            { t('permissionsHistoryDescription') }
          </span>
        </div>
        <div className="settings-page__content-item">
          {
            this.props.permissionsHistory &&
            Object.keys(this.props.permissionsHistory).length > 0
              ? this.renderPermissionsHistoryList()
              : t('permissionsHistoryEmpty')
          }
        </div>
      </div>
    )
  }
}
