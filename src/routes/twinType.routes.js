const express = require('express')
const Router = express.Router
const TwinTypeController = require('../controllers/twinType.controller.js')

const router = Router()

/**
 * @swagger
 * definitions:
 *     ThingList:
 *          type: object
 *          properties:
 *              thingTypeId:
 *                  type: string
 *              number:
 *                  type: integer
 */

/**
 * @swagger
 * definitions:
 *     TwinType:
 *      type: object
 *      properties:
 *          twinTypeId:
 *              type: string
 *          name:
 *              type: string
 *          description:
 *              type: string
 *          image:
 *              type: string
 *          things:
 *              type: array
 *              items: 
 *                  $ref: '#/definitions/ThingList'
 */

/**
 * @swagger
 * tags:
 *  name: TwinTypes
 *  description: Types of Twins
 */

/**
 * @swagger
 * /twintypes:
 *   get:
 *      summary: Get all twin types
 *      tags: [TwinTypes]
 *      description: Use to request all twin types
 *      produces:
 *         - application/json
 *      responses:
 *         200:
 *           description: A sucessfull response
 *         400:
 *           description: Bad request
 */
router.get("/", TwinTypeController.getAll)

/**
 * @swagger
 * /twintypes:
 *   post:
 *      summary: Create a new type of twin
 *      tags: [TwinTypes]
 *      description: Use to create a new type of twin
 *      produces:
 *         - application/json
 *      parameters:
 *         - in: body
 *           name: TwinType info
 *           description: The information of the twin type
 *           schema:
 *              $ref: '#/definitions/TwinType'
 *      responses:
 *         200:
 *           description: A sucessfull response
 *         500:
 *           description: Internal Server Error
 */
router.post("/", TwinTypeController.saveObject)

/**
 * @swagger
 * /twinTypes/{twinTypeId}:
 *   get:
 *      summary: Get a specific type of twin
 *      tags: [TwinTypes]
 *      description: Use to request one type of twin
 *      produces:
 *         - application/json
 *      parameters:
 *          - in: path
 *            name: twinTypeId
 *            type: string
 *            required: true
 *            description: ID of the twintype to get.  
 *      responses:
 *         200:
 *           description: A sucessfull response
 *         400:
 *           description: Bad request
 */
router.get("/:id", TwinTypeController.getObject)

/**
 * @swagger
 * /twintypes/{twinTypeId}:
 *   put:
 *      summary: Update a specific type of twin
 *      tags: [TwinTypes]
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
router.put("/:id", TwinTypeController.updateObject)

/**
 * @swagger
 * /twintypes/{twinTypeId}:
 *   delete:
 *      summary: Delete a specific type of twin
 *      tags: [TwinTypes]
 *      description: Use to delete one type of twin
 *      produces:
 *         - application/json
 *      parameters:
 *          - in: path
 *            name: twinTypeId
 *            type: string
 *            required: true
 *            description: ID of the twintype to delete.  
 *      responses:
 *         200:
 *           description: A sucessfull response
 *         400:
 *           description: Bad request
 */
router.delete("/:id", TwinTypeController.deleteObject)

/**
 * @swagger
 * /twintypes/{twinTypeId}/twin/{twinId}:
 *   post:
 *      summary: Create a new twin from a type
 *      tags: [TwinTypes]
 *      description: Use to create a new twin with the same properties as the selected type.
 *      produces:
 *         - application/json
 *      parameters:
 *         - in: body
 *           name: Twin info
 *           description: In the body you can modify properties of the twin that do not match the type without having to update it. For example, if a type has an assigned name and we want to generate a Twin with all the properties of the type but with a different name, we can modify it directly.
 *           schema:
 *              $ref: '#/definitions/Twin'
 *         - in: path
 *           name: twinTypeId
 *           type: string
 *           required: true
 *           description: ID of the twinType selected
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
router.post("/:twinTypeId/twin/:twinId", TwinTypeController.saveTwinFromType)

module.exports = router