// IMPORTS
// ------------------------------------------------------------------------
const {
    deleteThingWithoutChildren,
    rootGET,
    thingPOST,
    thingByIdGET,
    thingPUT,
    thingPATCH,
    childrenOfThingPUT,
    childrenOfThingGET,
    thingDELETE
} = require('./common.controller.js')


// REQUESTS
// ------------------------------------------------------------------------
const typesController = {
    getRootTypes: async (req, res) => {
        await rootGET(req, res, true)
    },

    postType: async (req, res) => {
        await thingPOST(req, res, true, null, {}, null)
    },

    getTypeById: async (req, res) => {
        await thingByIdGET(req, res, true)
    },

    putTypeById: async (req, res) => {
        await thingPUT(req, res, true, null, {}, null)
    },

    patchTypeById: async (req, res) => {
        await thingPATCH(req, res, true)
    },

    deleteTypeById: async (req, res) => {
        await thingDELETE(req, res, true)
    },

    putChildrenOfType: async (req, res) => {
        await childrenOfThingPUT(req, res, true, null, {})
    },

    getChildrenOfType: async (req, res) => {
        await childrenOfThingGET(req, res, true)
    }
}

module.exports = typesController