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
        return {
            status: response.status,
            message: response.data
        }
    } catch (err: any) {
        console.log("ERROR: executeRequestWithoutData")
        return {
            status: 500,
            message: "ERROR: executeRequestWithoutData"
        }
    }
};

export const executeRequestWithData = async (functionRequest: any, token: string, path: string = "", data: any = {}, contentType: any = "application/json",): Promise<RequestResponse> => {
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
        return {
            status: response.status,
            message: response.data
        }
    } catch (err: any) {
        console.log("ERROR: executeRequestWithData")
        return {
            status: 500,
            message: "ERROR: executeRequestWithData"
        }
    }
};

export const executePOST = async (path: string = "", data: any = {}): Promise<RequestResponse> => {
    return await executeRequestWithData(axios.post, tokenAPI, pathAPI + path, data=data);
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