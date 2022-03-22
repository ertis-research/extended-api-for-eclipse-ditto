// IMPORTS
// ------------------------------------------------------------------------
const {
    rootGET,
    thingPOST,
    thingByIdGET,
    thingPUT,
    thingPATCH,
    childrenOfThingPUT,
    childrenOfThingGET,
    thingDELETE,
    thingAndChildrenDELETE,
} = require('./common.controller.js')


// REQUESTS
// ------------------------------------------------------------------------
const thingController = {
    getRootThings: async (req, res) => {
        await rootGET(req, res, false)
    },

    postThing: async (req, res) => {
        await thingPOST(req, res, false, null, {}, null)
    },

    getThingById: async (req, res) => {
        await thingByIdGET(req, res, false)
    },

    putThingById: async (req, res) => {
        await thingPUT(req, res, false, null, {}, null)
    },

    patchThingById: async (req, res) => {
        await thingPATCH(req, res)
    },

    deleteThingAndChildrenById: async (req, res) => {
        await thingAndChildrenDELETE(req, res, false)
    },

    deleteOnlyThingById: async (req, res) => {
        await thingDELETE(req, res, false)
    },

    putChildrenOfThing: async (req, res) => {
        await childrenOfThingPUT(req, res, false, null, {})
    },

    getChildrenOfThing: async (req, res) => {
        await childrenOfThingGET(req, res, false)
    },

    unbindChildOfThing: async (req, res) => {
        await unbindChildOfThingPATCH(req, res, false)
    }
}

module.exports = thingController