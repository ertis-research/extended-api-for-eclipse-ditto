const axios = require('axios').default


const tokenAPI = Buffer.from(`${process.env.DITTO_USERNAME_API}:${process.env.DITTO_PASSWORD_API}`, 'utf8').toString('base64')
const tokenDevops = Buffer.from(`${process.env.DITTO_USERNAME_DEVOPS}:${process.env.DITTO_PASSWORD_DEVOPS}`, 'utf8').toString('base64')

const pathAPI = "/api/2"

const executeRequestWithoutData = async (functionRequest, token, path = "") => {
    try {
        const response = await functionRequest(
            process.env.DITTO_URI_THINGS + path,
            {
                headers : {
                    'Authorization' : `Basic ${token}`,
                    'Accept': 'application/json'
                }
            }
        )
        return {
            status : response.status,
            message : response.data
        }
    } catch (err) {
        if (err != undefined && err.response != undefined) {
            return {
                status : err.response.status,
                message : err.response.statusText
            }
        } else {
            console.log("ERROR: executeRequestWithoutData")
            return {
                status : 500,
                message : "ERROR: executeRequestWithoutData"
            }
        }
    }    
}

const executeRequestWithData = async (functionRequest, token, path = "", data = {}, contentType = "application/json") => {
    try {
        const response = await functionRequest(
            process.env.DITTO_URI_THINGS + path,
            data,
            {
                headers : {
                    'Authorization' : `Basic ${token}`,
                    'Content-Type' : contentType + "; charset=utf-8",
                    'Accept': 'application/json'
                }
            }
        )
        return {
            status : response.status,
            message : response.data
        }
    } catch (err) {
        if (err != undefined && err.response != undefined) {
            return {
                status : err.response.status,
                message : err.response.statusText
            }
        } else {
            console.log("ERROR: executeRequestWithData")
            return {
                status : 500,
                message : "ERROR: executeRequestWithData"
            }
        }
        
    }    
}

const executePOST = async (path = "", data = {}) => {
    return await executeRequestWithData(axios.post, tokenAPI, pathAPI + path, data)
}

const executePOSTTextPlain = async (path = "", data) => {
    return await executeRequestWithData(axios.post, tokenAPI, pathAPI + path, data, contentType="text/plain")
}

const executePUT = async (path = "", data = {}) => {
    return await executeRequestWithData(axios.put, tokenAPI, pathAPI + path, data)
}

const executePATCH = async (path = "", data = {}) => {
    return await executeRequestWithData(axios.patch, tokenAPI, pathAPI + path, data, "application/merge-patch+json")
}

const executeGET = async (path = "") => {
    return await executeRequestWithoutData(axios.get, tokenAPI, pathAPI + path)
}

const executeDELETE = async (path = "") => {
    return await executeRequestWithoutData(axios.delete, tokenAPI, pathAPI + path)
}

const executePOST_DEVOPS = async (path = "", data = {}) => {
    return await executeRequestWithData(axios.post, tokenDevops, path, data)
}
// EXPORT
// ------------------------------------------------------------------------
module.exports = {
    executePOST : executePOST,
    executePOSTTextPlain : executePOSTTextPlain,
    executePUT : executePUT,
    executePATCH : executePATCH,
    executeGET : executeGET,
    executeDELETE : executeDELETE,
    executePOST_DEVOPS : executePOST_DEVOPS
}