const express = require('express')
const Router = express.Router
const TwinController = require('../controllers/twin.controller.js')

const router = Router({ strict: true })

/**
 * @swagger
 * definitions:
 *     Twin:
 *      type: object
 *      properties:
 *          twinId:
 *              type: string
 *          name:
 *              type: string
 *          type:
 *              type: string
 *          description:
 *              type: string
 *          image:
 *              type: string
 */

/**
 * @swagger
 * tags:
 *  name: Twins
 *  description: Twin (namespaces) of Ditto things
 */

/**
 * @swagger
 * /twins:
 *   get:
 *      summary: Get all twins
 *      tags: [Twins]
 *      description: Use to request all twins
 *      produces:
 *         - application/json
 *      responses:
 *         200:
 *           description: A sucessfull response
 *         400:
 *           description: Bad request
 */
router.get("/", TwinController.getAll)

/**
 * @swagger
 * /twins:
 *   post:
 *      summary: Create a new twin
 *      tags: [Twins]
 *      description: Use to create a new type of twin
 *      produces:
 *         - application/json
 *      parameters:
 *         - in: body
 *           name: Twin info
 *           description: The information of the twin
 *           schema:
 *              $ref: '#/definitions/Twin'
 *      responses:
 *         200:
 *           description: A sucessfull response
 *         500:
 *           description: Internal Server Error
 */
router.post("/", TwinController.saveObject)

/**
 * @swagger
 * /twins/synchronization:
 *   put:
 *      summary: Update the list of twins
 *      tags: [Twins]
 *      description: Update the list of twins looking for new namespaces in the Ditto DB
 *      produces:
 *         - application/json 
 *      responses:
 *         200:
 *           description: A sucessfull response
 *         400:
 *           description: Bad request
 */
 router.put("/synchronization", TwinController.synchronization)

/**
 * @swagger
 * /twins/{twinId}:
 *   get:
 *      summary: Get a specific twin
 *      tags: [Twins]
 *      description: Use to request one twin
 *      produces:
 *         - application/json
 *      parameters:
 *          - in: path
 *            name: twinId
 *            type: string
 *            required: true
 *            description: ID of the twin to get.  
 *      responses:
 *         200:
 *           description: A sucessfull response
 *         400:
 *           description: Bad request
 */
router.get("/:id", TwinController.getObject)

/**
 * @swagger
 * /twins/{twinId}:
 *   put:
 *      summary: Update a specific twin
 *      tags: [Twins]
 *      description: Use to update one type of twin
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
router.put("/:id", TwinController.updateObject)

/**
 * @swagger
 * /twins/{twinId}:
 *   delete:
 *      summary: Delete a specific twin
 *      tags: [Twins]
 *      description: Use to delete one twin
 *      produces:
 *         - application/json
 *      parameters:
 *          - in: path
 *            name: twinId
 *            type: string
 *            required: true
 *            description: ID of the twin to delete.  
 *      responses:
 *         200:
 *           description: A sucessfull response
 *         400:
 *           description: Bad request
 */
router.delete("/:id", TwinController.deleteObject)

/**
 * @swagger
 * /twins/{twinId}/thing/{thingId}:
 *   post:
 *      summary: Create a new thing for the twin
 *      tags: [Twins]
 *      description: Use to create a new thing that is part of the selected twin.
 *      produces:
 *         - application/json
 *      parameters:
 *         - in: body
 *           name: Thing info
 *           description: It includes all the properties of the Ditto thing that we want to create.
 *           schema:
 *              $ref: '#/definitions/Thing'
 *         - in: path
 *           name: twinId
 *           type: string
 *           required: true
 *           description: ID of the twin.
 *         - in: path
 *           name: thingId
 *           type: string
 *           required: true
 *           description: ID of the new thingId.
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
router.post("/:twinId/thing/:thingId", TwinController.saveThingInTwin)

module.exports = router