const twin = require('./routes/twin.routes.js')
const twinType = require('./routes/twinType.routes.js')
const thingType = require('./routes/thingType.routes.js')
const policy = require('./routes/policy.routes.js')

function router (app) {
    app.set('strict routing', true)
    app.use('/api/twins', twin)
    app.use('/api/twintypes', twinType)
    app.use('/api/thingtypes', thingType)
    app.use('/api/policies', policy)
}

module.exports = router