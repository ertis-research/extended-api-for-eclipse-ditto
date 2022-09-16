const { /*attChildren,*/ attParent, attIsType } = require('../attributes/consts')

const queryRootThings = (isType, options="") => {
    if (isType) {
        return "/search/things?filter=and(eq(attributes/" + attIsType + ",true),or(not(exists(attributes/" + attParent + ")),eq(attributes/" + attParent + ",null)))" + options 
    } else {
        return "/search/things?filter=and(not(eq(attributes/" + attIsType + ",true)),or(not(exists(attributes/" + attParent + ")),eq(attributes/" + attParent + ",null)))" + options
    }
} 

const queryAllThings = (isType, options="") => {
    if (isType) {
        return "/search/things?filter=eq(attributes/" + attIsType + ",true)" + options 
    } else {
        return "/search/things?filter=not(eq(attributes/" + attIsType + ",true))" + options
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

const queryChildren = (thingId, isType, options="") => {
    if(isType){
        return "/search/things?filter=exists(attributes/_parents/" + thingId + ")" + options
    } else {
        return "/search/things?filter=eq(attributes/_parents,'" + thingId + "')" + options
    }
    //return queryAttributePath(thingId, attChildren, isType) 
}

/*
const queryChildren = (thingId, isType, cursor=null, size=200) => {
    textCursor = (cursor !== null) ? ",cursor(" + cursor + ")" : ""
    if(isType){
        return "/search/things?filter=exists(attributes/_parents/" + thingId + ")&option=size(" + size + ")" + textCursor
    } else {
        return "/search/things?filter=eq(attributes/_parents,'" + thingId + "')&option=size(" + size + ")" + textCursor
    }
    //return queryAttributePath(thingId, attChildren, isType) 
    
}
/*
const querySpecificChildren = (thingId, childrenId, isType) => {
    return queryAttributePath(thingId, attChildren + "/" + childrenId, isType)
}*/

const querySpecificParent = (thingId, parentId) => {
    return queryAttributePath(thingId, attParent + "/" + parentId, true)
}

/*
const queryListOfThings = (list) => {
    return queryThings + "?ids=" + list.join(',')
}
*/

const queryPolicies = (existingPolicies=[]) => {
    var filter = ""
    if (existingPolicies && existingPolicies.length > 0) {
        existingPolicies = existingPolicies.map((policyId) => 'not(eq(policyId,"' + policyId + '"))')
        filter = "&filter=and(" + existingPolicies.join(",") + ")"
    }
    return "/search/things?fields=policyId" + filter
}

const queryConnection = "/devops/piggyback/connectivity"

const getConnectionIdsJSON = {
    "targetActorSelection": "/user/connectivityRoot/connectionIdsRetrieval/singleton",
    "headers": {
      "aggregate": false
    },
    "piggybackCommand": {
      "type": "connectivity.commands:retrieveAllConnectionIds"
    }
  }

const getConnectionByIdJSON = (connectionId) => {
    return {
        "targetActorSelection": "/system/sharding/connection",
        "headers": {
            "aggregate": false,
            "is-group-topic": true,
            "ditto-sudo": true
        },
        "piggybackCommand": {
            "type": "connectivity.commands:retrieveConnection",
            "connectionId": connectionId
        }
    }
}

const closeConnectionJSON = (connectionId) => {
    return {
        "targetActorSelection": "/system/sharding/connection",
        "headers": {
            "aggregate": false
        },
        "piggybackCommand": {
            "type": "connectivity.commands:closeConnection",
            "connectionId": connectionId
        }
    }
}

const openConnectionJSON = (connectionId) => {
    return {
        "targetActorSelection": "/system/sharding/connection",
        "headers": {
            "aggregate": false
        },
        "piggybackCommand": {
            "type": "connectivity.commands:openConnection",
            "connectionId": connectionId
        }
    }
}

module.exports = {
    queryRootThings : queryRootThings,
    queryAllThings : queryAllThings,
    queryThings : queryThings,
    queryParent : queryParent,
    queryChildren : queryChildren,
    //querySpecificChildren : querySpecificChildren,
    queryThingWithId : queryThingWithId,
    querySpecificParent : querySpecificParent,
    queryPolicies : queryPolicies,
    queryConnection : queryConnection,
    getConnectionIdsJSON : getConnectionIdsJSON,
    getConnectionByIdJSON : getConnectionByIdJSON,
    closeConnectionJSON : closeConnectionJSON,
    openConnectionJSON : openConnectionJSON
}