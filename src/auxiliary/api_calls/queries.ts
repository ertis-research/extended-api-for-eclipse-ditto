/**
 * @fileoverview Methods and constants for abstracting text from Eclipse Ditto queries
 * @author Julia Robles <juliarobles@uma.es>
*/

import { attParent, attIsType } from '../attributes/consts'


export const queryThings = "/things"

export const queryRootThings = (isType: boolean, options: string = "") => {
    if (isType) {
        return "/search/things?filter=and(eq(attributes/" + attIsType + ",true),or(not(exists(attributes/" + attParent + ")),eq(attributes/" + attParent + ",null)))" + options
    } else {
        return "/search/things?filter=and(not(eq(attributes/" + attIsType + ",true)),or(not(exists(attributes/" + attParent + ")),eq(attributes/" + attParent + ",null)))" + options
    }
}

export const queryAllThings = (isType: boolean, options: string = "") => {
    if (isType) {
        return "/search/things?filter=eq(attributes/" + attIsType + ",true)" + options
    } else {
        return "/search/things?filter=not(eq(attributes/" + attIsType + ",true))" + options
    }
}

const checkIsType = (isType: boolean) => {
    return "eq(attributes/" + attIsType + "," + isType + ")"
}

export const filterIsType = (isType: boolean) => {
    return "?filter=" + checkIsType(isType)
}

export const conditionIsType = (isType: boolean) => {
    return "?condition=" + checkIsType(isType)
}

export const queryThingWithId = (thingId: string, isType: boolean) => {
    return queryThings + "/" + thingId + conditionIsType(isType)
}

export const countThingWithId = (thingId: string, isType: boolean) => {
    return "/search/things/count" + filterIsType(isType) + ',eq(thingId,"' + thingId + '")'
}

export const queryAttributePath = (thingId: string, attributePath: string, isType: boolean) => {
    return queryThings + "/" + thingId + "/attributes/" + attributePath + conditionIsType(isType)
}

export const queryParent = (thingId: string, isType: boolean) => {
    return queryAttributePath(thingId, attParent, isType)
}

export const queryChildren = (thingId: string, isType: boolean, options = "") => {
    if (isType) {
        return "/search/things?filter=exists(attributes/_parents/" + thingId + ")" + options
    } else {
        return "/search/things?filter=eq(attributes/_parents,'" + thingId + "')" + options
    }
}

export const querySpecificParent = (thingId: string, parentId: string) => {
    return queryAttributePath(thingId, attParent + "/" + parentId, true)
}

export const queryPolicies = (existingPolicies: string[] = []) => {
    var filter = ""
    if (existingPolicies && existingPolicies.length > 0) {
        existingPolicies = existingPolicies.map((policyId) => 'not(eq(policyId,"' + policyId + '"))')
        filter = "&filter=and(" + existingPolicies.join(",") + ")"
    }
    return "/search/things?fields=policyId" + filter
}

export const queryConnection = "/devops/piggyback/connectivity"

export const getConnectionIdsJSON = {
    "targetActorSelection": "/user/connectivityRoot/connectionIdsRetrieval/singleton",
    "headers": {
        "aggregate": false
    },
    "piggybackCommand": {
        "type": "connectivity.commands:retrieveAllConnectionIds"
    }
}

export const getConnectionByIdJSON = (connectionId: string) => {
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

export const closeConnectionJSON = (connectionId: string) => {
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

export const openConnectionJSON = (connectionId: string) => {
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