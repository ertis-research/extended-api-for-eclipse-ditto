/**
 * @fileoverview Response constants to be sent by the API and methods for modifying responses
 * @author Julia Robles <juliarobles@uma.es>
*/

import { restrictedAttributesToString } from '../attributes/consts';
import { removePrivateAttributesForListOfThings, removePrivateAttributesForThing } from '../attributes/functions';
import { RequestResponse } from '../types';




// ---------------------------------------------------------------------------------------------------------------------------------------
// Response constants
// ---------------------------------------------------------------------------------------------------------------------------------------

export const RestrictedAttributesResponse = {
    status: 442,
    message: "In the definition there is a restricted attribute, these cannot be created or updated.\nRestricted attributes: " + restrictedAttributesToString
}

/*
export const AllAttributesCannotBeRemovedResponse = {
    status: 442,
    message: "Not all attributes can be removed due to restricted attributes.: " + restrictedAttributesToString
}
*/

export const SuccessfulResponse = {
    status: 200,
    message: ""
}

export const SuccessfulUnlinkResponse = {
    status: 200,
    message: "The things have been correctly unlinked"
}

export const BodyCannotBeEmptyResponse = {
    status: 400,
    message: "To create a thing the body cannot be empty."
}

export const ThingDoesNotExistResponse = {
    status: 404,
    message: "The thing with the provided identifier does not exist in Eclipse Ditto."
}

export const ThingExistResponse = {
    status: 400,
    message: "The thing with the provided identifier already exist in Eclipse Ditto."
}

export const ThingDoesNotExistOrIncorrectIsTypeResponse = {
    status: 412,
    message: "The thing with the provided identifier does not correspond to the entity (type/twin) of the request or the thing does not exist."
}

export const ParentIsWrongEntityResponse = {
    status: 412,
    message: "The parent received with the provided identifier does not correspond to the entity (type/twin) of the request or the thing does not exist."
}

export const NoDeletionChildrenInTypes = {
    status: 400,
    message: "Children of type can't be deleted in cascade. If you want to delete the type, use the method that unlinks the children first."
}

export const NotParentResponse = (childId: string, parentId: string) => {
    return {
        status: 400,
        message: parentId + " is not parent of " + childId
    }
}




// ---------------------------------------------------------------------------------------------------------------------------------------
// Response methods
// ---------------------------------------------------------------------------------------------------------------------------------------

/**
 * Check if the status of the response is correct
 * @param status Status of the response
 * @returns True if correct, false if not
 */
export const statusIsCorrect = (status: number) => {
    return status >= 200 && status < 300
}


/**
 * Extra items from the response received by Eclipse Ditto
 * @param res Response to be dealt with
 * @returns Items included in the response
 */
export const getItems = (res:RequestResponse) => {
    if(!statusIsCorrect(res.status)) return res
    return (res.message.hasOwnProperty("items")) ? res.message.items : res.message
}


/**
 * Receive a response and check if it is correct. 
 * If not, it sets the status of the final response to the new one and adds the message sent by parameter. 
 * If it is correct, it returns the final response without modifying it.
 * @param response New response
 * @param finalResponse Final response
 * @param message Message to add if response is not correct
 * @returns Final response
 */
export const addMessageIfStatusIsNotCorrect = (response: RequestResponse, finalResponse: RequestResponse, message: string) => {
    if (response != null && !statusIsCorrect(response.status)) {
        finalResponse.status = (response.status == finalResponse.status || finalResponse.status == 200) ? response.status : 500
        finalResponse.message += message
    }
    return finalResponse
}


/**
 * Method used when Eclipse Ditto returns a list. 
 * It removes the private attributes of all the elements of the list, taking into account that if we are working with cursors the list will be contained in a key named items.
 * @param response Response to be dealt with
 * @param cursor True if we are dealing with list with cursors. Otherwise, false.
 * @returns Response modified by removing private attributes from all items in list
 */
export const modifyResponseList = (response: RequestResponse, cursor: boolean = false) => {
    console.log("[Modify response list] Dealing with the response...")
    if (statusIsCorrect(response.status)) {
        console.log("[Modify response list] Removing private attributes...")
        let items = removePrivateAttributesForListOfThings(response.message)
        if (response.message.hasOwnProperty("cursor") || cursor) {
            response.message.items = items
        } else {
            response.message = items
        }
        console.log("[Modify response list] Successfully modified response")
    }
    return response
}


/**
 * If the response is correct, it returns it with the private attributes removed. If not correct, it returns it unchanged.
 * @param response Response to check
 * @returns If correct, the response without private attributes, otherwise the response itself
 */
export const modifyResponseThing = (response: RequestResponse) => {
    if (statusIsCorrect(response.status)) {
        response.message = removePrivateAttributesForThing(response.message)
    }
    return response
}
