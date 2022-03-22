//const express = require('express')
const router = require("express-promise-router")()
const TypeController = require('../controllers/type.controller.js')

router.get("/", TypeController.getRootTypes)

router.post("/", TypeController.postType)

router.get("/:thingId", TypeController.getTypeById)

router.put("/:thingId", TypeController.putTypeById)

router.patch("/:thingId", TypeController.patchTypeById)

router.delete("/:thingId", TypeController.deleteTypeById)

router.put("/:thingId/children/:childrenId", TypeController.putChildrenOfType)


module.exports = router