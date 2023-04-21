const twin = require('./routes/twin.routes.js')
const policy = require('./routes/policy.routes.js')
const types = require('./routes/types.routes.js')
const devops = require('./routes/devops.routes.js')
//const connections = require('./routes/connections.routes.js')

function router (app) {
    app.set('strict routing', true)
    app.use('/api/twins', twin)
    app.use('/api/policies', policy)
    app.use('/api/types', types)
    app.use('/devops', devops)
    //app.use('/connections', connections)
}

module.exports = router