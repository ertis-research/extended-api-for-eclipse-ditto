/**
 * @fileoverview Methods that interact with Eclipse Ditto with respect to the Thing entity.
 * @author Julia Robles <juliarobles@uma.es>
*/

import { executePOST, executePATCH, executeDELETE, executeGET, executePUT } from './requests_for_ditto'
import { queryAllThings, queryParent, queryChildren, queryRootThings, queryThingWithId, querySpecificParent, countThingWithId, queryThings } from './queries'
import { AllAttributesCannotBeRemovedResponse, BodyCannotBeEmptyResponse, NoDeletionChildrenInTypes, NotParentResponse, RestrictedAttributesResponse, SuccessfulResponse, SuccessfulUnlinkResponse, ThingDoesNotExistResponse, addMessageIfStatusIsNotCorrect, modifyResponseList, modifyResponseThing, statusIsCorrect } from './responses';
import { DittoThing, RequestResponse } from '../types';
import { hasRestrictedAttributes, copyRestrictedAttributes, getParentAttribute, initAttributes, sameParent, setNullValuesOfFeatures, setParent, removeRestrictedAttributesForThing } from '../attributes/functions';
import { attCopyOf, attParent } from '../attributes/consts';




// ---------------------------------------------------------------------------------------------------------------------------------------
// Auxiliary functions only valid for these methods
// ---------------------------------------------------------------------------------------------------------------------------------------

/**
 * Merge two objects recursively (all shared keys that have an object value will also be merged)
 * @param target Object where keys of the other object will be copied to
 * @param source Object from which the keys will be extracted to be copied (if there are duplicate keys, this object will take precedence)
 * @returns The object resulting from merging the two objects
 */
const merge = (target: any, source: any) => {
    // Check if the property is also an object to copy it iteratively
    for (const key of Object.keys(source)) {
        if (source[key] instanceof Object) Object.assign(source[key], merge(target[key], source[key]))
    }
    // Combines the output object with the input object
    Object.assign(target || {}, source)
    return target
}


/**
 * Returns the name part of the thingId.
 * @param thingId ThingId to extract the name from
 * @returns Name part of the thingId
 */
const getNameInThingId = (thingId: string): string => {
    const split = thingId.split(":")
    return (split.length > 1) ? split[1] : thingId
}


/**
 * Checks if a thing exists in Eclipse Ditto. 
 * To do this it makes a query in Eclipse Ditto to find the number of things with the given thingId (should be at most one). 
 * If the number is greater than 0, it returns true. False otherwise.
 * @param thingId ThingId to check
 * @param isType Determines whether the thing search is about types (true) or twins (false)
 * @returns True if the thing exists, false otherwise. If the request fails, returns the full response.
 */
const checkThingExists = async (thingId: string, isType: boolean): Promise<boolean | RequestResponse> => {
    const response = await executeGET(countThingWithId(thingId, isType))
    if (statusIsCorrect(response.status)) {
        const num = Number(response.message)
        return num > 0
    } else {
        return response
    }
}




// ---------------------------------------------------------------------------------------------------------------------------------------
// GET requests - To obtain one or more things
// ---------------------------------------------------------------------------------------------------------------------------------------

/**
 * Execute a GET request in Eclipse Ditto to get all types or twins, depending on the isType parameter, that have no parent (called root things)
 * @param isType Determines whether the thing search is about types (true) or twins (false)
 * @param options Allows you to add any other option supported by Eclipse Ditto
 * @returns Eclipse Ditto's response to the request. If successful, all types or twins, depending on isType, that have no parent (called root things) 
 */
export const getAllRootThings = async (isType: boolean, options: string = ""): Promise<RequestResponse> => {
    if (options !== "") options = "&option=" + options
    return modifyResponseList(await executeGET(queryRootThings(isType, options)))
}


/**
 * Run a GET request in Eclipse Ditto to get all types or twins, depending on the isType parameter. It also includes those that have parent.
 * @param isType Determines whether the thing search is about types (true) or twins (false)
 * @param options Allows you to add any other option supported by Eclipse Ditto
 * @returns Eclipse Ditto's response to the request. If successful, all types or twins, depending on isType
 */
export const getAllThings = async (isType: boolean, options: string = ""): Promise<RequestResponse> => {
    if (options !== "") options = "&option=" + options
    return modifyResponseList(await executeGET(queryAllThings(isType, options)))
}


/**
 * Execute a GET request in Eclipse Ditto to get the data of a specific type or twin to be searched from its ThingId.
 * @param thingId ThingId to find
 * @param options Allows you to add any other option supported by Eclipse Ditto
 * @returns Eclipse Ditto's response to the request. If successful, the data of the thing with the indicated ThingId
 */
export const getThing = async (thingId: string, isType: boolean): Promise<RequestResponse> => {
    return modifyResponseThing(await executeGET(queryThingWithId(thingId, isType)))
}


/**
 * Execute a GET request in Eclipse Ditto to get the data of all the children of a thing. If there are more than a maximum, it also returns a cursor to get the rest.
 * @param thingId ThingId of the parent
 * @param isType Determines whether the thing search is about types (true) or twins (false)
 * @param options Allows you to add any other option supported by Eclipse Ditto
 * @returns Eclipse Ditto's response to the request. If successful, the data of the children belonging to the thing
 */
export const getChildren = async (thingId: string, isType: boolean, options: string = ""): Promise<RequestResponse> => {
    if (options !== "") options = "&option=" + options
    return modifyResponseList(await executeGET(queryChildren(thingId, isType, options)))
}


/**
 * Execute a GET request in Eclipse Ditto to get the data of all the children of a thing. It returns them all, querying the possible cursors it finds recursively.
 * @param thingId ThingId of the parent
 * @param isType Determines whether the thing search is about types (true) or twins (false)
 * @returns Eclipse Ditto's response to the request. If successful, the data of the children belonging to the thing
 */
export const getAllChildrenOfThing = async (thingId: string, isType: boolean, options: string = ""): Promise<RequestResponse> => {
    let res = modifyResponseList(await executeGET(queryChildren(thingId, isType, "&option=size(200)" + options)))
    if (res.message.hasOwnProperty("cursor")) {
        let children = res.message.items
        while (res.message.hasOwnProperty("cursor")) {
            res = modifyResponseList(await executeGET(queryChildren(thingId, isType, "&option=size(200)" + options + ",cursor(" + res.message.cursor + ")")), true)
            children = children.concat(res.message.items)
        }
        return {
            status: res.status,
            message: children
        }
    }
    return res
}

/**
 * Execute a GET request in Eclipse Ditto to get the thingId of all the children of a thing. It returns them all, querying the possible cursors it finds recursively.
 * @param thingId ThingId of the parent
 * @param isType Determines whether the thing search is about types (true) or twins (false)
 * @returns Eclipse Ditto's response to the request. If successful, the data of the children belonging to the thing
 */
export const getAllChildrenOfThingOnlyIdAndParent = async (thingId: string, isType: boolean): Promise<RequestResponse> => {
    return await getAllChildrenOfThing(thingId, isType, "&fields=thingId,attributes/" + attParent)
}


/**
 * Execute a GET request in Eclipse Ditto to get all the parents of a thing.
 * @param thingId ThingId of the child
 * @param isType Determines whether the thing search is about types (true) or twins (false)
 * @returns Eclipse Ditto's response to the request. If successful, the data of the parents of the thing.
 */
export const getAllParentOfThing = async (thingId: string, isType: boolean): Promise<RequestResponse> => {
    return await executeGET(queryParent(thingId, isType))
}




// ---------------------------------------------------------------------------------------------------------------------------------------
// PUT requests - To create or update thing
// ---------------------------------------------------------------------------------------------------------------------------------------

/**
 * Execute a POST request in Eclipse Ditto to create a twin or type without specifying its ThingId (one will be generated randomly)  
 * The special attributes will be initialized with their default values or with those given in the parameters
 * Checks that the body does not contain restricted attributes (if present, an error will be returned)
 * @param body Thing entity scheme
 * @param isType Determines whether the thing is a type (true) or a twin (false)
 * @param type If it is a twin created from a type, it would indicate the identifier of that type.
 * @param parent If the thing is part of a composite thing, the identifiers of its parents are indicated. A type may have more than one parent, while a twin may have only one.
 * @returns 
 */
export const createThingWithoutSpecificId = async (body: DittoThing, isType: boolean, type?: string, parent?: string): Promise<RequestResponse> => {
    if (hasRestrictedAttributes(body)) return RestrictedAttributesResponse
    if (body != null) body = initAttributes(body, isType, type, parent)
    return modifyResponseThing(await executePOST(queryThings, body))
}


/**
 * Private method 
 * Sets the new parent of a thing through a PATCH request in Eclipse Ditto
 * If it is a type, a new parent is added to the list with the specified number
 * If it is a twin, the old parent (if any) is replaced by the new one
 * @param thingId ThingId of the thing you want to update
 * @param parentId 
 * @param isType Determines whether the thing is a type (true) or a twin (false)
 * @param response 
 * @param numChild 
 * @returns 
 */
const setParentOfThing = async (thingId: string, isType: boolean, parentId: string, response: RequestResponse, numChild: number = 1): Promise<RequestResponse> => {
    const responsePATCH = (!isType) ? await executePATCH(queryParent(thingId, isType), '"' + parentId + '"') : await executePATCH(querySpecificParent(thingId, parentId), numChild.toString()) //Puede que sea necesario ponerle "" entre parentId
    return addMessageIfStatusIsNotCorrect(responsePATCH, response, "Error setting " + parentId + " as parent of thing:\n" + responsePATCH.message)
}


/**
 * Update a thing. 
 * You can update only its composition relation, only its schema, or both at the same time. 
 * You can also create a new thing, which may already be related to their parents.
 * If the thing is related to a new parent: if a twin it will replace the old parent and if a type it will be added to the list of parents.
 * It does not allow to unlink the thing from its parent (there are specific functions for that).
 * @param thingId ThingId of the thing you want to update
 * @param isType Determines whether the thing is a type (true) or a twin (false)
 * @param body Changes to be applied to the scheme of the thing
 * @param type If it is a twin created from a type, it would indicate the identifier of that type.
 * @param newParentId 
 * @param numChild 
 * @returns 
 */
export const updateThing = async (thingId: string, isType: boolean, body?: DittoThing, type?: string, newParentId?: string, numChild: number = 1): Promise<RequestResponse> => {
    let finalResponse = Object.assign({}, SuccessfulResponse)

    if (body && Object.keys(body).length > 0) {
        if (hasRestrictedAttributes(body)) return RestrictedAttributesResponse
        let thing: DittoThing = {}
        const response = await executeGET(queryThingWithId(thingId, isType))
        if (statusIsCorrect(response.status)) {
            // Set the new data of the thing, keeping the restricted attributes it had
            thing = copyRestrictedAttributes(response.message, body)

            // If a new parent has been given and it is different from one it already had, it is configured (replaced in case of twin, added in case of type)
            if (newParentId && !sameParent(thing, newParentId, isType, numChild)) {
                setParent(thing, newParentId, isType, numChild)
            }
        } else {
            thing = initAttributes(body, isType, type, newParentId, numChild)
        }

        // Update or create the thing in Eclipse Ditto
        let responsePut = await executePUT(queryThingWithId(thingId, isType), thing)
        return modifyResponseThing(responsePut)

    } else if (newParentId) {
        return setParentOfThing(thingId, isType, newParentId, finalResponse, numChild)
    }

    return BodyCannotBeEmptyResponse
}


/**
 * Update the parent of the thing childId. If the child does not exist, create it with the given body.
 * The new parent will be the thingId. 
 * In case of types, it will be added to the list with the number numChild. 
 * In case of twins, the old parent (if any) will be replaced by the new one. 
 * @param thingId ThingId of the parent
 * @param isType Determines whether the thing is a type (true) or a twin (false)
 * @param childId ThingId of the child
 * @param body Changes to be applied to the scheme of the thing
 * @param numChild 
 * @returns 
 */
export const updateThingAndHisParent = async (thingId: string, isType: boolean, childId: string, body?: DittoThing, numChild: number = 1): Promise<RequestResponse> => {
    const checkParent = await checkThingExists(thingId, isType)
    if (checkParent) {
        return await updateThing(childId, isType, body, undefined, thingId, numChild)
    } else if (checkParent === false) {
        return ThingDoesNotExistResponse
    } else {
        return checkParent as RequestResponse
    }
}


/**
 * Execute a PATCH request in Eclipse Ditto to merge the content given in the body with the thing data
 * Updating special attributes and elimination of the attributes section is not allowed
 * @param thingId ThingId of the thing you want to update
 * @param body Changes to be applied to the scheme of the thing
 * @param isType Determines whether the thing is a type (true) or a twin (false)
 * @returns Eclipse Ditto's response to the request
 */
export const patchThing = async (thingId: string, body: DittoThing, isType: boolean): Promise<RequestResponse> => {
    if (hasRestrictedAttributes(body)) return RestrictedAttributesResponse
    if (body.attributes == null) return AllAttributesCannotBeRemovedResponse
    return modifyResponseThing(await executePATCH(queryThingWithId(thingId, isType), body))
}


/**
 * Duplicate a thing without taking into account its composition relations 
 * In any case the new thing is a twin
 * If the duplicated thing is a type, the twin will be considered as an instance of it
 * If the duplicated thing is a twin, the twin is considered to be a copy of it
 * @param thingId ThingId of the thing to be copied
 * @param isType Determines whether the thing to copy is a type (true) or a twin (false)
 * @param newThingId ThingId to be assigned to the created thing
 * @param dataToCopy Data of the thing to be copied. This parameter helps to avoid unnecessary queries
 * @param dataToMerge Data to be merged with the scheme of the copied thing, if any
 * @param parentId ThingId of the parent of the new thing, if any
 * @returns Eclipse Ditto's response to the request for twin creation
 */
const duplicateSingleThing = async (thingId: string, isType: boolean, newThingId: string, dataToCopy: DittoThing, dataToMerge?: DittoThing, parentId?: string): Promise<RequestResponse> => {
    if (dataToMerge && hasRestrictedAttributes(dataToMerge)) return RestrictedAttributesResponse
    let thingData = { ...dataToCopy }

    // If the data of the thing to duplicate is not available, a query is made to Eclipse Ditto to obtain it
    // This IF should not be activated when duplicating recursively, it is only set to get the data if it is called from another function that does not provide it
    if (Object.keys(thingData).length === 0) {
        let getThingResponse = await getThing(thingId, isType)
        if (statusIsCorrect(getThingResponse.status)) {
            thingData = getThingResponse.message
        } else {
            return getThingResponse
        }
    }

    // Merge data and prepare thing data to create it
    thingData = removeRestrictedAttributesForThing(thingData)
    if (dataToMerge) thingData = merge(thingData, dataToMerge)
    thingData = setNullValuesOfFeatures(thingData)
    if (thingData.thingId) delete thingData.thingId

    // If the copied thing is a type and the final thing is a twin, then it has been instantiated and must be indicated in the corresponding attribute
    let type = undefined
    if (isType) {
        type = thingId
    } else {
        if (!thingData.attributes) thingData.attributes = {}
        thingData.attributes[attCopyOf] = thingId
    }

    //This function only creates twins, not types. That's why the isType is always false
    return await updateThing(newThingId, false, thingData, type, parentId)
}


/**
 * Duplicate a thing taking into account its composition relations, i.e. recursively copy both the thing and all its children
 * In any case the new thing is a twin
 * If the duplicated thing is a type, the twin will be considered as an instance of it
 * If the duplicated thing is a twin, the twin is considered to be a copy of it
 * @param thingId ThingId of the thing to be copied
 * @param isType Determines whether the thing to copy is a type (true) or a twin (false)
 * @param newThingId ThingId to be assigned to the created thing
 * @param dataToCopy Data of the thing to be copied. This parameter helps to avoid unnecessary queries
 * @param dataToMerge Data to be merged with the scheme of the copied thing, if any
 * @param parentId ThingId of the parent of the new thing, if any
 * @returns Eclipse Ditto's response to the request
 */
const duplicateThingRecursive = async (thingId: string, isType: boolean, newThingId: string, dataToCopy?: DittoThing, dataToMerge?: DittoThing, parentId?: string): Promise<RequestResponse> => {
    let thingData = (dataToCopy) ? { ...dataToCopy } : {}

    // If the data of the thing to duplicate is not available, a query is made to Eclipse Ditto to obtain it
    if (Object.keys(thingData).length === 0) {
        let getThingResponse = await getThing(thingId, isType)
        if (statusIsCorrect(getThingResponse.status)) {
            thingData = getThingResponse.message
        } else {
            return getThingResponse
        }
    }

    // As multiple requests will be made to Eclipse Ditto, their responses will be merged into a single response
    let finalResponse = Object.assign({}, SuccessfulResponse)

    // We create the twin from the thing, mixing the given data if any and associating it with its parent if any
    let responseUpdate = await duplicateSingleThing(thingId, isType, newThingId, thingData, dataToMerge, parentId)
    finalResponse = addMessageIfStatusIsNotCorrect(responseUpdate, finalResponse, responseUpdate.message)

    // The children are obtained
    let childrenRequest = await getAllChildrenOfThing(thingId, isType)
    let children: DittoThing[] = childrenRequest.message

    // I create twins for all the children, considering that if I am working with types I can have more than one child with the same scheme
    for (let child of children) {
        const parents: any = getParentAttribute(child)
        const num: number = (isType && parents.hasOwnProperty(thingId)) ? parents[thingId] : 1
        for (let i = 0; i < num; i++) {
            const childThingId = (child.thingId) ? child.thingId : "" // This is only because otherwise it complains that it may be undefined, but it should never be undefined in this case
            let newId = parentId + ":" + getNameInThingId(childThingId)
            newId = (num > 1) ? (newId + '_' + (i + 1)) : newId

            const response = await duplicateThingRecursive(childThingId, isType, newId, child, undefined, newThingId)
            finalResponse = addMessageIfStatusIsNotCorrect(response, finalResponse, response.message)
        }
    }

    return finalResponse
}


/**
 * Create a new thing (newThingId) in Eclipse Ditto by duplicating the data of another thing (thingId) 
 * If a body is received, it also mixes the given data with the schema of the original twin
 * @param thingId ThingId of the thing you want to update
 * @param newThingId ThingId that will have the duplicate thing
 * @param data Changes to be applied to the scheme of the new thing
 * @param isType Determines whether the thing is a type (true) or a twin (false)
 * @returns Eclipse Ditto's response to the request
 */
export const duplicateThing = async (thingId: string, isType: boolean, newThingId: string, data: DittoThing): Promise<RequestResponse> => {
    return await duplicateThingRecursive(thingId, isType, newThingId, undefined, data)
}


/**
 * Private method
 * Execute a PATCH request in Eclipse Ditto to remove the parent-child relationship for a given parent on a child
 * In case of a twin, set the parents attribute to null
 * In case of a type, it sets the parent key inside the list to null
 * @param thingId ThingId of the thing you want to update
 * @param parentId ThingId of the parent
 * @param isType Determines whether the thing is a type (true) or a twin (false)
 * @param full_remove In case it is a type, if we want to delete the whole list of parents
 * @returns Eclipse Ditto's response to the request
 */
const removeParentOfThing = async (thingId: string, isType: boolean, parentId: string, full_remove: boolean = false): Promise<RequestResponse> => {
    const path = (!isType || full_remove) ? queryParent(thingId, isType) : querySpecificParent(thingId, parentId)
    const responsePATCH = await executePATCH(path, "null")
    return addMessageIfStatusIsNotCorrect(responsePATCH, responsePATCH,
        "Error deleting " + ((isType && !full_remove) ? (parentId + " as ") : "") + "parent of thing " + thingId + ": " + responsePATCH.message)
}


/**
 * Execute a PATCH request in Eclipse Ditto to unlink the specified child from the thing
 * @param parentId ThingId of the parent
 * @param childId ThingId of the child
 * @param isType Determines whether the thing is a type (true) or a twin (false)
 * @param childParentAttr The value of the parent attribute for the thing with childId. Allows to reduce calls to Eclipse Ditto.
 * @returns Eclipse Ditto's response to the request
 */
export const unlinkChildOfThing = async (parentId: string, childId: string, isType: boolean, childParentAttr?: DittoThing): Promise<RequestResponse> => {
    const responseParent: RequestResponse = (childParentAttr) ? { status: 200, message: "" } : await getAllParentOfThing(childId, isType)
    if (statusIsCorrect(responseParent.status)) {
        const parent = (childParentAttr) ? childParentAttr : responseParent.message
        if ((isType && parent && parent.hasOwnProperty(parentId)) || (!isType && parent === parentId)) {
            const full_remove = (!isType || Object.keys(parent).length < 2) ? true : false
            const response = await removeParentOfThing(childId, isType, parentId, full_remove)
            return (statusIsCorrect(response.status)) ? SuccessfulUnlinkResponse : response
        } else {
            return NotParentResponse(childId, parentId)
        }
    } else {
        return responseParent
    }
}


/**
 * Execute a PATCH request in Eclipse Ditto to unlink the given thing from all its parents
 * @param thingId ThingId of the thing you want to update
 * @param isType Determines whether the thing is a type (true) or a twin (false)
 * @returns Eclipse Ditto's response to the request
 */
export const unlinkAllParentOfThing = async (thingId: string, isType: boolean): Promise<RequestResponse> => {
    return await removeParentOfThing(thingId, isType, "", true)
}


/**
 * Execute a PATCH request in Eclipse Ditto to unlink the given thing from all its children
 * @param thingId ThingId of the thing you want to update
 * @param isType Determines whether the thing is a type (true) or a twin (false)
 * @returns Eclipse Ditto's response to the request
 */
export const unlinkAllChildrenOfThing = async (thingId: string, isType: boolean): Promise<RequestResponse> => {
    // As multiple requests will be made to Eclipse Ditto, their responses will be merged into a single response
    let finalResponse = Object.assign({}, SuccessfulResponse)

    const responseChildren = await getAllChildrenOfThingOnlyIdAndParent(thingId, isType)
    if (statusIsCorrect(responseChildren.status)) {
        const children: DittoThing[] = responseChildren.message
        if (children) {
            for (let child of children) {
                if (child.thingId) {
                    const responseUnlink = await unlinkChildOfThing(thingId, child.thingId, isType,
                        (child.attributes && child.attributes.hasOwnProperty(attParent)) ? child.attributes[attParent] : undefined)
                    finalResponse = addMessageIfStatusIsNotCorrect(responseUnlink, finalResponse, responseUnlink.message)
                }
            }
        }
        return finalResponse
    } else {
        return responseChildren
    }
}




// ---------------------------------------------------------------------------------------------------------------------------------------
// DELETE requests - To delete things
// ---------------------------------------------------------------------------------------------------------------------------------------

/**
 * Execute a DELETE request in Eclipse Ditto to delete indicated thing 
 * Before doing so, unlink it from all its children
 * If the unlink fails, the thing will not be deleted
 * @param thingId ThingId of the thing you want to delete
 * @param isType Determines whether the thing is a type (true) or a twin (false)
 * @returns Eclipse Ditto's responses to the requests
 */
export const deleteThingWithoutChildren = async (thingId: string, isType: boolean): Promise<RequestResponse> => {
    const responseUnlink = await unlinkAllChildrenOfThing(thingId, isType)

    if (statusIsCorrect(responseUnlink.status)) {
        const responseDELETE = await executeDELETE(queryThingWithId(thingId, isType))
        let finalResponse = addMessageIfStatusIsNotCorrect(responseDELETE, responseDELETE, "ERROR deleting thing " + thingId + ": " + responseDELETE.message)
        if (statusIsCorrect(finalResponse.status)) finalResponse.message = "Thing " + thingId + " deleted correctly without deleting their children."
        return finalResponse
    } else {
        return responseUnlink
    }
}


/**
 * Execute a DELETE request in Eclipse Ditto to delete indicated thing and all its children
 * This method IS ONLY VALID FOR TWINS (types can have several parents, so they are not suitable for cascading deletion)
 * @param thingId ThingId of the thing you want to delete
 * @param isType Determines whether the thing is a type (true) or a twin (false)
 * @returns Eclipse Ditto's responses to the requests
 */
export const deleteThingAndChildren = async (thingId: string, isType: boolean): Promise<RequestResponse> => {
    let finalResponse = Object.assign({}, SuccessfulResponse)
    if(isType) return NoDeletionChildrenInTypes

    // Delete all children recursively
    const responseChildren = await getAllChildrenOfThingOnlyIdAndParent(thingId, isType)
    if (statusIsCorrect(responseChildren.status)) {
        const children:DittoThing[] = responseChildren.message
        for (let child of children) {
            if(child.thingId){
                const response = await deleteThingAndChildren(child.thingId, isType)
                finalResponse = addMessageIfStatusIsNotCorrect(response, finalResponse, response.message)
            }
        }
    }

    // Delete the thing only if all its children have been successfully deleted
    if(statusIsCorrect(finalResponse.status)) {
        const responseDELETE = await executeDELETE(queryThingWithId(thingId, isType))
        finalResponse = addMessageIfStatusIsNotCorrect(responseDELETE, finalResponse, "ERROR deleting thing " + thingId + "\n")
        if (statusIsCorrect(finalResponse.status)) finalResponse.message = "Thing " + thingId + " and their children deleted correctly."
    }
    return finalResponse
}


