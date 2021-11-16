const TwinType = require('../models/twinType.model.js')
const Twin = require('../models/twin.model.js')
const getController = require('./base.controller.js')

const twinTypeController = getController(TwinType, "twinTypeId")

const saveTwinFromType = async (req, res) => {
    const twinTypeId = req.params.twinTypeId
    const twinId = req.params.twinId
    const body = req.body

    if(!twinId){
        return res.status(400).json({
            message: "TwinId is required"
        })
    }

    try {
        const twinType = await TwinType.findOne({twinTypeId : twinTypeId})
        
        if (!twinType) {
            return res.status(404).json({
              message: "TwinType not found"
            })
        }

        var things = (twinType.things) ? twinType.things : {}
        
        if(!body.things && body.things !== {}) {
            things = (!things) ? body.things : Object.assign({}, things, body.things)
        }

        const newTwin = {
            twinId: twinId,
            name: (!body.name) ? twinType.name : body.name,
            twinTypeId: twinType.twinTypeId,
            description: (!body.description) ? twinType.description : body.description,
            image: (!body.image) ? twinType.image : body.image,
            things: things
        }

        const savedObject = await Twin.create(newTwin)
        res.status(200).json(savedObject)
    } catch (err) {
        res.status(500).json({ message: err })
    }
}

module.exports = {
    ...twinTypeController, 
    saveTwinFromType: saveTwinFromType
}