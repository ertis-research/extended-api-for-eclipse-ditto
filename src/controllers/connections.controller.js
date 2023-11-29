// IMPORTS
// ------------------------------------------------------------------------
const {
    postConnections,
    getAllConnectionId,
    getConnectionById,
    openConnection,
    closeConnection,
    deleteConnection
} = require('../auxiliary/api_calls/connections.js')


// REQUESTS
// ------------------------------------------------------------------------
const ConnectionsController = {
    post: async (req, res) => {
        response = await postConnections(req.body)
        res.status(response.status || 500).json(response.message)
    },
    getIds: async (req, res) => {
        response = await getAllConnectionId()
        res.status(response.status || 500).json(response.message)
    },
    getConnection: async (req, res) => {
        response = await getConnectionById(req.params.connectionId)
        res.status(response.status || 500).json(response.message)
    },
    openConnection : async (req, res) => {
        response = await openConnection(req.params.connectionId)
        res.status(response.status || 500).json(response.message)
    },
    closeConnection : async (req, res) => {
        response = await closeConnection(req.params.connectionId)
        res.status(response.status || 500).json(response.message)
    },
    deleteConnection : async (req, res) => {
        response = await deleteConnection(req.params.connectionId)
        res.status(response.status || 500).json(response.message)
    }
}

module.exports = ConnectionsController