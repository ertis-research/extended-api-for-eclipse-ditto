// IMPORTS
// ------------------------------------------------------------------------
import { executePOST_DEVOPS, executeGET, executePOSTTextPlain, executeDELETE } from './requests_for_ditto';
import { queryConnection, getConnectionIdsJSON, getConnectionByIdJSON, closeConnectionJSON, openConnectionJSON } from './queries';
import { AxiosResponse } from 'axios';
import { RequestResponse } from '../types';



// REQUESTS
// ------------------------------------------------------------------------
/*const responseConnection = (response: AxiosResponse): any => {
    if (response.status == 200) {
        let data: RequestResponse = {
            status: response.status,
            message: (response.message.map((connection: any) => { return connection['id'] }))
        }

        return data
    }
    return undefined
}*/

export const postConnections = async (body: any): Promise<any> => {
    return await executePOST_DEVOPS(queryConnection, body)
}

export const getAllConnectionId = async (): Promise<any> => {
    let response = await executeGET("/connections")

    if (response !== undefined && response.status == 200) {
        return {
            status: 200,
            message: (response.message.map((connection: any) => {
                return {
                    'id': connection['id'],
                    'name': connection['name']
                }
            }))
        }
    } else
        return response
}

export const getConnectionById = async (connectionId: string): Promise<any> => {
    return await executeGET("/connections/" + connectionId)
}

export const closeConnection = async (connectionId: string): Promise<any> => {
    let response = await executePOSTTextPlain("/connections/" + connectionId + "/command", "connectivity.commands:closeConnection")
    return response
}

export const openConnection = async (connectionId: string): Promise<any> => {
    let response = await executePOSTTextPlain("/connections/" + connectionId + "/command", "connectivity.commands:openConnection")
    return response
}

export const deleteConnection = async (connectionId: string): Promise<any> => {
    let response = await executeDELETE("/connections/" + connectionId)
    return response
}