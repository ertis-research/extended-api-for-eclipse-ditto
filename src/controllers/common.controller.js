const { executePOST, executePATCH, executeDELETE, executeGET, executePUT } = require('../dittoRequest')
const { queryThings, queryParent, queryChildren, querySpecificChildren, queryRootThings, queryThingWithId, querySpecificParent } = require('../auxiliary/attributes/queries')
const {
    removePrivateAttributesForListOfThings, 
    removePrivateAttributesForThing, 
    checkForRestrictedAttributes, 
    copyRestrictedAttributes,
    restrictedAttributesToString,
    initAttributes,
    isParent,
    setParent,
    getParentOfThing
} = require('../auxiliary/attributes/manage_attributes')


// AUX_FUNCTIONS
// ------------------------------------------------------------------------
const statusIsCorrect = (status) => {
    return status >= 200 && status < 300
}

const addMessageIfStatusIsNotCorrect = (response, finalResponse, message) => {
    if (response != null && !statusIsCorrect(response.status)) {
        finalResponse.status = 500
        finalResponse.message += message
    }
    return finalResponse
}

const modifyResponseList = (response) => {
    if (statusIsCorrect(response.status)) {
        response.message = removePrivateAttributesForListOfThings(response.message)
    }
    return response
}

const modifyResponseThing = (response) => {
    if (statusIsCorrect(response.status)) {
        response.message = removePrivateAttributesForThing(response.message)
    }
    return response
}

const isObject = (obj) => {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

const getChildrenAndParent = async (thingId, isType) => {
    const responseChildren = await executeGET(queryChildren(thingId, isType))
    const responseParent = await executeGET(queryParent(thingId, isType))
    
    var childrenList = responseChildren.message
    childrenList = childrenList != null && childrenList != undefined && statusIsCorrect(responseChildren.status) && isObject(childrenList) ? childrenList : {}
    var parentId = statusIsCorrect(responseParent.status) ? responseParent.message : null

    return {
        parentId : parentId,
        childrenList : childrenList
    }
}

const deleteThingAndChildren = async (thingId, isType, parentId=null) => {
    var finalResponse = {
        status : 200,
        message : ""
    }
    const family = await getChildrenAndParent(thingId, isType)

    if (family.childrenList != null && family.childrenList != undefined) {
        Object.keys(family.childrenList).forEach(async childrenId => {
            const response = await deleteThingAndChildren(childrenId, isType, thingId)
            finalResponse = addMessageIfStatusIsNotCorrect(response.status, finalResponse, response.message)
        })
    }

    if (family.parentId != null && (parentId == null || family.parentId == parentId)) {
        const responsePATCH = await executePATCH(querySpecificChildren(family.parentId, thingId), "null")
        finalResponse = addMessageIfStatusIsNotCorrect(responsePATCH, finalResponse, "Error when removing the thing from the list of children of " + family.parentId + "\n")
    }

    const responseDELETE = await executeDELETE(queryThingWithId(req.params.thingId, isType))
    finalResponse = addMessageIfStatusIsNotCorrect(responseDELETE, finalResponse, "ERROR deleting thing " + thingId + "\n")

    if (statusIsCorrect(finalResponse.status)) finalResponse.message = "Thing " + thingId + " and their children deleted correctly."
    return finalResponse
}

const deleteThingWithoutChildren = async (thingId, isType) => {
    var finalResponse = {
        status : 200,
        message : ""
    }
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

const updateThing = async (thingId, body, isType, type, children_default, parentId) => {
    var finalResponse = {
        status : 200,
        message : ""
    }
    
    const onlySetFamily = body == null || body == undefined || Object.keys(body).length === 0 //Si no hay body (hay que actualizar solo el padre)
    const parentValue = (isType && parentId != null) ? {[parentId] : 1} : parentId

    if(!onlySetFamily && !checkForRestrictedAttributes(body)){ //Si hay body compruebo que no haya atributos restringidos
        return {
            status : 442,
            message : "In the definition there is a restricted attribute, this cannot be updated.\nRestricted attributes: " + restrictedAttributesToString()
        }
    }

    const responseGet = await executeGET(queryThingWithId(thingId, isType))
    if (statusIsCorrect(responseGet.status)) { //Si ya existe
        if(!onlySetFamily) body = copyRestrictedAttributes(responseGet.message, body, isType, type, children_default, parentValue) //Copio los atributos restringido que ya tenía en el nuevo body
        
        if(!isParent(body, parentId, isType)){ //Compruebo si el padre asignado y el nuevo son el mismo
            actual_parent = getParentOfThing(body)
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
            finalResponse = addThingToChildrenList(thingId, parentId, isType, finalResponse)
    } else {
        return {
            status: 400,
            message: "To create a thing the body cannot be empty."
        }
    }

    if(!onlySetFamily){
        var responsePut = await executePUT(queryThingWithId(thingId, isType), body)
        responsePut = modifyResponseThing(responsePut)
        finalResponse = (statusIsCorrect(responsePut.status)) ? responsePut : addMessageIfStatusIsNotCorrect(responsePut, finalResponse, responsePut.message)
    }

    return finalResponse
}

const unbindThings = async (parentId, childId, isType) => {
    var finalResponse = {
        status : 200,
        message : ""
    }

    finalResponse = removeThingFromChildrenList(childId, parentId, isType, finalResponse)
    finalResponse = removeParentOfThing(childId, parentId, isType, finalResponse)

    return finalResponse
}

const unbindAllChildren = async (thingId, isType) => {
    const family = await getChildrenAndParent(thingId, isType)

    if (family.childrenList != null && family.childrenList != undefined) {
        Object.keys(family.childrenList).forEach(async childrenId => {
            finalResponse = removeParentOfThing(childrenId, thingId, isType, finalResponse)
        })
    }

    const responsePATCH = await executePATCH(queryChildren(parentId, isType), "{}")
    //sin terminar
}

const duplicateThing = async(thingId, newThingId, isType) => {
    /*var response = await executeGET(queryThingWithId(req.params.thingId, isType))
    if (statusIsCorrect(response.status)){
        const thingInfo = response.message
        if()
    }*/
}
//REQUESTS

const getAllRootThings = async (req, res, isType) => {
    //Ejecutar el GET con la query necesaria
    var response = await executeGET(queryRootThings(isType))
    console.log(queryRootThings(isType))
    //Si la respuesta es correcta, eliminar los atributos privados de todos
    response = modifyResponseList(response)

    res.status(response.status || 500).json(response.message)
}

const createThingWithoutSpecificId = async (req, res, isType, type, children, parent) => {
    var body = req.body
    
    //Comprobar que la definición no contiene atributos restringidos
    if(!checkForRestrictedAttributes){
        res.status(442).json({
            message: "In the definition there is a restricted attribute, rename it.\nRestricted attributes: " + restrictedAttributesToString()
        })
    }
    
    //Inicializar los atributos restringidos
    if(body != null) body = initAttributes(body, isType, type, children, parent)

    //Ejecutar el POST y devolver lo que devuelva
    var response = await executePOST(queryThings, body)

    response = modifyResponseThing(response)
    res.status(response.status || 500).json(response.message)
}

const getThingById = async (req, res, isType) => {
    //Ejecutar el GET
    var response = await executeGET(queryThingWithId(req.params.thingId, isType))

    //En caso de que la respuesta sea correcta, eliminar los atributos privados
    response = modifyResponseThing(response)

    //Devolver la respuesta del GET, posiblemente modificada
    res.status(response.status || 500).json(response.message)
}

const thingPUT = async (req, res, isType, type, children, parentId) => {
    var body = req.body
    var thingId = req.params.thingId
    
    response = await updateThing(thingId, body, isType, type, children, parentId)
    res.status(response.status || 500).json(response.message)
}

const thingPATCH = async (req, res, isType) => {
    const body = req.body
    
    //Comprobar que la definición no contiene atributos restringidos
    if(!checkForRestrictedAttributes){
        res.status(442).json({
            message: "In the definition there is a restricted attribute, this cannot be updated.\nRestricted attributes: " + restrictedAttributesToString()
        })
        return
    }

    if(body.attributes == null) {
        res.status(442).json({
            message: "Not all attributes can be removed due to restricted attributes.: " + restrictedAttributesToString()
        })
        return
    }

    //Ejecutar el PATCH y devolver lo que devuelva
    var responsePATCH = await executePATCH(queryThingWithId(req.params.thingId, isType), body)
    
    responsePATCH = modifyResponseThing(responsePATCH)
    res.status(responsePATCH.status || 500).json(responsePATCH.message)
}

const childrenOfThingPUT = async (req, res, isType, type, children) => {
    var body = req.body
    var thingId = req.params.thingId
    var childrenId = req.params.childrenId

    var response = await executeGET(queryThingWithId(req.params.thingId, isType))
    if(statusIsCorrect(response.status)){
        response = await updateThing(childrenId, body, isType, type, children, thingId)
    } else {
        response.message = thingId + " " + response.message
    }

    res.status(response.status || 500).json(response.message)
}

const childrenOfThingGET = async (req, res, isType) => {
    var thingId = req.params.thingId

    var response = await executeGET(queryChildren(thingId, isType))
    //Si la respuesta es correcta, eliminar los atributos privados de todos
    response = modifyResponseList(response)

    res.status(response.status || 500).json(response.message)
}

const unbindChildOfThingPATCH = async (req, res, isType) => {
    var parentId = req.params.thingId
    var childrenId = req.params.childrenId

    var response = await executeGET(queryThingWithId(parentId, isType))
    if(statusIsCorrect(response.status)){
        response = await unbindThings(parentId, childrenId, isType)
    } else {
        response.message = thingId + " " + response.message
    }

    res.status(response.status || 500).json(response.message)
}

const unbindAllChildrenOfThingPATCH = async (req, res, isType) => {
    var parentId = req.params.thingId


}

const thingDELETE = async (req, res, isType) => {
    const thingId = req.params.thingId

    const response = await deleteThingWithoutChildren(thingId, isType)
    res.status(response.status || 500).json(response.message)
}

const thingAndChildrenDELETE = async (req, res, isType) => {
    const thingId = req.params.thingId

    const response = await deleteThingAndChildren(thingId, isType)
    res.status(response.status || 500).json(response.message)
}

module.exports = {
    deleteThingAndChildren : deleteThingAndChildren,
    deleteThingWithoutChildren : deleteThingWithoutChildren,
    rootGET : getAllRootThings,
    thingPOST : createThingWithoutSpecificId,
    thingByIdGET : getThingById,
    thingPUT : thingPUT,
    thingPATCH : thingPATCH,
    childrenOfThingPUT : childrenOfThingPUT,
    childrenOfThingGET : childrenOfThingGET,
    thingDELETE : thingDELETE,
    thingAndChildrenDELETE : thingAndChildrenDELETE,
    unbindChildOfThingPATCH : unbindChildOfThingPATCH
}