// IMPORTS
// ------------------------------------------------------------------------
const { 
    privateAttributes, 
    restrictedAttributes, 
    attIsType, 
    attChildren, 
    attParent,
    attType 
} = require('./consts')



// FUNCTIONS
// ------------------------------------------------------------------------
const isType = (thing) => {
    //Tiene la propiedad y ademas esta es true
    return thing.attributes.hasOwnProperty(attIsType) && thing[attIsType] === true
}

const checkForRestrictedAttributes = (thing) => {
    const atts = thing.attributes

    //Si tienes atributos
    if (atts != null){
        //Compruebo que ninguno de los atributos sea restringido
        for(rAtt in restrictedAttributes) {
            if(atts.hasOwnProperty(rAtt)) return false
        }
    }

    return true
}

const removePrivateAttributesForThing = (thing) => {
    //Elimino los atributos privados en caso de que existan
    privateAttributes.forEach((pAtt) => {
        if(thing != null && thing.hasOwnProperty("attributes") && thing.attributes.hasOwnProperty(pAtt)){
            delete thing.attributes[pAtt]
        }
    })

    return thing
}

function isIterable (value) {
    return Symbol.iterator in Object(value);
}

const removePrivateAttributesForListOfThings = (list) => {
    //Si lo que me han dado es un objeto y no un array es que la lista está en la primera key
    if (list.hasOwnProperty("items")) {
        list = list.items
    }

    //Elimino los atributos privados de cada 
    var res = []
    if(list != null && isIterable(list)){
        res = list.map((thing) => {
            return removePrivateAttributesForThing(thing)
        })
    }

    return res
}

const copyRestrictedAttributes = (from, to, isType = false, type = null, children = [], parent = null) => {
    //Copio los atriburtos restringidos de un thing a otro thing
    if (to == null) to = {}
    if (!to.hasOwnProperty("attributes")) to.attributes = {}
    
    restrictedAttributes.forEach(rAtt => {
        if(from.attributes.hasOwnProperty(rAtt)) to.attributes[rAtt] = from.attributes[rAtt]
    })
    
    if (!hasAttribute(to, attIsType)) to.attributes[attIsType] = isType
    if (!hasAttribute(to, attType))to.attributes[attType] = type
    if (!hasAttribute(to, attChildren))to.attributes[attChildren] = children
    if (!hasAttribute(to, attParent))to.attributes[attParent] = parent

    return to
}

const hasAttribute = (thing, attribute) => {
    return thing.attributes.hasOwnProperty(attribute) && thing.attributes[attribute] != null && thing.attributes[attribute] != undefined
}

const restrictedAttributesToString = () => {
    return restrictedAttributes.join(', ')
}

const getChildrenOfThing = (thing) => {
    return thing.attributes[attChildren]
}

const getParentOfThing = (thing) => {
    return thing.attributes[attParent]
}

const setParent = (thing, parentId) => {
    thing.attributes[attParent] = parentId
    return thing
}

const isParent = (thing, parent) => {
    return thing.attributes[attParent] != null && thing.attributes[attParent] == parent
}


const initAttributes = (thing, isType = false, type = null, children = {}, parent = null) => {
    thing.attributes[attIsType] = isType
    thing.attributes[attType] = type
    thing.attributes[attChildren] = children
    thing.attributes[attParent] = parent
    return thing
}

module.exports = {
    isType : isType,
    checkForRestrictedAttributes : checkForRestrictedAttributes,
    removePrivateAttributesForThing : removePrivateAttributesForThing,
    removePrivateAttributesForListOfThings : removePrivateAttributesForListOfThings,
    copyRestrictedAttributes : copyRestrictedAttributes,
    restrictedAttributesToString : restrictedAttributesToString,
    initAttributes : initAttributes,
    isParent : isParent,
    getParentOfThing : getParentOfThing,
    setParent : setParent
}