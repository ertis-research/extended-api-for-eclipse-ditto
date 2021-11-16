const express = require('express')
const Router = express.Router
const PolicyController = require('../controllers/policy.controller.js')

const router = Router()

/**
 * @swagger
 * tags:
 *  name: Policies
 *  description: Get more information about your policies in ditto
 */

/**
 * @swagger
 * path:
 * /policies:
 *   get:
 *      summary: Get all policies
 *      tags: [Policies]
 *      description: Use to request all policies
 *      produces:
 *         -application/json
 *      responses:
 *         200:
 *           description: A sucessfull response
 *         400:
 *           description: Bad request
 */
router.get("/", PolicyController.getAll)

module.exports = router