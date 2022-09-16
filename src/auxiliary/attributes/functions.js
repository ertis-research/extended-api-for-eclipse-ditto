// IMPORTS
// ------------------------------------------------------------------------
const { 
    privateAttributes, 
    restrictedAttributes, 
    attIsType, 
    //attChildren, 
    attParent,
    attType, 
    specificAttributes,
    constantAttributes
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

const removeSpecificAttributesForThing = (thing) => {
    //Elimino los atributos privados en caso de que existan
    specificAttributes.forEach((rAtt) => {
        if(thing != null && thing.hasOwnProperty("attributes") && thing.attributes.hasOwnProperty(rAtt)){
            delete thing.attributes[rAtt]
        }
    })

    return thing
}

const removeHideAttributesForThing = (thing) => {
    //Elimino los atributos ocultos en caso de que existan
    if(thing != null && thing.hasOwnProperty("attributes")) {
        Object.keys(thing.attributes).forEach((key) => {
            if(key.startsWith("_") && !constantAttributes.includes(key)) delete thing.attributes[key]
        })
    }

    return thing
}

const isIterable = (value) => {
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

const copyRestrictedAttributes = (from, to, isType_default, type_default, parent_default) => {
    //Copio los atriburtos restringidos de un thing a otro thing
    if (to == null || to == undefined) to = {}
    if (!to.hasOwnProperty("attributes")) to.attributes = {}
    
    restrictedAttributes.forEach(rAtt => {
        if(from.attributes.hasOwnProperty(rAtt)) to.attributes[rAtt] = from.attributes[rAtt]
    })
    
    if (!hasAttribute(to, attIsType)) to.attributes[attIsType] = isType_default
    if (!hasAttribute(to, attType))to.attributes[attType] = type_default
    //if (!hasAttribute(to, attChildren))to.attributes[attChildren] = children_default
    if (!hasAttribute(to, attParent))to.attributes[attParent] = parent_default

    return to
}

const hasAttribute = (thing, attribute) => {
    return thing.attributes.hasOwnProperty(attribute) && thing.attributes[attribute] != null && thing.attributes[attribute] != undefined
}

const restrictedAttributesToString = () => {
    return restrictedAttributes.join(', ')
}

const setNullValueRecursive = (object) => {
    if (['string', 'boolean', 'number'].includes(typeof object)){
        return null
    } else if (object instanceof Object && Object.keys(object).length > 0) {
        Object.entries(object).forEach(([key, value]) => {
            object[key] = setNullValueRecursive(value)
        })
    }
    return object
}

const setNullValuesOfFeatures = (thing) => {
    if (!thing.hasOwnProperty("features")) return thing
    return {
        ...thing,
        features: setNullValueRecursive(thing.features)
    }
}

/*const getChildrenOfThing = (thing) => {
    return thing.attributes[attChildren]
}*/

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

const isParent = (thing, parent, isType, numChild=1) => {
    thing_parent = getParentAttribute(thing)
    if(isType){
        return thing_parent !== undefined && thing_parent.hasOwnProperty(parent) && thing_parent[parent] == numChild
    } else {
        return thing_parent !== undefined && thing_parent === parent
    }
    
}

const initAttributes = (thing, isType = false, type = null, parent = null) => {
    if (!thing.hasOwnProperty("attributes")) thing.attributes = {}
    thing.attributes[attIsType] = isType
    if(type != null) thing.attributes[attType] = type
    //thing.attributes[attChildren] = children
    if(parent != null) thing.attributes[attParent] = parent
    return thing
}

module.exports = {
    isThingType : isThingType,
    checkForRestrictedAttributes : checkForRestrictedAttributes,
    removePrivateAttributesForThing : removePrivateAttributesForThing,
    removePrivateAttributesForListOfThings : removePrivateAttributesForListOfThings,
    removeRestrictedAttributesForThing : removeRestrictedAttributesForThing,
    removeSpecificAttributesForThing : removeSpecificAttributesForThing,
    removeHideAttributesForThing : removeHideAttributesForThing,
    copyRestrictedAttributes : copyRestrictedAttributes,
    restrictedAttributesToString : restrictedAttributesToString,
    initAttributes : initAttributes,
    isParent : isParent,
    getParentAttribute : getParentAttribute,
    //getChildrenOfThing : getChildrenOfThing,
    setParent : setParent,
    setNullValuesOfFeatures : setNullValuesOfFeatures
}