const twin = require('./routes/twin.routes.js')
const policy = require('./routes/policy.routes.js')
const types = require('./routes/types.routes.js')

function router (app) {
    app.set('strict routing', true)
    app.use('/api/twins', twin)
    app.use('/api/policies', policy)
    app.use('/api/types', types)
}

module.exports = router