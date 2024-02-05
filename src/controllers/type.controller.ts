/**
 * @fileoverview API controller for types
 * @author Julia Robles <juliarobles@uma.es>
*/

import { Request, Response } from "express"
import { createThingWithoutSpecificId, deleteThingWithoutChildren, duplicateThing, fixCompositionality, getAllChildrenOfThing, getAllParentOfThing, getAllRootThings, getAllThings, getChildren, getThing, patchThing, unlinkAllChildrenOfThing, unlinkAllParentOfThing, unlinkChildOfThing, updateThing } from "../auxiliary/api_calls/dittoThing"




// For all controller methods, the isType variable will be true because we are working with types
const isType = true

export const typeController = {

    //-------------------
    // /types
    //-------------------

    getRootTypes: async (req: Request, res: Response) => {
        // #swagger.tags = ['Types']
        const options: string = (req.query.hasOwnProperty("option")) ? req.query.option as string : ""
        const response = await getAllRootThings(isType, options)
        res.status(response.status || 500).json(response.message)
    },

    getAllTypes: async (req: Request, res: Response) => {
        // #swagger.tags = ['Types']
        const options: string = (req.query.hasOwnProperty("option")) ? req.query.option as string : ""
        const response = await getAllThings(isType, options)
        res.status(response.status || 500).json(response.message)
    },

    postType: async (req: Request, res: Response) => {
        // #swagger.tags = ['Types']
        const body = req.body
        const response = await createThingWithoutSpecificId(body, isType)
        res.status(response.status || 500).json(response.message)
    },


    //-------------------
    // /fix
    //-------------------
    fix: async (req: Request, res: Response) => {
        // #swagger.tags = ['Types']
        console.log("PUT fix types - " + req)

        let response = await fixCompositionality(isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /types/{typeId}
    //-------------------

    getTypeById: async (req: Request, res: Response) => {
        // #swagger.tags = ['Types']
        const typeId = req.params.typeId
        const response = await getThing(typeId, isType)
        res.status(response.status || 500).json(response.message)
    },

    putTypeById: async (req: Request, res: Response) => {
        // #swagger.tags = ['Types']
        const body = req.body
        const typeId = req.params.typeId
        const response = await updateThing(typeId, isType, body)
        res.status(response.status || 500).json(response.message)
    },

    patchTypeById: async (req: Request, res: Response) => {
        // #swagger.tags = ['Types']
        const body = req.body
        const typeId = req.params.typeId
        const response = await patchThing(typeId, body, isType)
        res.status(response.status || 500).json(response.message)
    },

    deleteTypeById: async (req: Request, res: Response) => {
        // #swagger.tags = ['Types']
        const typeId = req.params.typeId
        const response = await deleteThingWithoutChildren(typeId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /types/{typeId}/children
    //-------------------

    getChildrenOfTypeById: async (req: Request, res: Response) => {
        // #swagger.tags = ['Types']
        const typeId = req.params.typeId
        const options = (req.query.hasOwnProperty("option")) ? req.query.option as string : ""
        const response = (options == "") ? await getAllChildrenOfThing(typeId, isType) : await getChildren(typeId, isType, options)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /types/{typeId}/children/{childId}/{numChild}
    //-------------------

    putChildrenOfType: async (req: Request, res: Response) => {
        // #swagger.tags = ['Types']
        const body = req.body
        const typeId = req.params.typeId
        const childId = req.params.childId
        const numChild = parseInt(req.params.numChild)
        if (isNaN(numChild)) {
            res.status(400).json("The number of children must be indicated by digits.")
        } else {
            const response = await updateThing(childId, isType, body, typeId, numChild)
            res.status(response.status || 500).json(response.message)
        }
    },

    //-------------------
    // /types/{typeId}/children/{childId}/unbind
    //-------------------
    unlinkOneChildrenOfType: async (req: Request, res: Response) => {
        // #swagger.tags = ['Types']
        const typeId = req.params.typeId
        const childId = req.params.childId
        const response = await unlinkChildOfThing(typeId, childId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /types/{typeId}/children/unlink
    //-------------------

    unlinkAllChildrenOfType: async (req: Request, res: Response) => {
        // #swagger.tags = ['Types']
        const typeId = req.params.typeId
        const response = await unlinkAllChildrenOfThing(typeId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /types/{typeId}/parent
    //-------------------

    getParentsOfType: async (req: Request, res: Response) => {
        // #swagger.tags = ['Types']
        const typeId = req.params.typeId
        const response = await getAllParentOfThing(typeId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /types/{typeId}/parent/unlink
    //-------------------

    unlinkAllParentsOfType: async (req: Request, res: Response) => {
        // #swagger.tags = ['Types']
        const typeId = req.params.typeId
        const response = await unlinkAllParentOfThing(typeId, isType)
        res.status(response.status || 500).json(response.message)
    },

    //-------------------
    // /types/{typeId}/create/{twinId}
    //-------------------

    createTwinFromType: async (req: Request, res: Response) => {
        // #swagger.tags = ['Types']
        const typeId = req.params.typeId
        const twinId = req.params.twinId
        const body = req.body
        const response = await duplicateThing(typeId, isType, twinId, body)
        res.status(response.status || 500).json(response.message)
    },



}