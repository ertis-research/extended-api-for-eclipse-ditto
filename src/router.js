const thing = require('./routes/thing.routes.js')
const policy = require('./routes/policy.routes.js')

function router (app) {
    app.set('strict routing', true)
    app.use('/api/things', thing)
    app.use('/api/policies', policy)
}

module.exports = router