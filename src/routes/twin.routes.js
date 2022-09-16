//const express = require('express')
const router = require("express-promise-router")()
const TwinController = require('../controllers/twin.controller.js')

//const router = Router()

/**
 * @swagger
 * definitions:
 *      Twin:
 *       type: object
 *       properties:
 *          twinId:
 *              type: string
 *          policyId:
 *              type: string
 *          definition:
 *              type: string
 *          attributes:
 *              type: object
 *          features:
 *              type: object
 */

/**
 * @swagger
 * tags:
 *  name: Twins
 *  description: Manage every twin
 */

/**
 * @swagger
 * /twins:
 *   get:
 *      summary: Retrieve multiple twins with specified IDs
 *      tags: [Twins]
 *      description: Returns all twins passed in by the required parameter ids
 *      produces:
 *         - application/json
 *      responses:
 *         200:
 *           description: The successfully completed request contains as its result the first 200 for the user available twins. The twins are sorted in the same order as the twin IDs were provided in the ids parameter.
 *         400:
 *           description: Bad request
 * 
 */
router.get("/", TwinController.getRootTwins)

/**
 * @swagger
 * /twins:
 *   post:
 *      summary: Create a new twin
 *      tags: [Twins]
 *      description: Creates a twin with a default twinId and a default policyId.
 *      produces:
 *         - application/json
 *      responses:
 *         200:
 *           description: The twin was successfully created.
 *         400:
 *           description: Bad request
 *         401:
 *           description: The request could not be completed due to missing authentication.
 * 
 */
router.post("/", TwinController.postTwin)


// twinId
router.get("/:twinId", TwinController.getTwinById)

router.put("/:twinId", TwinController.putTwinById)

router.patch("/:twinId", TwinController.patchTwinById)

router.delete("/:twinId", TwinController.deleteOnlyTwinById)

// Children
router.get("/:twinId/children", TwinController.getChildrenOfTwinById)

router.delete("/:twinId/children", TwinController.deleteTwinWithChildrenById)

// Children + childId
router.put("/:twinId/children/:childId", TwinController.putChildrenOfTwin)

// Children unlink
router.patch("/:twinId/children/unlink", TwinController.unlinkAllChildrenOfTwin)

// Parent
router.get("/:twinId/parent", TwinController.getParentOfTwin)

// Parent unlink
router.patch("/:twinId/parent/unlink", TwinController.unlinkParentAndTwin)

//Duplicate
router.post("/:twinId/duplicate/:copyId", TwinController.duplicateTwin)

//Duplicate keep hidden fields
router.post("/:twinId/duplicate/:copyId/keepHiddenFields", TwinController.duplicateTwinKeepHiddenFields)


module.exports = router