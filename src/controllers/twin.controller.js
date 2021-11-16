const Twin = require('../models/twin.model.js')
const Thing = require('../models/thing.model.js')
const getController = require('./base.controller.js')
const axios = require('axios').default

const twinController = getController(Twin, "twinId")

const synchronizationTwins = async (req, res) => {
    try {
        const allNamespaces = await Thing.distinct("s2._namespace", {"s2.__lifecycle" : "ACTIVE"})
        const allTwins = await Twin.distinct("twinId")

        allNamespaces.forEach((namespace) => {
            if(!allTwins.includes(namespace)) {
                Twin.create({
                    twinId : namespace,
                    name : namespace
                })
            }
        })

        const finalTwins = await Twin.distinct("twinId")

        res.status(200).json(finalTwins)
    } catch (err) {
        res.status(400).json({
            message: err
        })
    }
}

const saveThingInTwin = async (req, res) => {
    const twinId = req.params.twinId
    const thingId = req.params.thingId
    const body = req.body

    if(thingId.includes(":")){
        return res.status(400).json({
            message: "Only the name of the thing is required. Do not include the namespace, it will be added automatically."
        })
    }

    try {
        
        const newThing = {
            policyId: body.policyId,
            definition: body.definition,
            attributes: body.attributes,
            features : body.features
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
    ...twinController,
    synchronization : synchronizationTwins,
    saveThingInTwin : saveThingInTwin
}