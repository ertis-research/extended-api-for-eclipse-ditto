const ThingType = require('../models/thingType.model.js')
const getController = require('./base.controller.js')
const axios = require('axios').default

const thingTypeController = getController(ThingType, "thingTypeId")

const saveThingFromType = async (req, res) => {
    const twinId = req.params.twinId
    const thingTypeId = req.params.thingTypeId
    const thingId = req.params.thingId
    const body = req.body

    if(thingId.includes(":")){
        return res.status(400).json({
            message: "Only the name of the thing is required. Do not include the namespace, it will be added automatically."
        })
    }

    try {
        const thingType = await ThingType.findOne({thingTypeId : thingTypeId})
        
        if (!thingType) {
            return res.status(404).json({
              message: "ThingType not found"
            })
        }

        var attributes = (thingType.attributes) ? thingType.attributes : {}
        var features = (thingType.features) ? thingType.features : {}
        
        if(!body.attributes && body.attributes !== {}) {
            attributes = (!attributes) ? body.attributes : Object.assign({}, attributes, body.attributes)
        }
        
        attributes = {
            thingTypeId : thingTypeId,
            ...attributes
        }
        
        if(!body.features && body.features !== {}) {
            features = (!features) ? body.features : Object.assign({}, features, body.features)
        }

        const newThing = {
            policyId: (!body.policyId) ? thingType.policyId : body.policyId,
            definition: body.definition,
            attributes: attributes,
            features : features
        }

        const token = Buffer.from(`${process.env.DITTO_USERNAME}:${process.env.DITTO_PASSWORD}`, 'utf8').toString('base64')

        const params = {
            headers: {
                'Authorization' : `Basic ${token}`,
                'Content-Type' : "application/json"
            }
        }

        const response = await axios.put(
            process.env.DITTO_URI_THINGS + twinId + ":" + thingId,
            newThing,
            params
        )

        res.status(response.status).json(response.data)
    } catch (err) {
        res.status(500).json({ message: err })
    }
}

module.exports = {
    ...thingTypeController, 
    saveThingFromType: saveThingFromType
}