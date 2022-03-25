const { attChildren, attParent, attIsType } = require('../attributes/consts')

const queryRootThings = (isType) => {
    if (isType) {
        return "/search/things?filter=and(eq(attributes/" + attIsType + ",true),or(not(exists(attributes/" + attParent + ")),eq(attributes/" + attParent + ",null)))"
    } else {
        return "/search/things?filter=and(not(eq(attributes/" + attIsType + ",true)),or(not(exists(attributes/" + attParent + ")),eq(attributes/" + attParent + ",null)))"
    }
} 
const queryThings = "/things"

const conditionIsType = (isType) => {
    return "?condition=eq(attributes/" + attIsType + "," + isType + ")"
}

const queryThingWithId = (thingId, isType) => {
    return queryThings + "/" + thingId + conditionIsType(isType)
}

const queryAttributePath = (thingId, attributePath, isType) => {
    return queryThings + "/" + thingId + "/attributes/" + attributePath + conditionIsType(isType)
}

const queryParent = (thingId, isType) => {
    return queryAttributePath(thingId, attParent, isType)
}

const queryChildren = (thingId, isType) => {
    return queryAttributePath(thingId, attChildren, isType) 
}

const querySpecificChildren = (thingId, childrenId, isType) => {
    return queryAttributePath(thingId, attChildren + "/" + childrenId, isType)
}

const querySpecificParent = (thingId, parentId) => {
    return queryAttributePath(thingId, attParent + "/" + parentId, true)
}

/*
const queryListOfThings = (list) => {
    return queryThings + "?ids=" + list.join(',')
}
*/

module.exports = {
    queryRootThings : queryRootThings,
    queryThings : queryThings,
    queryParent : queryParent,
    queryChildren : queryChildren,
    querySpecificChildren : querySpecificChildren,
    queryThingWithId : queryThingWithId,
    querySpecificParent : querySpecificParent
}