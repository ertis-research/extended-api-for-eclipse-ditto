//Attributes
const attType = "type"
const attIsType = "_isType"
const attParent = "_parents"
const attCopyOf = "copyOf"
//const attChildren = "_children"
const attName = "name"
const attTextDescription = "text_description"
const attImage = "image"

const privateAttributes = [attIsType]
const restrictedAttributes = [/*attChildren,*/attIsType, attParent, attType, attCopyOf]
const specificAttributes = [attIsType, attParent]
const constantAttributes = [attType]
const recommendedAttributes = [attName, attTextDescription, attImage]


module.exports = {
    privateAttributes : privateAttributes,
    restrictedAttributes : restrictedAttributes,
    recommendedAttributes : recommendedAttributes,
    specificAttributes : specificAttributes,
    constantAttributes : constantAttributes,
    attIsType : attIsType,
    //attChildren : attChildren,
    attParent : attParent,
    attType : attType,
    attCopyOf : attCopyOf
}