/**
 * @fileoverview API controller for twins
 * @author Julia Robles <juliarobles@uma.es>
*/

import { Request, Response } from "express"
import { createThingWithoutSpecificId, deleteThingAndChildren, deleteThingWithoutChildren, duplicateThing, getAllChildrenOfThing, getAllParentOfThing, getAllRootThings, getChildren, getThing, patchThing, unlinkAllChildrenOfThing, unlinkAllParentOfThing, updateThing } from "../auxiliary/api_calls/dittoThing"




// For all controller methods, the isType variable will be false because we are working with twins
const isType = false

export const twinController = {

    //-------------------
    // /twins
    //-------------------
    getRootTwins: async (req: Request, res: Response) => {
        // #swagger.tags = ['Twins']
        console.log("GET root twins - " + req)

        const options: string = (req.query.hasOwnProperty("option")) ? req.query.option as string : ""
        let response = await getAllRootThings(isType, options)
        res.status(response.status || 500).json(response.message)
    },

    postTwin: async (req: Request, res: Response) => {
        // #swagger.tags = ['Twins']
        console.log("POST twin - " + req)

        const body = req.body
        let response = await createThingWithoutSpecificId(body, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /twins/{twinId}
    //-------------------

    getTwinById: async (req: Request, res: Response) => { 
        // #swagger.tags = ['Twins']
        console.log("GET twin - " + req)

        let response = await getThing(req.params.twinId, isType)
        res.status(response.status || 500).json(response.message)
    },

    putTwinById: async (req: Request, res: Response) => {
        // #swagger.tags = ['Twins']
        console.log("PUT twin - " + req)

        let response = await updateThing(req.params.twinId, isType, req.body)
        res.status(response.status || 500).json(response.message)
    },

    patchTwinById: async (req: Request, res: Response) => {
        // #swagger.tags = ['Twins']
        const body = req.body
        const twinId = req.params.twinId
        let response = await patchThing(twinId, body, isType)
        res.status(response.status || 500).json(response.message)
    },

    deleteOnlyTwinById: async (req: Request, res: Response) => {
        // #swagger.tags = ['Twins']
        const twinId = req.params.twinId
        const response = await deleteThingWithoutChildren(twinId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /twins/{twinId}/children
    //-------------------

    getChildrenOfTwinById: async (req: Request, res: Response) => {
        // #swagger.tags = ['Twins']
        const twinId = req.params.twinId
        const options = (req.query.hasOwnProperty("option")) ? req.query.option as string : ""
        let response = (options == "") ? await getAllChildrenOfThing(twinId, isType) : await getChildren(twinId, isType, options)
        res.status(response.status || 500).json(response.message)
    },

    deleteTwinWithChildrenById: async (req: Request, res: Response) => {
        // #swagger.tags = ['Twins']
        const twinId = req.params.twinId
        let response = await deleteThingAndChildren(twinId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /twins/{twinId}/children/{childId}
    //-------------------

    putChildrenOfTwin: async (req: Request, res: Response) => {
        // #swagger.tags = ['Twins']
        const body = req.body
        const twinId = req.params.twinId
        const childId = req.params.childId
        let response = await updateThing(childId, isType, body, undefined, twinId)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /twins/{twinId}/children/unlink
    //-------------------

    unlinkAllChildrenOfTwin: async (req: Request, res: Response) => {
        // #swagger.tags = ['Twins']
        const twinId = req.params.twinId
        let response = await unlinkAllChildrenOfThing(twinId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /twins/{twinId}/parent
    //-------------------

    getParentOfTwin: async (req: Request, res: Response) => {
        // #swagger.tags = ['Twins']
        const twinId = req.params.twinId
        let response = await getAllParentOfThing(twinId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /twins/{twinId}/parent/unlink
    //-------------------

    unlinkParentAndTwin: async (req: Request, res: Response) => {
        // #swagger.tags = ['Twins']
        const twinId = req.params.twinId
        let response = await unlinkAllParentOfThing(twinId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /twins/{twinId}/duplicate/{newId}
    //-------------------

    duplicateTwin: async (req: Request, res: Response) => {
        // #swagger.tags = ['Twins']
        const twinId = req.params.twinId
        const copyId = req.params.copyId
        const body = req.body
        let response = await duplicateThing(twinId, isType, copyId, body)
        res.status(response.status || 500).json(response.message)
    }

    
    //-------------------
    // /twins/{twinId}/duplicate/{newId}/keepHiddenFields
    //-------------------
    /*
    duplicateTwinKeepHiddenFields: async (req: Request, res: Response) => {
        const twinId = req.params.twinId
        const copyId = req.params.copyId
        const body = req.body
        let response = await duplicateThingKeepHide(twinId, copyId, body, isType)
        res.status(response.status || 500).json(response.message)
    }*/
}