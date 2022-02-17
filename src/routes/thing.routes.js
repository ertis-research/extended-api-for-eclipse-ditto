//const express = require('express')
const router = require("express-promise-router")()
const ThingController = require('../controllers/thing.controller.js')

//const router = Router()

/**
 * @swagger
 * definitions:
 *      Thing:
 *       type: object
 *       properties:
 *          thingId:
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
 *  name: Things
 *  description: Manage every thing
 */

/**
 * @swagger
 * /things:
 *   get:
 *      summary: Retrieve multiple things with specified IDs
 *      tags: [Things]
 *      description: Returns all things passed in by the required parameter ids
 *      produces:
 *         - application/json
 *      responses:
 *         200:
 *           description: The successfully completed request contains as its result the first 200 for the user available Things. The Things are sorted in the same order as the Thing IDs were provided in the ids parameter.
 *         400:
 *           description: Bad request
 * 
 */
router.get("/", ThingController.getRootThings)

/**
 * @swagger
 * /things:
 *   post:
 *      summary: Create a new thing
 *      tags: [Things]
 *      description: Creates a thing with a default thingId and a default policyId.
 *      produces:
 *         - application/json
 *      responses:
 *         200:
 *           description: The thing was successfully created.
 *         400:
 *           description: Bad request
 *         401:
 *           description: The request could not be completed due to missing authentication.
 * 
 */
router.post("/", ThingController.postThing)

router.get("/:thingId", ThingController.getThingById)

router.put("/:thingId", ThingController.putThingById)

router.patch("/:thingId", ThingController.patchThingById)

router.delete("/:thingId", ThingController.deleteOnlyThingById)

router.delete("/:thingId/children", ThingController.deleteThingAndChildrenById)

router.put("/:thingId/children/:childrenId", ThingController.putChildrenOfThing)


module.exports = router