const assert = require('assert')
const migration37 = require('../../../app/scripts/migrations/037')

describe('migration #37', () => {
  it('should update the version metadata', (done) => {
    const oldStorage = {
      'meta': {
        'version': 36,
      },
      'data': {},
    }

    migration37.migrate(oldStorage)
      .then((newStorage) => {
        assert.deepEqual(newStorage.meta, {
          'version': 37,
        })
        done()
      })
      .catch(done)
  })

  it('should add a fullScreenVsPopup property set to either "control" or "fullScreen"', (done) => {
    const oldStorage = {
      'meta': {},
      'data': {},
    }

    migration37.migrate(oldStorage)
      .then((newStorage) => {
        try {
          assert.deepEqual(newStorage.data.ABTestController, {
            'fullScreenVsPopup': 'control',
          })
        } catch (e) {
          assert.deepEqual(newStorage.data.ABTestController, {
            abTests: {
              'fullScreenVsPopup': 'fullScreen',
            },
          })
        }
        done()
      })
      .catch(done)
  })

  it('should leave the fullScreenVsPopup property unchanged if it exists', (done) => {
    const oldStorage = {
      'meta': {},
      'data': {
        'ABTestController': {
          abTests: {
            'fullScreenVsPopup': 'fullScreen',
          },
        },
      },
    }

    migration37.migrate(oldStorage)
      .then((newStorage) => {
        assert.deepEqual(newStorage.data.ABTestController, {
          abTests: {
            'fullScreenVsPopup': 'fullScreen',
          },
        })
        done()
      })
      .catch(done)
  })
})
