const express = require('express')
const Router = express.Router
const ConnectionsController = require('../controllers/connections.controller.js')

const router = Router()

router.post("/", ConnectionsController.post)

router.get("/ids", ConnectionsController.getIds)

router.get("/:connectionId", ConnectionsController.getConnection)

router.put("/:connectionId/open", ConnectionsController.openConnection)

router.put("/:connectionId/close", ConnectionsController.closeConnection)

router.put("/:connectionId/delete", ConnectionsController.deleteConnection)

module.exports = router