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
    getAllChildrenOfThing,
    getAllParentOfThing,
    unlinkAllParentOfThing,
    unlinkAllChildrenOfThing,
    duplicateThing,
    unlinkChildOfThing
} = require('../auxiliary/api_calls/dittoThing.js')


// REQUESTS
// ------------------------------------------------------------------------

const isType = true

const typeController = {

    //-------------------
    // /types
    //-------------------
    getRootTypes: async (req, res) => {
        response = await getAllRootThings(isType)
        res.status(response.status || 500).json(response.message)
    },

    postType: async (req, res) => {
        const body = req.body
        response = await createThingWithoutSpecificId(body, isType, null, {}, {})
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /types/{typeId}
    //-------------------

    getTypeById: async (req, res) => {
        const typeId = req.params.typeId
        response = await getThing(typeId, isType)
        res.status(response.status || 500).json(response.message)
    },

    putTypeById: async (req, res) => {
        const body = req.body
        const typeId = req.params.typeId
        response = await updateThing(typeId, body, isType, null, {}, null)
        res.status(response.status || 500).json(response.message)
    },

    patchTypeById: async (req, res) => {
        const body = req.body
        const typeId = req.params.typeId
        response = await patchThing(typeId, body, isType)
        res.status(response.status || 500).json(response.message)
    },

    deleteTypeById: async (req, res) => {
        const typeId = req.params.typeId
        response = await deleteThingWithoutChildren(typeId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /types/{typeId}/children
    //-------------------

    getChildrenOfTypeById: async (req, res) => {
        const typeId = req.params.typeId
        response = await getAllChildrenOfThing(typeId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /types/{typeId}/children/{childId}
    //-------------------

    putChildrenOfType: async (req, res) => {
        const body = req.body
        const typeId = req.params.typeId
        const childId = req.params.childId
        response = await updateThingAndHisParent(typeId, childId, body, isType, null, {})
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /types/{typeId}/children/{childId}/unbind
    //-------------------
    unlinkOneChildrenOfType: async (req, res) => {
        const typeId = req.params.typeId
        const childId = req.params.childId
        response = await unlinkChildOfThing(typeId, childId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /types/{typeId}/children/unlink
    //-------------------

    unlinkAllChildrenOfType: async (req, res) => {
        const typeId = req.params.typeId
        response = await aunlinkAllChildrenOfThing(typeId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /types/{typeId}/parent
    //-------------------

    getParentsOfType: async (req, res) => {
        const typeId = req.params.typeId
        response = await getAllParentOfThing(typeId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /types/{typeId}/parent/unlink
    //-------------------

    unlinkAllParentsOfType: async (req, res) => {
        const typeId = req.params.typeId
        response = await unlinkAllParentOfThing(typeId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /types/{typeId}/create/{twinId}
    //-------------------

    createTwinFromType: async (req, res) => {
        const typeId = req.params.typeId
        const twinId = req.params.twinId
        const body = req.body
        response = await duplicateThing(typeId, twinId, body, isType)
        res.status(response.status || 500).json(response.message)
    }
}

module.exports = typeController