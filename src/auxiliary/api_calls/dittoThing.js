const { executePOST, executePATCH, executeDELETE, executeGET, executePUT } = require('./requests_for_ditto')
const { queryThings, queryParent, queryChildren, querySpecificChildren, queryRootThings, queryThingWithId, querySpecificParent } = require('./queries')
const { removeRestrictedAttributesForThing, getChildrenOfThing } = require('../attributes/functions')
const {
    checkForRestrictedAttributes, 
    copyRestrictedAttributes,
    restrictedAttributesToString,
    initAttributes,
    isParent,
    setParent,
    getParentAttribute
} = require('../attributes/functions')
const {
    RestrictedAttributesResponse,
    AllAttributesCannotBeRemovedResponse,
    SuccessfulResponse,
    SuccessfulUnlinkResponse,
    BodyCannotBeEmptyResponse,
    statusIsCorrect,
    addMessageIfStatusIsNotCorrect,
    modifyResponseList,
    modifyResponseThing
} = require('./responses')


// ---------------------------------------------
// AUX FUNCTION
// ---------------------------------------------
const isObject = (obj) => {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

const merge = (target, source) => {
    // Miramos si la propiedad es también un objeto para copiarla de forma iterativa
    for (const key of Object.keys(source)) {
      if (source[key] instanceof Object) Object.assign(source[key], merge(target[key], source[key]))
    }
    // Combina el objeto resultante con el objeto de entrada
    Object.assign(target || {}, source)
    return target
}

const getNameInThingId = (thingId) => {
    const split = thingId.split(":")
    return (split.length > 1) ? split[1] : thingId
}

const getChildrenAndParent = async (thingId, isType) => {
    const responseChildren = await getAllChildrenOfThing(thingId, isType)
    const responseParent = await getAllParentOfThing(thingId, isType)
    
    var childrenList = responseChildren.message
    childrenList = childrenList != null && childrenList != undefined && statusIsCorrect(responseChildren.status) && isObject(childrenList) ? childrenList : {}
    var parentId = statusIsCorrect(responseParent.status) ? responseParent.message : null

    return {
        parentId : parentId,
        childrenList : childrenList
    }
}

const addThingToChildrenList = async (thingId, parentId, isType, response) => {
    const responsePATCH = await executePATCH(querySpecificChildren(parentId, thingId, isType), "1")
    return addMessageIfStatusIsNotCorrect(responsePATCH, response, "Error adding the thing to the list of children of" + parentId + "\n")
}

const removeThingFromChildrenList = async (thingId, parentId, isType, response) => {
    const responsePATCH = await executePATCH(querySpecificChildren(parentId, thingId, isType), "null")
    return addMessageIfStatusIsNotCorrect(responsePATCH, response, "Error when removing the thing from the list of children of " + parentId + "\n")
}

const setParentOfThing = async (thingId, parentId, isType, response) => {
    const responsePATCH = (!isType) ? await executePATCH(queryParent(thingId, isType), '"' + parentId + '"') : await executePATCH(querySpecificParent(thingId, parentId), "1") //Puede que sea necesario ponerle "" entre parentId
    return addMessageIfStatusIsNotCorrect(responsePATCH, response, "Error setting " + parentId + " as parent of thing\n")
}

const removeParentOfThing = async (thingId, parentId, isType, response) => {
    const path = (!isType) ? queryParent(thingId, isType) : querySpecificParent(thingId, parentId)
    const responsePATCH = await executePATCH(path, "null")
    return addMessageIfStatusIsNotCorrect(responsePATCH, response, "Error deleting " + ((isType) ? parentId + " as" : "") + " parent of thing " + thingId)
}


// ---------------------------------------------
// GET
// ---------------------------------------------
const getAllRootThings = async (isType) => {
    return modifyResponseList(await executeGET(queryRootThings(isType)))
}

const getThing = async (thingId, isType) => {
    return modifyResponseThing(await executeGET(queryThingWithId(thingId, isType)))
}

const getAllChildrenOfThing = async (thingId, isType) => {
    return await executeGET(queryChildren(thingId, isType))
}

const getAllParentOfThing = async(thingId, isType) => {
    return await executeGET(queryParent(thingId, isType))
}


// ---------------------------------------------
// CREATE OR UPDATE
// ---------------------------------------------
const createThingWithoutSpecificId = async (data, isType, type, children, parent) => {  
    if(!checkForRestrictedAttributes) return RestrictedAttributesResponse //Comprobar que la definición no contiene atributos restringidos
    if(data != null) data = initAttributes(data, isType, type, children, parent) //Inicializar los atributos restringidos
    return modifyResponseThing(await executePOST(queryThings, data))
}

const updateThing = async (thingId, body, isType, type, children_default={}, parentId=null) => {
    var finalResponse = Object.assign({}, SuccessfulResponse)
    
    const onlySetFamily = body == null || body == undefined || Object.keys(body).length === 0 //Si no hay body (hay que actualizar solo el padre)
    const parentValue = (isType && parentId != null) ? {[parentId] : 1} : parentId

    if(!onlySetFamily && !checkForRestrictedAttributes(body)) return RestrictedAttributesResponse

    const responseGet = await executeGET(queryThingWithId(thingId, isType))
    if (statusIsCorrect(responseGet.status)) { //Si ya existe
        body = copyRestrictedAttributes(responseGet.message, body, isType, type, children_default, undefined) //Copio los atributos restringido que ya tenía en el nuevo body
        if(!isParent(body, parentId, isType)){ //Compruebo si el padre asignado y el nuevo son el mismo
            actual_parent = getParentAttribute(body)
            if(!isType && actual_parent != null) finalResponse = removeThingFromChildrenList(thingId, actual_parent, isType, finalResponse) //Si es un twin entonces elimino el thing de la lista de hijos del padre
            if(onlySetFamily){
                finalResponse = setParentOfThing(thingId, parentId, isType, finalResponse)
            } else {
                body = setParent(body, parentId, isType) //Seteo el padre para que se actualice con el PUT
            }
            finalResponse = addThingToChildrenList(thingId, parentId, isType, finalResponse) //Aniado el thingId a los hijos del padre
        }

    } else if(!onlySetFamily){ //Si no existe y hay body
            body = initAttributes(body, isType, type, children_default, parentValue) //Inicializo attributos restringidos
            if(parentValue != null) finalResponse = addThingToChildrenList(thingId, parentId, isType, finalResponse)
    } else {
        return BodyCannotBeEmptyResponse
    }

    if(!onlySetFamily){
        var responsePut = await executePUT(queryThingWithId(thingId, isType), body)
        responsePut = modifyResponseThing(responsePut)
        finalResponse = (statusIsCorrect(responsePut.status)) ? responsePut : addMessageIfStatusIsNotCorrect(responsePut, finalResponse, responsePut.message)
    }

    return finalResponse
}

const patchThing = async (thingId, data, isType) => {
    if(!checkForRestrictedAttributes(data)) return RestrictedAttributesResponse //Comprobar que la definición no contiene atributos restringidos
    if(data.attributes == null) return AllAttributesCannotBeRemovedResponse
    return modifyResponseThing(await executePATCH(queryThingWithId(thingId, isType), data))
}

const duplicateThing = async(thingId, newThingId, data, isType) => {
    return await duplicateThingRecursive(thingId, newThingId, data, null, isType)
}

const duplicateThingRecursive = async(thingId, newThingId, data, parentId, isType) => {
    var getThingResponse = await getThing(thingId, isType)
    if(data != null && !checkForRestrictedAttributes(data)) return RestrictedAttributesResponse
    if (statusIsCorrect(getThingResponse.status)){
        var finalResponse = Object.assign({}, SuccessfulResponse)
        
        var thingData = getThingResponse.message
        const children = getChildrenOfThing(thingData)
        if (data != null) thingData = merge(thingData, data)
        thingData = removeRestrictedAttributesForThing(thingData)
        if (thingData.hasOwnProperty("thingId")) delete thingData["thingId"]

        const type = (isType) ? thingId : null
        const createResponse = await updateThing(newThingId, thingData, false, type, {}, parentId)
        console.log(finalResponse)
        console.log(thingId)
        console.log(newThingId)
        console.log(createResponse)
        finalResponse = addMessageIfStatusIsNotCorrect(createResponse, finalResponse, createResponse.message)
        console.log(finalResponse)

        if (children != null && children != undefined && statusIsCorrect(createResponse.status)) {
            Object.entries(children).forEach(async ([childId, num]) => {
                for(var i = 1; i <= num; i++){
                    console.log(childId)
                    const response = await duplicateThingRecursive(childId, newThingId + "_" + getNameInThingId(childId) + "_" + i, null, newThingId, isType)
                    finalResponse = addMessageIfStatusIsNotCorrect(response, finalResponse, response.message)
                }
            })
        }
        console.log("final final response")
        console.log(finalResponse)
        return finalResponse
    } else {
        console.log("GET_THING_RESPONSE")
        console.log(getThingResponse)
        return getThingResponse
    }
}

const updateThingAndHisParent = async (thingId, childId, data, isType, type, children) => {
    var response = await executeGET(queryThingWithId(thingId, isType))
    if(statusIsCorrect(response.status)){
        response = await updateThing(childId, data, isType, type, children, thingId)
    } else {
        response.message = thingId + " " + response.message
    }
    return response
}


// ---------------------------------------------
// DELETE
// ---------------------------------------------
const deleteThingWithoutChildren = async (thingId, isType) => {
    var finalResponse = Object.assign({}, SuccessfulResponse)
    const family = await getChildrenAndParent(thingId, isType)

    if (family.childrenList != null && family.childrenList != undefined) {
        Object.keys(family.childrenList).forEach(async childrenId => {
            finalResponse = removeParentOfThing(childrenId, thingId, isType, finalResponse)
        })
    }

    if (family.parentId != null) {
        if(!isType){
            finalResponse = removeThingFromChildrenList(thingId, family.parentId, isType, finalResponse)
        } else {
            Object.keys(family.parentId).forEach(async parentId => {
                finalResponse = removeThingFromChildrenList(thingId, parentId, isType, finalResponse)
            })
        }
    }

    const responseDELETE = await executeDELETE(queryThingWithId(thingId, isType))
    finalResponse = addMessageIfStatusIsNotCorrect(responseDELETE, finalResponse, "ERROR deleting thing " + thingId + " - " + responseDELETE.message)
    if (statusIsCorrect(finalResponse.status)) finalResponse.message = "Thing " + thingId + " deleted correctly without deleting their children."
    return finalResponse
}

const deleteThingAndChildren = async (thingId, isType, parentId=null) => {
    var finalResponse = Object.assign({}, SuccessfulResponse)
    const family = await getChildrenAndParent(thingId, isType)

    if (family.childrenList != null && family.childrenList != undefined) {
        Object.keys(family.childrenList).forEach(async childrenId => {
            const response = await deleteThingAndChildren(childrenId, isType, thingId)
            finalResponse = addMessageIfStatusIsNotCorrect(response, finalResponse, response.message)
        })
    }

    if (family.parentId != null && (parentId == null || family.parentId == parentId)) {
        const responsePATCH = await executePATCH(querySpecificChildren(family.parentId, thingId), "null")
        finalResponse = addMessageIfStatusIsNotCorrect(responsePATCH, finalResponse, "Error when removing the thing from the list of children of " + family.parentId + "\n")
    }

    const responseDELETE = await executeDELETE(queryThingWithId(thingId, isType))
    finalResponse = addMessageIfStatusIsNotCorrect(responseDELETE, finalResponse, "ERROR deleting thing " + thingId + "\n")
    if (statusIsCorrect(finalResponse.status)) finalResponse.message = "Thing " + thingId + " and their children deleted correctly."
    return finalResponse
}


// ---------------------------------------------
// UNLINK
// ---------------------------------------------

const unlinkChildOfThing = async (parentId, childId, isType) => {
    var finalResponse = Object.assign({}, SuccessfulResponse)
    responseRemoveChild = removeThingFromChildrenList(childId, parentId, isType, finalResponse)
    responseRemoveParent = removeParentOfThing(childId, parentId, isType, finalResponse)
    
    if(statusIsCorrect(finalResponse.status)) {
        return SuccessfulUnlinkResponse
    } else {
        return finalResponse
    }
}

const unlinkAllParentOfThing = async (thingId, isType) => {
    var finalResponse = Object.assign({}, SuccessfulUnlinkResponse)
    const getParent = await getAllParentOfThing(thingId, isType)
    if(statusIsCorrect(getParent.status)) {
        parent = getParent.message
        if (parent != null) {
            if(!isType){
                console.log("parentId: " + parent)
                const responseUnlink = await unlinkChildOfThing(parent, thingId, isType)
                finalResponse = addMessageIfStatusIsNotCorrect(responseUnlink, finalResponse, responseUnlink.message) 
            } else {
                Object.keys(parent).forEach(async parentId => {
                    const responseUnlink = await unlinkChildOfThing(parentId, thingId, isType)
                    finalResponse = addMessageIfStatusIsNotCorrect(responseUnlink, finalResponse, responseUnlink.message) 
                })
            }
        }
        return finalResponse 
    } else {
        return getParent
    }
}

const unlinkAllChildrenOfThing = async (thingId, isType) => {
    var finalResponse = Object.assign({}, SuccessfulUnlinkResponse)
    const getChildren = await getAllChildrenOfThing(thingId, isType)
    if(statusIsCorrect(getChildren.status)) {
        children = getChildren.message
        if (children != null) {
            Object.keys(children).forEach(async childId => {
                const responseUnlink = await unlinkChildOfThing(thingId, childId, isType)
                finalResponse = addMessageIfStatusIsNotCorrect(responseUnlink, finalResponse, responseUnlink.message) 
            })
        }
        return finalResponse 
    } else {
        return getChildren
    }
}


// ---------------------------------------------
// MODULE EXPORTS
// ---------------------------------------------
module.exports = {
    getAllRootThings : getAllRootThings,
    getThing : getThing,
    createThingWithoutSpecificId : createThingWithoutSpecificId,
    updateThing : updateThing,
    patchThing : patchThing,
    deleteThingAndChildren : deleteThingAndChildren,
    deleteThingWithoutChildren : deleteThingWithoutChildren,
    updateThingAndHisParent : updateThingAndHisParent,
    getAllChildrenOfThing : getAllChildrenOfThing,
    getAllParentOfThing : getAllParentOfThing,
    unlinkChildOfThing : unlinkChildOfThing,
    unlinkAllParentOfThing : unlinkAllParentOfThing,
    unlinkAllChildrenOfThing : unlinkAllChildrenOfThing,
    duplicateThing : duplicateThing
}