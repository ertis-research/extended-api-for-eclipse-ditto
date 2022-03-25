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
const isThingType = (thing) => {
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

const removeRestrictedAttributesForThing = (thing) => {
    //Elimino los atributos privados en caso de que existan
    restrictedAttributes.forEach((rAtt) => {
        if(thing != null && thing.hasOwnProperty("attributes") && thing.attributes.hasOwnProperty(rAtt)){
            delete thing.attributes[rAtt]
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

const copyRestrictedAttributes = (from, to, isType_default, type_default, children_default, parent_default) => {
    //Copio los atriburtos restringidos de un thing a otro thing
    if (to == null) to = {}
    if (!to.hasOwnProperty("attributes")) to.attributes = {}
    
    restrictedAttributes.forEach(rAtt => {
        if(from.attributes.hasOwnProperty(rAtt)) to.attributes[rAtt] = from.attributes[rAtt]
    })
    
    if (!hasAttribute(to, attIsType)) to.attributes[attIsType] = isType_default
    if (!hasAttribute(to, attType))to.attributes[attType] = type_default
    if (!hasAttribute(to, attChildren))to.attributes[attChildren] = children_default
    if (!hasAttribute(to, attParent))to.attributes[attParent] = parent_default

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

const getParentAttribute = (thing) => {
    return (thing.attributes.hasOwnProperty(attParent)) ? thing.attributes[attParent] : null
}

const setParent = (thing, parentId, isType) => {
    if(!isType){
        thing.attributes[attParent] = parentId
    } else {
        parents = thing.attributes[attParent]
        if (parents == null || parents == undefined) parents = {}
        thing.attributes[attParent] = {...parents, [parentId] : 1}
    }
    return thing
}

const isParent = (thing, parent, isType) => {
    thing_parent = getParentAttribute(thing)
    if(isType){
        return thing_parent.hasOwnProperty(parent)
    } else {
        return thing_parent == parent
    }
    
}

const initAttributes = (thing, isType = false, type = null, children = {}, parent = null) => {
    thing.attributes[attIsType] = isType
    if(type != null) thing.attributes[attType] = type
    thing.attributes[attChildren] = children
    if(parent != null) thing.attributes[attParent] = parent
    return thing
}

module.exports = {
    isThingType : isThingType,
    checkForRestrictedAttributes : checkForRestrictedAttributes,
    removePrivateAttributesForThing : removePrivateAttributesForThing,
    removePrivateAttributesForListOfThings : removePrivateAttributesForListOfThings,
    removeRestrictedAttributesForThing : removeRestrictedAttributesForThing,
    copyRestrictedAttributes : copyRestrictedAttributes,
    restrictedAttributesToString : restrictedAttributesToString,
    initAttributes : initAttributes,
    isParent : isParent,
    getParentAttribute : getParentAttribute,
    getChildrenOfThing : getChildrenOfThing,
    setParent : setParent
}