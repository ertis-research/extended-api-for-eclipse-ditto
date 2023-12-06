import { Router } from 'express';
import { ConnectionsController } from '../controllers/connection.controller';

export const router = Router()
router.post("/", ConnectionsController.post)
router.get("/ids", ConnectionsController.getIds)
router.get("/:connectionId", ConnectionsController.getConnection)
router.put("/:connectionId/open", ConnectionsController.openConnection)
router.put("/:connectionId/close", ConnectionsController.closeConnection)
router.put("/:connectionId/delete", ConnectionsController.deleteConnection)