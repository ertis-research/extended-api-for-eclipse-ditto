/**
 * @fileoverview General functions to deal with DittoThing type entities. They are not for interacting with Eclipse Ditto.
 * @author Julia Robles <juliarobles@uma.es>
*/

import { privateAttributes, restrictedAttributes, attIsType, attParent, attType, constantAttributes } from './consts'
import { DittoThing, TypeParentAttribute } from '../types'



// ---------------------------------------------------------------------------------------------------------------------------------------
// Boolean checks
// ---------------------------------------------------------------------------------------------------------------------------------------

/**
 * Checks if the object is iterable
 * @param value object to check
 * @returns True if the object is iterable, False if not
 */
export const isIterable = (value: DittoThing) => {
    return Symbol.iterator in Object(value);
}


/**
 * Checks if a thing has a certain attribute
 * @param thing Thing entity scheme
 * @param attribute Attribute to be checked 
 * @returns True if the attribute is present, False if not.
 */
export const hasAttribute = (thing: DittoThing, attribute: string) => {
    return thing.attributes && thing.attributes.hasOwnProperty(attribute) && thing.attributes[attribute] != null && thing.attributes[attribute] != undefined
}


/**
 * Checks if a thing is a type. To do this check if the thing has the isType property and its value is true.
 * @param thing Thing scheme to check
 * @returns True if the thing is a type. False if it is a twin.
 */
export const isThingType = (thing: DittoThing) => {
    return thing.attributes && thing.attributes.hasOwnProperty(attIsType) && thing.attributes[attIsType] === true
}


/**
 * Checks if the scheme of a thing contains restricted attributes
 * @param thing Thing scheme to check
 * @returns True if it has restricted attributes, False if it does not.
 */
export const hasRestrictedAttributes = (thing: DittoThing) => {
    return thing && thing.attributes && Object.keys(thing.attributes).some(att => restrictedAttributes.includes(att))
}


/**
 * Checks if the parent of the thing and the parent given as parameter are the same.
 * @param thing Thing entity scheme
 * @param parentId ThingId of the parent to be checked
 * @param isType Determines whether the thing is a type (true) or a twin (false)
 * @param numChild In case it is a type, how many instances of the type are indicated by the parent given in the parameter to be created
 * @returns True if the thing is a parent, False if it is not.
 */
export const sameParent = (thing: DittoThing, parentId: string, isType: boolean, numChild: number = 1): boolean => {
    let thing_parent = getParentAttribute(thing)
    if (thing_parent == undefined && parentId == undefined) {
        return true
    } else {
        if (isType) {
            let typeParent: TypeParentAttribute = thing_parent as TypeParentAttribute
            return typeParent !== undefined && parentId !== undefined
                && typeParent.hasOwnProperty(parentId) && typeParent[parentId] == numChild
        } else {
            return thing_parent !== undefined && thing_parent === parentId
        }
    }
}




// ---------------------------------------------------------------------------------------------------------------------------------------
// Queries to extract information from thing
// ---------------------------------------------------------------------------------------------------------------------------------------

/**
 * Returns the value in the parent attribute of the thing. If missing, returns undefined.
 * @param thing Thing entity scheme
 * @returns Value in the parent attribute of the thing or undefined
 */
export const getParentAttribute = (thing: DittoThing): string | TypeParentAttribute => {
    return (thing.attributes && thing.attributes.hasOwnProperty(attParent)) ? {...thing.attributes[attParent]} : undefined
}




// ---------------------------------------------------------------------------------------------------------------------------------------
// Methods that modify the scheme of the thing
// ---------------------------------------------------------------------------------------------------------------------------------------

/**
 * Initializes special attributes to manage composition and types.
 * @param thing Thing entity scheme
 * @param isType Determines whether the thing is a type (true) or a twin (false)
 * @param type If it is a twin created from a type, it would indicate the identifier of that type.
 * @param parent If the thing is part of a composite thing, the identifiers of its parents are indicated. A type may have more than one parent, while a twin may have only one.
 * @param numChild In case it is a type, how many instances of the type are indicated by the parent given in the parameter to be created
 * @returns The scheme of the thing with the initialized special attributes
 */
export const initAttributes = (thing: DittoThing, isType: boolean = false, type?: string, parent?: string, numChild: number = 1): DittoThing => {
    if (!thing.attributes) thing.attributes = {}

    thing.attributes[attIsType] = isType
    if (type) thing.attributes[attType] = type
    if (parent) thing.attributes[attParent] = (isType) ? {[parent] : numChild} : parent

    return thing
}


/**
 * Sets the parent of a thing, depending on whether it is a type or a twin. 
 * If it is a type, also indicate how many instances of the child type will be created when the parent type is instantiated.
 * @param thing Thing entity scheme
 * @param parentId ThingId of the parent to be set
 * @param isType Determines whether the thing is a type (true) or a twin (false)
 * @param numChild In case it is a type, how many instances of the type are indicated by the parent given in the parameter to be created
 * @returns 
 */
export const setParent = (thing: DittoThing, parentId: string, isType: boolean, numChild = 1) => {
    if (!thing.attributes) thing.attributes = {}
    if (isType) {
        let parents = thing.attributes[attParent]
        if (parents == null || parents == undefined) parents = {}
        thing.attributes[attParent] = { ...parents, [parentId]: numChild }
    } else {
        thing.attributes[attParent] = parentId
    }
    return thing
}


/**
 * Copy restricted attributes from one thing to another
 * @param from thing to take the restricted attributes from
 * @param to thing where the restricted attributes will be copied 
 * @returns 
 */
export const copyRestrictedAttributes = (from: DittoThing, to: DittoThing) => {
    if (from.attributes) {
        const fromAttributesEntries = Object.entries(from.attributes).filter(([key, value]) => restrictedAttributes.includes(key))
        to.attributes = {
            ...to.attributes,
            ...Object.fromEntries(fromAttributesEntries)
        }
    }

    return to
}


/**
 * Sets to null the value of all the final keys of an object (leaves). 
 * In other words, if the key value is not an object, it sets it to null. 
 * This is done recursively.
 * @param object 
 * @returns 
 */
export const setNullValueRecursive = (object: any) => {
    if (['string', 'boolean', 'number'].includes(typeof object)) {
        return null
    } else if (object instanceof Object && Object.keys(object).length > 0) {
        Object.entries(object).forEach(([key, value]) => {
            object[key] = setNullValueRecursive(value)
        })
    }
    return object
}


/**
 * Sets the value of all feature properties of a thing to null.
 * @param thing Thing entity scheme
 * @returns The thing with all the properties of its features with a null value
 */
export const setNullValuesOfFeatures = (thing: DittoThing) => {
    if (!thing.features) return thing
    return {
        ...thing,
        features: setNullValueRecursive(thing.features)
    }
}


/**
 * Given a list of attribute keys, it removes them from the schema of a thing. 
 * It does not change it in Eclipse Ditto, only changes in the object.
 * @param thing Thing entity scheme
 * @param listAttributes List of attributes to be removed
 * @returns 
 */
const removeListAttributesForThing = (thing: DittoThing, listAttributes: string[]) => {
    if (thing.attributes) {
        const keys = Object.keys(thing.attributes)
        listAttributes.forEach((pAttr: string) => {
            if (thing.attributes && keys.includes(pAttr)) delete thing.attributes[pAttr]
        })
    }
    return thing
}


/**
 * Removes private attributes from the scheme of a thing. 
 * It does not change it in Eclipse Ditto, only changes in the object.
 * @param thing 
 * @returns The thing scheme without private attributes
 */
export const removePrivateAttributesForThing = (thing: DittoThing) => {
    return removeListAttributesForThing(thing, privateAttributes)
}


/**
 * Removes restricted attributes from the scheme of a thing. 
 * It does not change it in Eclipse Ditto, only changes in the object.
 * @param thing 
 * @returns The thing scheme without restricted attributes
 */
export const removeRestrictedAttributesForThing = (thing: DittoThing) => {
    return removeListAttributesForThing(thing, restrictedAttributes)
}


/**
 * Removes the hidden attributes from the schema of the thing (if any). It does not change it in Eclipse Ditto, only changes in the object.
 * @param thing Thing entity scheme
 * @returns The thing scheme without hidden attributes
 */
const removeHideAttributesForThing = (thing: DittoThing) => {
    if (thing.attributes) {
        Object.keys(thing.attributes).forEach((key) => {
            if (thing.attributes && key.startsWith("_") && !constantAttributes.includes(key)) delete thing.attributes[key]
        })
    }
    return thing
}


/**
 * Removes the private attributes of all things contained in a list. It does not change it in Eclipse Ditto, only changes in the objects
 * @param obj Object with list of things
 * @returns List of things without private attributes. If the object is invalid, returns an empty list.
 */
export const removePrivateAttributesForListOfThings = (obj: any) => {
    //If the response has a key named items, then the list to be parsed is the value of that key (Eclipse Ditto stuff)
    if (obj.hasOwnProperty("items")) {
        obj = obj.items
    }

    var res = []
    if (obj && isIterable(obj)) {
        res = obj.map((thing: DittoThing) => {
            return removePrivateAttributesForThing(thing)
        })
    }

    return res
}
