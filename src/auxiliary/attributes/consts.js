//Attributes
const attType = "_type"
const attIsType = "_isType"
const attParent = "_parents"
const attChildren = "_children"
const attName = "name"
const attTextDescription = "text_description"
const attImage = "image"

const privateAttributes = [attIsType]
const restrictedAttributes = [attChildren, attIsType, attParent, attType]
const recommendedAttributes = [attName, attTextDescription, attImage]



module.exports = {
    privateAttributes : privateAttributes,
    restrictedAttributes : restrictedAttributes,
    recommendedAttributes : recommendedAttributes,
    attIsType : attIsType,
    attChildren : attChildren,
    attParent : attParent,
    attType : attType
}