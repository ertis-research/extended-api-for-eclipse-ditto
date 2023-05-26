// IMPORTS
// ------------------------------------------------------------------------
const { 
    executePOST_DEVOPS,
    executeGET,
    executePOSTTextPlain
} = require('./requests_for_ditto')

const { 
    queryConnection,
    getConnectionIdsJSON, 
    getConnectionByIdJSON,
    closeConnectionJSON,
    openConnectionJSON 
} = require('./queries')


// REQUESTS
// ------------------------------------------------------------------------
const responseConnection = (response) => {
    if (response.status == 200){
        var data = {
            status : response.status,
            message : (response.message.map((connection) => {return connection['id']}))
        }

        return data
    }
    return undefined
}

const postConnections = async (body) => {
    return await executePOST_DEVOPS(queryConnection, body)
}

const getAllConnectionId = async () => {
    var response = await executeGET("/connections")

    if(response !== undefined && response['status'] == 200){
        return {
            status: 200,
            message: (response.message.map((connection) => {return {
                                                                        'id': connection['id'],
                                                                        'name': connection['name']
                                                                    }}))
        }
    }else
    return response
}

const getConnectionById = async (connectionId) => {
    return await executeGET("/connections/" + connectionId)
}

const closeConnection = async (connectionId) => {
    var response = await executePOSTTextPlain("/connections/"+connectionId+"/command", "connectivity.commands:closeConnection")
    return response
}

const openConnection = async (connectionId) => {
    var response = await executePOSTTextPlain("/connections/"+connectionId+"/command", "connectivity.commands:openConnection")
    return response
}

// EXPORT
// ------------------------------------------------------------------------
module.exports = {
    postConnections : postConnections,
    getAllConnectionId : getAllConnectionId,
    getConnectionById : getConnectionById,
    closeConnection : closeConnection,
    openConnection : openConnection
}