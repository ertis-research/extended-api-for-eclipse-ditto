import axios from "axios"

export const url = "http://" + process.env.HOST + ":" + process.env.PORT
export const ditto = process.env.DITTO_URI_THINGS
const tokenAPI: string = Buffer.from(`${process.env.DITTO_USERNAME_API}:${process.env.DITTO_PASSWORD_API}`, 'utf8').toString('base64')

export const createThing = (thingId:string, data:any) => {
    return axios.put(ditto + "/api/2/things/" + thingId, data, { headers: { Authorization: `Basic ${tokenAPI}`, 'Content-Type': 'application/json; charset=utf-8', 'Accept': 'application/json'}})
}

export const getThingData = (thingId:string) => {
    return axios.get(ditto + "/api/2/things/" + thingId, { headers: { Authorization: `Basic ${tokenAPI}`, 'Content-Type': 'application/json; charset=utf-8', 'Accept': 'application/json'}})
}

export const deleteThing = (thingId:string) => {
    return axios.delete(ditto + "/api/2/things/" + thingId, { headers: { Authorization: `Basic ${tokenAPI}`, 'Content-Type': 'application/json; charset=utf-8', 'Accept': 'application/json'}})
}

export const attributes_data = {
    name: "Automatic test from extended api"
}

export const rest_data = {
    policyId: "twin1:basic_policy",
    features: {
        feature1: {
            properties: {
                value: 1
            }
        }
    }
}

export const data = {
    ...rest_data,
    attributes: attributes_data
}

export const attributes_data2 = {
    name: "Automatic test from extended api"
}

export const rest_data2 = {
    policyId: "twin1:basic_policy",
    features: {
        feature2: {
            properties: {
                value: 1
            }
        }
    }  
}

export const data2 = {
    ...rest_data2,
    attributes: attributes_data2
}

export const newAttribute = {
    test: "test"
}

export const newFeature = {
    feature3: {
        properties: {
            value: 2
        }
    }
}