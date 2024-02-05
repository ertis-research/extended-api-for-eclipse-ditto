// IMPORTS
// ------------------------------------------------------------------------
import { Request, Response } from 'express';
import {
    postConnections,
    getAllConnectionId,
    getConnectionById,
    openConnection,
    closeConnection,
    deleteConnection
} from '../auxiliary/api_calls/connections';

interface ResponseMessage {
    status: number;
    message: string;
}

export const ConnectionsController = {
    post: async (req: Request, res: Response) => {
        // #swagger.tags = ['Connections']
        const response: ResponseMessage = await postConnections(req.body);
        res.status(response.status || 500).json(response.message);
    },
    getIds: async (req: Request, res: Response) => {
        // #swagger.tags = ['Connections']
        const response: ResponseMessage = await getAllConnectionId();
        res.status(response.status || 500).json(response.message);
    },
    getConnection: async (req: Request, res: Response) => {
        // #swagger.tags = ['Connections']
        const response: ResponseMessage = await getConnectionById(req.params.connectionId);
        res.status(response.status || 500).json(response.message);
    },
    openConnection: async (req: Request, res: Response) => {
        // #swagger.tags = ['Connections']
        const response: ResponseMessage = await openConnection(req.params.connectionId);
        res.status(response.status || 500).json(response.message);
    },
    closeConnection: async (req: Request, res: Response) => {
        // #swagger.tags = ['Connections']
        const response: ResponseMessage = await closeConnection(req.params.connectionId);
        res.status(response.status || 500).json(response.message);
    },
    deleteConnection: async (req: Request, res: Response) => {
        // #swagger.tags = ['Connections']
        const response: ResponseMessage = await deleteConnection(req.params.connectionId);
        res.status(response.status || 500).json(response.message);
    }
};