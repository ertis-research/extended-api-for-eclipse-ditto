const express = require('express')
const Router = express.Router
const ThingTypeController = require('../controllers/thingType.controller.js')

const router = Router()

/**
 * @swagger
 * definitions:
 *     ThingType:
 *      type: object
 *      properties:
 *          thingTypeId:
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
 *  name: ThingTypes
 *  description: Types of Ditto things
 */

/**
 * @swagger
 * /thingtypes:
 *   get:
 *      summary: Get all thing types
 *      tags: [ThingTypes]
 *      description: Use to request all thing types
 *      produces:
 *         - application/json
 *      responses:
 *         200:
 *           description: A sucessfull response
 *         400:
 *           description: Bad request
 * 
 */
 router.get("/", ThingTypeController.getAll)

/**
 * @swagger
 * /thingtypes:
 *   post:
 *      summary: Create a new type of thing
 *      tags: [ThingTypes]
 *      description: Use to create a new type of thing
 *      produces:
 *         - application/json
 *      parameters:
 *         - in: body
 *           name: ThingType info
 *           description: The information of the thing type
 *           schema:
 *              $ref: '#/definitions/ThingType'
 *      responses:
 *         200:
 *           description: A sucessfull response
 *         500:
 *           description: Internal Server Error
 */
router.post("/", ThingTypeController.saveObject)

/**
 * @swagger
 * /thingTypes/{thingTypeId}:
 *   get:
 *      summary: Get a specific type of thing
 *      tags: [ThingTypes]
 *      description: Use to request one typething
 *      produces:
 *         - application/json
 *      parameters:
 *          - in: path
 *            name: thingTypeId
 *            type: string
 *            required: true
 *            description: ID of the thingtype to get.  
 *      responses:
 *         200:
 *           description: A sucessfull response
 *         400:
 *           description: Bad request
 */
router.get("/:id", ThingTypeController.getObject)

/**
 * @swagger
 * /thingtypes/{thingTypeId}:
 *   put:
 *      summary: Update a specific type of thing
 *      tags: [ThingTypes]
 *      description: Use to update one type of thing
 *      produces:
 *         - application/json
 *      parameters:
 *          - in: path
 *            name: thingTypeId
 *            type: string
 *            required: true
 *            description: ID of the thingtype to update.  
 *          - in: body
 *            name: ThingType info
 *            description: The information of the thing type
 *            schema:
 *              $ref: '#/definitions/ThingType'
 *      responses:
 *         200:
 *           description: A sucessfull response
 *         400:
 *           description: Bad request
 */
router.put("/:id", ThingTypeController.updateObject)

/**
 * @swagger
 * /thingtypes/{thingTypeId}:
 *   delete:
 *      summary: Delete a specific type of thing
 *      tags: [ThingTypes]
 *      description: Use to delete one type of thing
 *      produces:
 *         - application/json
 *      parameters:
 *          - in: path
 *            name: thingTypeId
 *            type: string
 *            required: true
 *            description: ID of the thingtype to delete.  
 *      responses:
 *         200:
 *           description: A sucessfull response
 *         400:
 *           description: Bad request
 */
 router.delete("/:id", ThingTypeController.deleteObject)

/**
 * @swagger
 * /thingtypes/{thingTypeId}/twin/{twinId}/thing/{thingId}:
 *   post:
 *      summary: Create a new thing from a type
 *      tags: [ThingTypes]
 *      description: Use to create a new thing with the same properties as the selected type.
 *      produces:
 *         - application/json
 *      parameters:
 *         - in: body
 *           name: Thing info
 *           description: In the body you can modify properties of the Ditto thing that do not match the type without having to update it. For example, if a type has an assigned policy and we want to generate a Ditto thing with all the properties of the type but with a different policy, we can modify it directly.
 *           schema:
 *              $ref: '#/definitions/Thing'
 *         - in: path
 *           name: thingTypeId
 *           type: string
 *           required: true
 *           description: ID of the thingType selected
 *      responses:
 *         200:
 *           description: A sucessfull response
 *         400:
 *           description: Bad request
 *         404:
 *           description: Resource not found
 *         500:
 *           description: Internal Server Error
 */
 router.post("/:thingTypeId/twin/:twinId/thing/:thingId", ThingTypeController.saveThingFromType)

module.exports = router