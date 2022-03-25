const {
    restrictedAttributesToString,
    removePrivateAttributesForListOfThings, 
    removePrivateAttributesForThing,
    removeRestrictedAttributesForThing
} = require('../attributes/functions')

//Responses consts
const RestrictedAttributesResponse = {
    status: 442,
    message: "In the definition there is a restricted attribute, these cannot be created or updated.\nRestricted attributes: " + restrictedAttributesToString()
}

const AllAttributesCannotBeRemovedResponse = {
    status: 442,
    message: "Not all attributes can be removed due to restricted attributes.: " + restrictedAttributesToString()
}

const SuccessfulResponse = {
    status : 200,
    message : ""
}

const SuccessfulUnlinkResponse = {
    status : 200,
    message : "The things have been correctly unlinked"
}

const BodyCannotBeEmptyResponse = {
    status: 400,
    message: "To create a thing the body cannot be empty."
}

//Responses functions
const statusIsCorrect = (status) => {
    return status >= 200 && status < 300
}

const addMessageIfStatusIsNotCorrect = (response, finalResponse, message) => {
    if (response != null && !statusIsCorrect(response.status)) {
        finalResponse.status = (response.status == finalResponse.status || finalResponse.status == 200) ? response.status : 500
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

module.exports = {
    RestrictedAttributesResponse : RestrictedAttributesResponse,
    AllAttributesCannotBeRemovedResponse : AllAttributesCannotBeRemovedResponse,
    SuccessfulResponse : SuccessfulResponse,
    SuccessfulUnlinkResponse : SuccessfulUnlinkResponse,
    BodyCannotBeEmptyResponse : BodyCannotBeEmptyResponse,
    statusIsCorrect : statusIsCorrect,
    addMessageIfStatusIsNotCorrect : addMessageIfStatusIsNotCorrect,
    modifyResponseList : modifyResponseList,
    modifyResponseThing : modifyResponseThing
}
