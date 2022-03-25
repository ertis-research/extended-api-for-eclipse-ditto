//const express = require('express')
const router = require("express-promise-router")()
const TypeController = require('../controllers/type.controller.js')

router.get("/", TypeController.getRootTypes)

router.post("/", TypeController.postType)

// typeId
router.get("/:typeId", TypeController.getTypeById)

router.put("/:typeId", TypeController.putTypeById)

router.patch("/:typeId", TypeController.patchTypeById)

router.delete("/:typeId", TypeController.deleteTypeById)

// Children
router.get("/:typeId/children", TypeController.getChildrenOfTypeById)

// Children + childId
router.put("/:typeId/children/:childId", TypeController.putChildrenOfType)

// Children + childId + unlink
router.patch("/:typeId/children/:childId/unlink", TypeController.unlinkOneChildrenOfType)

// Children unlink
router.patch("/:typeId/children/unlink", TypeController.unlinkAllChildrenOfType)

// Parent
router.get("/:typeId/parent", TypeController.getParentsOfType)

// Parent unlink
router.patch("/:typeId/parent/unlink", TypeController.unlinkAllParentsOfType)

//Create twin
router.post("/:typeId/create/:twinId", TypeController.createTwinFromType)


module.exports = router