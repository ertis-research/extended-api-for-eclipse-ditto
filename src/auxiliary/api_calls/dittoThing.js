const { executePOST, executePATCH, executeDELETE, executeGET, executePUT } = require('./requests_for_ditto')
const { queryThings, queryAllThings,  queryParent, queryChildren, queryRootThings, queryThingWithId, querySpecificParent } = require('./queries')
const {
    removeRestrictedAttributesForThing,
    removeHideAttributesForThing,
    checkForRestrictedAttributes, 
    copyRestrictedAttributes,
    initAttributes,
    isParent,
    setParent,
    getParentAttribute,
    removeSpecificAttributesForThing,
    setNullValuesOfFeatures
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
const { attCopyOf } = require('../attributes/consts')


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
    childrenList = childrenList != null && childrenList != undefined && statusIsCorrect(responseChildren.status) && (isObject(childrenList) || Array.isArray(childrenList)) ? childrenList : []
    var parentId = statusIsCorrect(responseParent.status) ? responseParent.message : null

    return {
        parentId : parentId,
        childrenList : childrenList
    }
}

/*
const addThingToChildrenList = async (thingId, parentId, isType, response) => {
    const responsePATCH = await executePATCH(querySpecificChildren(parentId, thingId, isType), "1")
    return addMessageIfStatusIsNotCorrect(responsePATCH, response, "Error adding the thing to the list of children of" + parentId + "\n")
}

const removeThingFromChildrenList = async (thingId, parentId, isType, response) => {
    const responsePATCH = await executePATCH(querySpecificChildren(parentId, thingId, isType), "null")
    return addMessageIfStatusIsNotCorrect(responsePATCH, response, "Error when removing the thing from the list of children of " + parentId + "\n")
}
*/

const setParentOfThing = async (thingId, parentId, isType, response, numChild) => {
    const responsePATCH = (!isType) ? await executePATCH(queryParent(thingId, isType), '"' + parentId + '"') : await executePATCH(querySpecificParent(thingId, parentId), numChild.toString()) //Puede que sea necesario ponerle "" entre parentId
    return addMessageIfStatusIsNotCorrect(responsePATCH, response, "Error setting " + parentId + " as parent of thing\n")
}

const removeParentOfThing = async (thingId, parentId, isType, response, full_remove=false) => {
    const path = (!isType || full_remove) ? queryParent(thingId, isType) : querySpecificParent(thingId, parentId)
    const responsePATCH = await executePATCH(path, "null")
    return addMessageIfStatusIsNotCorrect(responsePATCH, response, "Error deleting " + ((isType) ? parentId + " as" : "") + " parent of thing " + thingId)
}


// ---------------------------------------------
// GET
// ---------------------------------------------
const getAllRootThings = async (isType, options="") => {
    if (options !== "") options = "&option=" + options
    return modifyResponseList(await executeGET(queryRootThings(isType, options)))
}

const getAllThings = async (isType, options="") => {
    if (options !== "") options = "&option=" + options
    return modifyResponseList(await executeGET(queryAllThings(isType, options)))
}

const getThing = async (thingId, isType) => {
    return modifyResponseThing(await executeGET(queryThingWithId(thingId, isType)))
}

const getChildren = async (thingId, isType, options="") => {
    if (options !== "") options = "&option=" + options
    return modifyResponseList(await executeGET(queryChildren(thingId, isType, options)))
}

const getAllChildrenOfThing = async (thingId, isType) => {
    var res = modifyResponseList(await executeGET(queryChildren(thingId, isType, "&option=size(200)")))
    if (res.message.hasOwnProperty("cursor")){
        children = res.message.items
        while (res.message.hasOwnProperty("cursor")) {
            res = modifyResponseList(await executeGET(queryChildren(thingId, isType, "&option=size(200),cursor(" + res.message.cursor + ")" )), true)
            children = children.concat(res.message.items)
        }
        return {
            status: res.status,
            message: children
        }
    }
    return res
}

const getAllParentOfThing = async(thingId, isType) => {
    return await executeGET(queryParent(thingId, isType))
}


// ---------------------------------------------
// CREATE OR UPDATE
// ---------------------------------------------
const createThingWithoutSpecificId = async (data, isType, type, parent) => {  
    if(!checkForRestrictedAttributes) return RestrictedAttributesResponse //Comprobar que la definición no contiene atributos restringidos
    if(data != null) data = initAttributes(data, isType, type, parent) //Inicializar los atributos restringidos
    return modifyResponseThing(await executePOST(queryThings, data))
}

const updateThing = async (thingId, body, isType, type, parentId=null, numChild=1) => {
    var finalResponse = Object.assign({}, SuccessfulResponse)
    
    const onlySetFamily = body == null || body == undefined || Object.keys(body).length === 0 //Si no hay body (hay que actualizar solo el padre)
    const parentValue = (isType && parentId != null) ? {[parentId] : numChild} : parentId

    if(!onlySetFamily && !checkForRestrictedAttributes(body)) return RestrictedAttributesResponse

    const responseGet = await executeGET(queryThingWithId(thingId, isType))
    if (statusIsCorrect(responseGet.status)) { //Si ya existe
        body = copyRestrictedAttributes(responseGet.message, body, isType, type, undefined) //Copio los atributos restringido que ya tenía en el nuevo body
        if(!isParent(body, parentId, isType, numChild)){ //Compruebo si el padre asignado y el nuevo son el mismo
            //actual_parent = getParentAttribute(body)
            //if(!isType && actual_parent != null) finalResponse = removeThingFromChildrenList(thingId, actual_parent, isType, finalResponse) //Si es un twin entonces elimino el thing de la lista de hijos del padre
            if(onlySetFamily){
                finalResponse = setParentOfThing(thingId, parentId, isType, finalResponse, numChild)
            } else {
                body = setParent(body, parentId, isType) //Seteo el padre para que se actualice con el PUT
            }
            //finalResponse = addThingToChildrenList(thingId, parentId, isType, finalResponse) //Aniado el thingId a los hijos del padre
        }

    } else if(!onlySetFamily){ //Si no existe y hay body
        body = initAttributes(body, isType, type, parentValue) //Inicializo attributos restringidos
            //if(parentValue != null) finalResponse = addThingToChildrenList(thingId, parentId, isType, finalResponse)
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
    return await duplicateThingRecursive(thingId, null, newThingId, data, null, isType)
}

const duplicateThingKeepHide = async(thingId, newThingId, data, isType) => {
    return await duplicateThingRecursive(thingId, null, newThingId, data, null, isType, false)
}

const duplicateThingRecursive = async(thingId, thingData, newThingId, dataToMerge, parentId, isType, realParentId=null, removeHide=true) => {  
    // Si data tiene atributos restringidos no se ejecuta la consulta
    if(dataToMerge != null && !checkForRestrictedAttributes(dataToMerge)) return RestrictedAttributesResponse
    var data = JSON.parse(JSON.stringify(dataToMerge));
    //Si no tenemos los datos del thing los sacamos
    if(thingData == null) {
        var getThingResponse = await getThing(thingId, isType)
        if (statusIsCorrect(getThingResponse.status)){
            thingData = getThingResponse.message
        } else {
            return getThingResponse
        }
    }

    //Inicializamos respuesta
    var finalResponse = Object.assign({}, SuccessfulResponse)
    
    //Cogemos los padres antes de modificar thingData y sacamos los hijos
    const parents = getParentAttribute(thingData)
    var children = await getAllChildrenOfThing(thingId, isType)
    children = children.message

    //Unimos data y preparamos los datos del thing para crearlo
    thingData = (removeHide) ? removeHideAttributesForThing(thingData) : removeSpecificAttributesForThing(thingData)
    if (data != null) thingData = merge(thingData, data)
    if (thingData.hasOwnProperty("thingId")) delete thingData["thingId"]
    thingData.attributes[attCopyOf] = thingId
    thingData = setNullValuesOfFeatures(thingData)

    //Si estamos creando a partir de tipo asignamos la variable correspondiente
    const type = (isType) ? thingId : null

    //Si es twin o es tipo pero es el gemelo principal simplemente lo creo y asocio
    //Si no es el gemelo principal de los tipos creo tantos gemelos como valor tenga la key de parentId
    const num = (isType && realParentId != null && parents.hasOwnProperty(realParentId)) ? parents[realParentId] : 1
    for(var i = 0; i < num; i++){
        // Si es el primero que no ponga _0
        const newId = (i > 0) ? newThingId + '_' + i : newThingId
        //Creo el gemelo
        const createResponse = await updateThing(newId, thingData, false, type, parentId)
        finalResponse = addMessageIfStatusIsNotCorrect(createResponse, finalResponse, createResponse.message)
        
        //Llamo a todos los hijos del gemelo para que se creen
        if (children !== null && children !== undefined && children.length > 0) {
            console.log("TIENE " + children.length + " HIJOS: " + thingId)
            for (var child of children) {
                var copyChild = {...child}
                const response = await duplicateThingRecursive(copyChild.thingId, copyChild, newId + ":" + getNameInThingId(copyChild.thingId), dataToMerge, newId, isType, thingId, removeHide)
                finalResponse = addMessageIfStatusIsNotCorrect(response, finalResponse, response.message)
            }
        }
    }
    
    return finalResponse
}

const updateThingAndHisParent = async (thingId, childId, data, isType, type, numChild=1) => {
    var response = await executeGET(queryThingWithId(thingId, isType))
    if(statusIsCorrect(response.status)){
        response = await updateThing(childId, data, isType, type, thingId, numChild)
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
        for(var children of family.childrenList) {
            const parent = getParentAttribute(children)
            const full_remove = (isType && parent && Object.keys(parent).length === 1 && parent.hasOwnProperty(thingId)) ? true : false
            finalResponse = await removeParentOfThing(children.thingId, thingId, isType, finalResponse, full_remove)
        }
    }
/*
    if (family.parentId != null) {
        if(!isType){
            finalResponse = removeThingFromChildrenList(thingId, family.parentId, isType, finalResponse)
        } else {
            Object.keys(family.parentId).forEach(async parentId => {
                finalResponse = removeThingFromChildrenList(thingId, parentId, isType, finalResponse)
            })
        }
    }*/

    const responseDELETE = await executeDELETE(queryThingWithId(thingId, isType))
    finalResponse = addMessageIfStatusIsNotCorrect(responseDELETE, finalResponse, "ERROR deleting thing " + thingId + " - " + responseDELETE.message)
    if (statusIsCorrect(finalResponse.status)) finalResponse.message = "Thing " + thingId + " deleted correctly without deleting their children."
    return finalResponse
}

const deleteThingAndChildren = async (thingId, isType) => {
    var finalResponse = Object.assign({}, SuccessfulResponse)
    const family = await getChildrenAndParent(thingId, isType)

    if (family.childrenList != null && family.childrenList != undefined && family.childrenList.length > 0) {
        for(var children of family.childrenList) {
            const response = await deleteThingAndChildren(children.thingId, isType)
            finalResponse = addMessageIfStatusIsNotCorrect(response, finalResponse, response.message)
        }
    }
/*
    if (family.parentId != null && (parentId == null || family.parentId == parentId)) {
        const responsePATCH = await executePATCH(querySpecificChildren(family.parentId, thingId), "null")
        finalResponse = addMessageIfStatusIsNotCorrect(responsePATCH, finalResponse, "Error when removing the thing from the list of children of " + family.parentId + "\n")
    }*/

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
    var full_remove = false
    if (isType){
        const responseParent = await getAllParentOfThing(childId, isType)
        if (statusIsCorrect(responseParent.status)){
            const parent = responseParent.message
            full_remove = (parent && ((Object.keys(parent).length === 0) || (Object.keys(parent).length === 1 && parent.hasOwnProperty(parentId)))) ? true : false
        } 
    }

    //responseRemoveChild = removeThingFromChildrenList(childId, parentId, isType, finalResponse)
    responseRemoveParent = removeParentOfThing(childId, parentId, isType, finalResponse, full_remove)
    
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
            if(!isType || Object.keys(parent).length === 0){
                const responseUnlink = await unlinkChildOfThing(parent, thingId, isType)
                finalResponse = addMessageIfStatusIsNotCorrect(responseUnlink, finalResponse, responseUnlink.message) 
            } else {
                for(var parentId of Object.keys(parent)) {
                    const responseUnlink = await unlinkChildOfThing(parentId, thingId, isType)
                    finalResponse = addMessageIfStatusIsNotCorrect(responseUnlink, finalResponse, responseUnlink.message) 
                }
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
            for(var childId of Object.keys(children)){
                const responseUnlink = await unlinkChildOfThing(thingId, childId, isType)
                finalResponse = addMessageIfStatusIsNotCorrect(responseUnlink, finalResponse, responseUnlink.message) 
            }
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
    getAllThings : getAllThings,
    getThing : getThing,
    getChildren : getChildren,
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
    duplicateThing : duplicateThing,
    duplicateThingKeepHide : duplicateThingKeepHide
}