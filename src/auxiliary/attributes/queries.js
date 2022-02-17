const { attChildren, attParent } = require('./consts')

const queryRootThings = "/search/things?filter=and(not(eq(attributes/isType,true)),or(not(exists(attributes/" + attParent + ")),eq(attributes/" + attParent + ",null)))"
const queryThings = "/things"

const queryAttributePath = (thingId, attributePath) => {
    return queryThings + "/" + thingId + "/attributes/" + attributePath 
}

const queryParent = (thingId) => {
    return queryAttributePath(thingId, attParent)
}

const queryChildren = (thingId) => {
    return queryAttributePath(thingId, attChildren) 
}

const querySpecificChildren = (thingId, attribute) => {
    return queryAttributePath(thingId, attChildren + "/" + attribute)
}

module.exports = {
    queryRootThings : queryRootThings,
    queryThings : queryThings,
    queryParent : queryParent,
    queryChildren : queryChildren,
    querySpecificChildren : querySpecificChildren
}