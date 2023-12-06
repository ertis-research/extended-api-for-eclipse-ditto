/**
 * @fileoverview Defines the text of the attributes and their visibility.
 * @author Julia Robles <juliarobles@uma.es>
*/



export const attType: string = "type"
export const attIsType: string = "_isType"
export const attParent: string = "_parents"
export const attCopyOf: string = "copyOf"
export const attName: string = "name"
export const attTextDescription: string = "text_description"
export const attImage: string = "image"


/**
 * All attributes added by the ditto-extended-api. They can only be managed by the API, so they will not be allowed in the request bodies.
 */
export const restrictedAttributes: string[] = [attIsType, attParent, attType, attCopyOf]

/**
 * Attributes that users should not be able to consult or modify in any way.
 */
export const privateAttributes: string[] = [attIsType]

/**
 * 
 */
//export const specificAttributes: string[] = [attIsType, attParent]

/**
 * Attributes that are displayed to users, but never change.
 */
export const constantAttributes: string[] = [attType, attCopyOf]

/**
 * Attributes recommended to be added by users. These are not currently in use. 
 */
export const recommendedAttributes: string[] = [attName, attTextDescription, attImage]

/**
 * List of restricted attributes as a single string with the union of all its elements separated by a comma and a space (', ') 
 */
export const restrictedAttributesToString: string = restrictedAttributes.join(', ')