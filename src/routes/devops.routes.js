const express = require('express')
const Router = express.Router
const DevopsController = require('../controllers/connections.controller.js')
//const DevopsController = require('../controllers/devops.controller.js')   <--- This is used in the old version of ditto

const router = Router()

router.post("/piggyback/connectivity", DevopsController.post)

router.get("/piggyback/connectivity/ids", DevopsController.getIds)

router.get("/piggyback/connectivity/:connectionId", DevopsController.getConnection)

router.put("/piggyback/connectivity/:connectionId/open", DevopsController.openConnection)

router.put("/piggyback/connectivity/:connectionId/close", DevopsController.closeConnection)

module.exports = router