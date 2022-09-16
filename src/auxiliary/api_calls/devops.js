// IMPORTS
// ------------------------------------------------------------------------
const { 
    executePOST_DEVOPS 
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
        var data = response.message
        data = data['connectivity']
        return data[Object.keys(data)[0]]
    }
    return undefined
}

const postDevops = async (body) => {
    return await executePOST_DEVOPS(queryConnection, body)
}

const getAllConnectionId = async () => {
    var response = await postDevops(getConnectionIdsJSON)
    var data = responseConnection(response)
    if(data !== undefined && data['status'] == 200){
        return {
            status: 200,
            message: data['connectionIds']
        }
    }
    return response
}

const getConnectionById = async (connectionId) => {
    var response = await postDevops(getConnectionByIdJSON(connectionId))
    var data = responseConnection(response)
    if(data !== undefined && data['status'] == 200){
        return {
            status: 200,
            message: data['connection']
        }
    }
    return response
}

const closeConnection = async (connectionId) => {
    var response = await postDevops(closeConnectionJSON(connectionId))
    var data = responseConnection(response)
    if(data !== undefined) return {
        status: data['status'],
        message: ""
    }
    return response
}

const openConnection = async (connectionId) => {
    var response = await postDevops(openConnectionJSON(connectionId))
    var data = responseConnection(response)
    if(data !== undefined) return {
        status: data['status'],
        message: ""
    }
    return response
}


// EXPORT
// ------------------------------------------------------------------------
module.exports = {
    postDevops : postDevops,
    getAllConnectionId : getAllConnectionId,
    getConnectionById : getConnectionById,
    closeConnection : closeConnection,
    openConnection : openConnection
}