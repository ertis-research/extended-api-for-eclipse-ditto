/**
 * @fileoverview Execute requests in Eclipse Ditto
 * @author Julia Robles <juliarobles@uma.es>
*/

import axios, { AxiosResponse } from 'axios';
import { RequestResponse } from '../types';

const tokenAPI: string = Buffer.from(`${process.env.DITTO_USERNAME_API}:${process.env.DITTO_PASSWORD_API}`, 'utf8').toString('base64')
const tokenDevops: string = Buffer.from(`${process.env.DITTO_USERNAME_DEVOPS}:${process.env.DITTO_PASSWORD_DEVOPS}`, 'utf8').toString('base64')

const pathAPI: string = "/api/2"
const all_logs = process.env.ALL_LOGS == 'true'


enum Method {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
}

const getFunction = (method: Method) => {
    switch (method) {
        case Method.POST:
            return axios.post
        case Method.PUT:
            return axios.put
        case Method.PATCH:
            return axios.patch
        case Method.DELETE:
            return axios.delete
        default:
            return axios.get
    }
}

export const executeRequestWithoutData = async (method: Method, token: string, path: string = ""): Promise<RequestResponse> => {
    if(all_logs) console.log("[Request execution in Eclipse Ditto] WITHOUT DATA. " + method.toString() + " " + path)
    try {
        const response = await getFunction(method)(
            process.env.DITTO_URI_THINGS + path,
            {
                headers: {
                    'Authorization': `Basic ${token}`,
                    'Accept': 'application/json'
                }
            }
        )
        if(all_logs) console.log('[Request execution in Eclipse Ditto] Response data: \n', JSON.stringify(response.data))
        return {
            status: response.status,
            message: response.data
        }
    } catch (err: any) {
        if(all_logs) console.log("[Request execution in Eclipse Ditto] ERROR")
        if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if(all_logs) console.log(err.response.data);
            return err.response
        } else if (err.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(err.request);
            return {
                status: 500,
                message: "The request to Eclipse Ditto was made but no response was received"
            }
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', err.message);
            return {
                status: 500,
                message: "Something happened in setting up the request"
            }
        }
    }
};

export const executeRequestWithData = async (method: Method, token: string, path: string = "", data: any = {}, contentType: any = "application/json"): Promise<RequestResponse> => {
    if(all_logs) console.log("[Request execution in Eclipse Ditto] WITH DATA. " + method.toString() + " " + path)
    try {
        const response = await getFunction(method)(
            process.env.DITTO_URI_THINGS + path,
            data,
            {
                headers: {
                    'Authorization': `Basic ${token}`,
                    'Content-Type': contentType + "; charset=utf-8",
                    'Accept': 'application/json'
                }
            }
        )
        if(all_logs) console.log('[Request execution in Eclipse Ditto] Response data: \n', JSON.stringify(response.data))
        return {
            status: response.status,
            message: response.data
        }
    } catch (err: any) {
        if(all_logs) console.log("[Request execution in Eclipse Ditto] ERROR")
        if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if(all_logs) console.log(err.response.data);
            return err.response
        } else if (err.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(err.request);
            return {
                status: 500,
                message: "The request to Eclipse Ditto was made but no response was received"
            }
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', err.message);
            return {
                status: 500,
                message: "Something happened in setting up the request"
            }
        }
    }
};

export const executePOST = async (path: string = "", data: any = {}): Promise<RequestResponse> => {
    return await executeRequestWithData(Method.POST, tokenAPI, pathAPI + path, data = data);
};

export const executePOSTTextPlain = async (path: string = "", data: any): Promise<RequestResponse> => {
    return await executeRequestWithData(Method.POST, tokenAPI, (pathAPI + path), data, "text/plain")
};

export const executePUT = async (path: string = "", data: any = {}): Promise<RequestResponse> => {
    return await executeRequestWithData(Method.PUT, tokenAPI, pathAPI + path, data)
}

export const executePATCH = async (path: string = "", data: any = {}): Promise<RequestResponse> => {
    return await executeRequestWithData(Method.PATCH, tokenAPI, pathAPI + path, data, "application/merge-patch+json")
}

export const executeGET = async (path: string = ""): Promise<RequestResponse> => {
    return await executeRequestWithoutData(Method.GET, tokenAPI, pathAPI + path)
}

export const executeDELETE = async (path: string = ""): Promise<RequestResponse> => {
    return await executeRequestWithoutData(Method.DELETE, tokenAPI, pathAPI + path)
}

export const executePOST_DEVOPS = async (path: string = "", data: any = {}): Promise<RequestResponse> => {
    return await executeRequestWithData(Method.POST, tokenDevops, path, data)
}