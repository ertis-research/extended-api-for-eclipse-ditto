const axios = require('axios').default


const token = Buffer.from(`${process.env.DITTO_USERNAME}:${process.env.DITTO_PASSWORD}`, 'utf8').toString('base64')

const executeRequestWithoutData = async (functionRequest, path = "") => {
    try {
        const response = await functionRequest(
            process.env.DITTO_URI_THINGS + "/api/2" + path,
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
        return {
            status : err.response.status || 500,
            message : err.response.statusText
        }
    }    
}

const executeRequestWithData = async (functionRequest, path = "", data = {}, contentType = "application/json") => {
    try {
       const response = await functionRequest(
            process.env.DITTO_URI_THINGS + "/api/2" + path,
            data,
            {
                headers : {
                    'Authorization' : `Basic ${token}`,
                    'Content-Type' : contentType + "; charset=utf-8",
                    'Accept': 'application/json'
                }
            }
        )
        console.log(response)
        return {
            status : response.status,
            message : response.data
        }
    } catch (err) {
        console.log(err)
        if (err.response != undefined) {
            return {
                status : err.response.status,
                message : err.response.statusText
            }
        } else {
            console.log(err)
            return {
                status : 500,
                message : "ERROR"
            }
        }
        
    }    
}

const executePOST = async (path = "", data = {}) => {
    return await executeRequestWithData(axios.post, path, data)
}

const executePUT = async (path = "", data = {}) => {
    return await executeRequestWithData(axios.put, path, data)
}

const executePATCH = async (path = "", data = {}) => {
    return await executeRequestWithData(axios.patch, path, data, "application/merge-patch+json")
}

const executeGET = async (path = "") => {
    return await executeRequestWithoutData(axios.get, path)
}

const executeDELETE = async (path = "") => {
    return await executeRequestWithoutData(axios.delete, path)
}

module.exports = {
    executePOST : executePOST,
    executePUT : executePUT,
    executePATCH : executePATCH,
    executeGET : executeGET,
    executeDELETE : executeDELETE
}