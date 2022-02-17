// IMPORTS
// ------------------------------------------------------------------------
const { executePOST, executePATCH, executeDELETE, executeGET, executePUT } = require('../dittoRequest')
const { queryRootThings, queryThings, queryParent, queryChildren, querySpecificChildren } = require('../auxiliary/attributes/queries')
const { 
    isType, 
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
    if (!statusIsCorrect(response.status)) {
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

const getChildrenAndParent = async (thingId) => {
    const responseChildren = await executeGET(queryChildren(thingId))
    const responseParent = await executeGET(queryParent(thingId))
    
    var childrenList = responseChildren.message
    childrenList = childrenList != null && childrenList != undefined && statusIsCorrect(responseChildren.status) && isObject(childrenList) ? childrenList : {}
    var parentId = statusIsCorrect(responseParent.status) ? responseParent.message : null

    return {
        parentId : parentId,
        childrenList : childrenList
    }
}

const deleteThingAndChildren = async (thingId, parentId=null) => {
    var finalResponse = {
        status : 200,
        message : ""
    }
    console.log("DELETE THING " + thingId + " aa " + parentId)
    const family = await getChildrenAndParent(thingId)
    console.log(family)

    if (family.childrenList != null && family.childrenList != undefined) {
        Object.keys(family.childrenList).forEach(async childrenId => {
            const response = await deleteThingAndChildren(childrenId, thingId)
            finalResponse = addMessageIfStatusIsNotCorrect(response.status, finalResponse, response.message)
        })
    }

    if (family.parentId != null && (parentId == null || family.parentId == parentId)) {
        const responsePATCH = await executePATCH(querySpecificChildren(family.parentId, thingId), "null")
        finalResponse = addMessageIfStatusIsNotCorrect(responsePATCH, finalResponse, "Error when removing the thing from the list of children of " + family.parentId + "\n")
    }

    const responseDELETE = await executeDELETE(queryThings + "/" + thingId)
    finalResponse = addMessageIfStatusIsNotCorrect(responseDELETE, finalResponse, "ERROR deleting thing " + thingId + "\n")

    if (statusIsCorrect(finalResponse.status)) finalResponse.message = "Thing " + thingId + " and their children deleted correctly."
    return finalResponse
}

const deleteThingWithoutChildren = async (thingId) => {
    var finalResponse = {
        status : 200,
        message : ""
    }
    const family = await getChildrenAndParent(thingId)

    if (family.childrenList != null && family.childrenList != undefined) {
        Object.keys(family.childrenList).forEach(async childrenId => {
            const responsePATCH = await executePATCH(queryParent(childrenId), "null")
            finalResponse = addMessageIfStatusIsNotCorrect(responsePATCH, finalResponse, "ERROR deleting the parent of the thing " + childrenId + "\n")
        })
    }

    if (family.parentId != null) {
        const responsePATCH = await executePATCH(querySpecificChildren(family.parentId, thingId), "null")
        finalResponse = addMessageIfStatusIsNotCorrect(responsePATCH, finalResponse, "Error when removing the thing from the list of children of " + family.parentId + "\n")
    }

    const responseDELETE = await executeDELETE(queryThings + "/" + thingId)
    finalResponse = addMessageIfStatusIsNotCorrect(responseDELETE, finalResponse, "ERROR deleting thing " + thingId + "\n" + responseDELETE.message)

    if (statusIsCorrect(finalResponse.status)) finalResponse.message = "Thing " + thingId + " deleted correctly without deleting their children."
    return finalResponse
}

const putThing = async (thingId, body, parentId=null) => {
    //Comprobar que la definición no contiene atributos restringidos
    if(!checkForRestrictedAttributes){
        return {
            status : 442,
            message : "In the definition there is a restricted attribute, this cannot be updated.\nRestricted attributes: " + restrictedAttributesToString()
        }
    }

    console.log(body)
    const onlySetFamily = body == null || body == undefined || Object.keys(body).length === 0
    console.log(onlySetFamily)
    var finalResponse = {
        status : 200,
        message : ""
    } 
    //Copiar sus atributos restringidos en caso de que exista, inicializar estos en caso de que no
    const responseGet = await executeGET(queryThings + "/" + thingId)
    if(statusIsCorrect(responseGet.status)) {
        console.log("PRIMER BODY")
        console.log(body)
        body = copyRestrictedAttributes(responseGet.message, body, false, null, {}, parentId)
        console.log("SEGUNDO BODY")
        console.log(body)
        //Si parent es distinto modificar los children
        if (parentId != null && !isParent(body, parentId)){
            console.log("PADRE NO ES CORRECTO")
            const responsePATCH1 = await executePATCH(querySpecificChildren(getParentOfThing(body), thingId), "null")
            finalResponse = addMessageIfStatusIsNotCorrect(responsePATCH1, finalResponse, "Error when removing the thing from the list of children of " + getParentOfThing(body) + "\n")
            body = setParent(body, parentId)
        }

    } else {
        if(body != null) body = initAttributes(body, false, null, {}, parentId)
    }

    //Si parent no es nulo añadirlo a los hijos
    if(parentId != null) {
        const responsePATCH3 = await executePATCH(querySpecificChildren(parentId, thingId), "1")
        finalResponse = addMessageIfStatusIsNotCorrect(responsePATCH3, finalResponse, "Error adding the thing to the list of children of" + parentId + "\n")
        if(onlySetFamily){
            console.log("ONLYSETFAMILY")
            const responsePATCH2 = await executePATCH(queryParent(thingId), '"' + parentId + '"')
            console.log(responsePATCH2)
            finalResponse = addMessageIfStatusIsNotCorrect(responsePATCH2, finalResponse, "Error setting " + parentId + " as parent of thing\n")
        }
    }

    //Ejecutar el PUT y devolver lo que devuelva
    if(!onlySetFamily){
        var responsePut = await executePUT(queryThings + "/" + thingId, body)
        responsePut = modifyResponseThing(responsePut)
        return responsePut
    } else {
        return finalResponse
    }
}


// REQUESTS
// ------------------------------------------------------------------------
const thingController = {
    getRootThings: async (req, res) => {
        //Ejecutar el GET con la query necesaria
        var response = await executeGET(queryRootThings)
        
        //Si la respuesta es correcta, eliminar los atributos privados de todos
        response = modifyResponseList(response)
    
        res.status(response.status || 500).json(response.message)
    },

    postThing: async (req, res) => {
        var body = req.body
    
        //Comprobar que la definición no contiene atributos restringidos
        if(!checkForRestrictedAttributes){
            res.status(442).json({
                message: "In the definition there is a restricted attribute, rename it.\nRestricted attributes: " + restrictedAttributesToString()
            })
        }
    
        //Inicializar los atributos restringidos
        if(body != null) body = initAttributes(body, false, null, {}, null)

        //Ejecutar el POST y devolver lo que devuelva
        var response = await executePOST(queryThings, body)

        response = modifyResponseThing(response)
        res.status(response.status || 500).json(response.message)
    },

    getThingById: async (req, res) => {
        //Ejecutar el GET
        var response = await executeGET(queryThings + "/" + req.params.thingId)

        //En caso de que la respuesta sea correcta, eliminar los atributos privados
        response = modifyResponseThing(response)
    
        //Devolver la respuesta del GET, posiblemente modificada
        res.status(response.status || 500).json(response.message)
    },

    putThingById: async (req, res) => {
        var body = req.body
        var thingId = req.params.thingId
    
        response = await putThing(thingId, body)
        res.status(response.status || 500).json(response.message)
    },

    patchThingById: async (req, res) => {
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
        var responsePATCH = await executePATCH(queryThings + "/" + req.params.thingId, body)
        
        responsePATCH = modifyResponseThing(responsePATCH)
        res.status(responsePATCH.status || 500).json(responsePATCH.message)
    },

    deleteThingAndChildrenById: async (req, res) => {
        const thingId = req.params.thingId

        const response = await deleteThingAndChildren(thingId)
        res.status(response.status || 500).json(response.message)
    },

    deleteOnlyThingById: async (req, res) => {
        const thingId = req.params.thingId

        const response = await deleteThingWithoutChildren(thingId)
        res.status(response.status || 500).json(response.message)
    },

    putChildrenOfThing: async (req, res) => {
        var body = req.body
        var thingId = req.params.thingId
        var childrenId = req.params.childrenId

        var response = await executeGET(queryThings + "/" + req.params.thingId)
        if(statusIsCorrect(response.status)){
            response = await putThing(childrenId, body, thingId)
        } else {
            response.message = thingId + " " + response.message
        }
        
        res.status(response.status || 500).json(response.message)
    },

    getChildrenOfThing: async (req, res) => {
        var thingId = req.params.thingId

    }

}

module.exports = thingController