// IMPORTS
// ------------------------------------------------------------------------
const {
    getAllRootThings,
    createThingWithoutSpecificId,
    getThing,
    updateThing,
    patchThing,
    deleteThingWithoutChildren,
    deleteThingAndChildren,
    updateThingAndHisParent,
    getChildren,
    getAllChildrenOfThing,
    getAllParentOfThing,
    unlinkAllParentOfThing,
    unlinkAllChildrenOfThing,
    duplicateThing,
    duplicateThingKeepHide
} = require('../auxiliary/api_calls/dittoThing.js')


// REQUESTS
// ------------------------------------------------------------------------

const isType = false

const twinController = {

    //-------------------
    // /twins
    //-------------------
    getRootTwins: async (req, res) => {
        const options = (req.query.hasOwnProperty("option")) ? req.query.option : ""
        response = await getAllRootThings(isType, options)
        res.status(response.status || 500).json(response.message)
    },

    postTwin: async (req, res) => {
        const body = req.body
        response = await createThingWithoutSpecificId(body, isType, null, null)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /twins/{twinId}
    //-------------------

    getTwinById: async (req, res) => {
        const twinId = req.params.twinId
        response = await getThing(twinId, isType)
        res.status(response.status || 500).json(response.message)
    },

    putTwinById: async (req, res) => {
        const body = req.body
        const twinId = req.params.twinId
        response = await updateThing(twinId, body, isType, null)
        res.status(response.status || 500).json(response.message)
    },

    patchTwinById: async (req, res) => {
        const body = req.body
        const twinId = req.params.twinId
        response = await patchThing(twinId, body, isType)
        res.status(response.status || 500).json(response.message)
    },

    deleteOnlyTwinById: async (req, res) => {
        const twinId = req.params.twinId
        response = await deleteThingWithoutChildren(twinId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /twins/{twinId}/children
    //-------------------

    getChildrenOfTwinById: async (req, res) => {
        const twinId = req.params.twinId
        const options = (req.query.hasOwnProperty("option")) ? req.query.option : ""
        response = (options == "") ? await getAllChildrenOfThing(twinId, isType) : await getChildren(twinId, isType, options)
        res.status(response.status || 500).json(response.message)
    },

    deleteTwinWithChildrenById: async (req, res) => {
        const twinId = req.params.twinId
        response = await deleteThingAndChildren(twinId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /twins/{twinId}/children/{childId}
    //-------------------

    putChildrenOfTwin: async (req, res) => {
        const body = req.body
        const twinId = req.params.twinId
        const childId = req.params.childId
        response = await updateThingAndHisParent(twinId, childId, body, isType, null)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /twins/{twinId}/children/unlink
    //-------------------

    unlinkAllChildrenOfTwin: async (req, res) => {
        const twinId = req.params.twinId
        response = await unlinkAllChildrenOfThing(twinId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /twins/{twinId}/parent
    //-------------------

    getParentOfTwin: async (req, res) => {
        const twinId = req.params.twinId
        response = await getAllParentOfThing(twinId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /twins/{twinId}/parent/unlink
    //-------------------

    unlinkParentAndTwin: async (req, res) => {
        const twinId = req.params.twinId
        response = await unlinkAllParentOfThing(twinId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /twins/{twinId}/duplicate/{newId}
    //-------------------

    duplicateTwin: async (req, res) => {
        const twinId = req.params.twinId
        const copyId = req.params.copyId
        const body = req.body
        response = await duplicateThing(twinId, copyId, body, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /twins/{twinId}/duplicate/{newId}/keepHiddenFields
    //-------------------

    duplicateTwinKeepHiddenFields: async (req, res) => {
        const twinId = req.params.twinId
        const copyId = req.params.copyId
        const body = req.body
        response = await duplicateThingKeepHide(twinId, copyId, body, isType)
        res.status(response.status || 500).json(response.message)
    }
}

module.exports = twinController