/**
 * @fileoverview Execute requests in Eclipse Ditto
 * @author Julia Robles <juliarobles@uma.es>
*/

import axios, { AxiosResponse } from 'axios';
import { RequestResponse } from '../types';

const tokenAPI: string = Buffer.from(`${process.env.DITTO_USERNAME_API}:${process.env.DITTO_PASSWORD_API}`, 'utf8').toString('base64')
const tokenDevops: string = Buffer.from(`${process.env.DITTO_USERNAME_DEVOPS}:${process.env.DITTO_PASSWORD_DEVOPS}`, 'utf8').toString('base64')

const pathAPI: string = "/api/2"

export const executeRequestWithoutData = async (functionRequest: (url: string, config?: any) => Promise<AxiosResponse>, token: string, path: string = ""): Promise<RequestResponse> => {
    console.log("Executing request without body in Eclipse Ditto...")
    try {
        const response = await functionRequest(
            process.env.DITTO_URI_THINGS + path,
            {
                headers: {
                    'Authorization': `Basic ${token}`,
                    'Accept': 'application/json'
                }
            }
        )
        console.log('Ditto response: \n', response)
        return {
            status: response.status,
            message: response.data
        }
    } catch (err: any) {
        console.log("ERROR: executeRequestWithoutData")
        if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(err.response.data);
            console.log(err.response.status);
            console.log(err.response.headers);
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

export const executeRequestWithData = async (functionRequest: any, token: string, path: string = "", data: any = {}, contentType: any = "application/json",): Promise<RequestResponse> => {
    console.log("Executing request with body in Eclipse Ditto...")
    try {
        const response = await functionRequest(
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
        console.log('Ditto response: \n', response)
        return {
            status: response.status,
            message: response.data
        }
    } catch (err: any) {
        console.log("ERROR: executeRequestWithData")
        if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(err.response.data);
            console.log(err.response.status);
            console.log(err.response.headers);
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
    return await executeRequestWithData(axios.post, tokenAPI, pathAPI + path, data = data);
};

export const executePOSTTextPlain = async (path: string = "", data: any): Promise<RequestResponse> => {
    return await executeRequestWithData(axios.post, tokenAPI, (pathAPI + path), data, "text/plain")
};

export const executePUT = async (path: string = "", data: any = {}): Promise<RequestResponse> => {
    return await executeRequestWithData(axios.put, tokenAPI, pathAPI + path, data)
}

export const executePATCH = async (path: string = "", data: any = {}): Promise<RequestResponse> => {
    return await executeRequestWithData(axios.patch, tokenAPI, pathAPI + path, data, "application/merge-patch+json")
}

export const executeGET = async (path: string = ""): Promise<RequestResponse> => {
    return await executeRequestWithoutData(axios.get, tokenAPI, pathAPI + path)
}

export const executeDELETE = async (path: string = ""): Promise<RequestResponse> => {
    return await executeRequestWithoutData(axios.delete, tokenAPI, pathAPI + path)
}

export const executePOST_DEVOPS = async (path: string = "", data: any = {}): Promise<RequestResponse> => {
    return await executeRequestWithData(axios.post, tokenDevops, path, data)
}