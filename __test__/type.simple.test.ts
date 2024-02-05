import { restrictedAttributes } from '../src/auxiliary/attributes/consts';
import { DittoThing } from '../src/auxiliary/types';
import axios from 'axios'
import { url, getThingData, data, rest_data, attributes_data, data2, rest_data2, attributes_data2, newAttribute, newFeature, deleteThing, createThing, checkError, checkData } from './helper';

const isType = { _isType: true }
const typeData = { attributes: { ...isType, ...attributes_data }, ...rest_data }
const twinData = { attributes: { _isType: false, ...attributes_data }, ...rest_data }

// This data will only be used to create the twin directly in ditto, so we don't care if the IDs don't exist.
const othersSpecificAttributes = { _parents: "test:type_parent", copyOf: "test:type_copy" }
const typeDataAll = { attributes: { ...isType, ...othersSpecificAttributes, ...attributes_data }, ...rest_data }


describe('Simple types - Create', () => {
    let randomthingId = ""
    const thingId_put = "test:type_automatic_extended_create_put"
    const thingId_patch = "test:type_automatic_extended_create_patch"
    const thingId_error = "test:type_automatic_extended_create_error"

    beforeAll(async () => {
        // It will probably fail, but we don't care. We're just doing this to make sure there are not those twins in Eclipse Ditto.
        try { await deleteThing(thingId_put) } catch (e) { }
        try { await deleteThing(thingId_patch) } catch (e) { }
        try { await deleteThing(thingId_error) } catch (e) { }
    });

    afterAll(async () => {
        try { await deleteThing(randomthingId) } catch (e) { }
        try { await deleteThing(thingId_put) } catch (e) { }
        try { await deleteThing(thingId_patch) } catch (e) { }
        try { await deleteThing(thingId_error) } catch (e) { } // It will always fail, but we don't care.
    });

    test('POST type', async () => {
        const res = await axios.post(url + "/api/types", data)

        const dittoThing = res.data as DittoThing
        randomthingId = (dittoThing.thingId) ? dittoThing.thingId : ""

        expect(res).toBeTruthy()
        expect(res.status).toBe(201)
        expect(res.data).toStrictEqual({
            thingId: randomthingId,
            ...data
        })

        const check = await getThingData(randomthingId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: randomthingId,
            attributes: {
                ...attributes_data,
                ...isType
            },
            ...rest_data
        })
    })

    test('PUT type to create', async () => {
        const res = await axios.put(url + "/api/types/" + thingId_put, data)

        expect(res).toBeTruthy()
        expect(res.status).toBe(201)
        expect(res.data).toStrictEqual({
            thingId: thingId_put,
            ...data
        })

        const check = await getThingData(thingId_put)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: thingId_put,
            attributes: {
                ...attributes_data,
                ...isType
            },
            ...rest_data
        })
    })

    test('PATCH type to create', async () => {
        const res = await axios.patch(url + "/api/types/" + thingId_patch, data)

        expect(res).toBeTruthy()
        expect(res.status).toBe(201)
        expect(res.data).toStrictEqual({
            thingId: thingId_patch,
            ...data
        })

        const check = await getThingData(thingId_patch)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: thingId_patch,
            attributes: {
                ...attributes_data,
                ...isType
            },
            ...rest_data
        })
    })

    test('POST type - ERROR restricted attributes', async () => {
        for (let attr of restrictedAttributes) {
            try {
                const res = await axios.post(url + "/api/types", {
                    ...rest_data,
                    attributes: {
                        ...attributes_data,
                        [attr]: null
                    }
                })
                expect(res).toBeFalsy()
            } catch (e: any) {
                checkError(e, 442)
            }
        }
    })

    test('PUT type to create - ERROR restricted attributes', async () => {
        for (let attr of restrictedAttributes) {
            try {
                const res = await axios.put(url + "/api/types/" + thingId_error, {
                    policyId: data.policyId,
                    features: data.features,
                    attributes: {
                        ...data.attributes,
                        [attr]: null
                    }
                })
                expect(res).toBeFalsy()
            } catch (e: any) {
                checkError(e, 442)
            }
        }

        try {
            const res = await getThingData(thingId_error)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }
    })

    test('PATCH type to create - ERROR restricted attributes', async () => {
        for (let attr of restrictedAttributes) {
            try {
                const res = await axios.patch(url + "/api/types/" + thingId_error, {
                    ...rest_data,
                    attributes: {
                        ...attributes_data,
                        [attr]: null
                    }
                })
                expect(res).toBeFalsy()
            } catch (e: any) {
                checkError(e, 442)
            }
        }

        try {
            const res = await getThingData(thingId_error)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }
    })

    test('POST type to create - ERROR no body', async () => {
        try {
            const res = await axios.post(url + "/api/types")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 400)
        }
    })

    test('PUT type to create - ERROR no body', async () => {
        try {
            const res = await axios.put(url + "/api/types/" + thingId_error)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 400)
        }

        try {
            const res = await getThingData(thingId_error)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }
    })

    test('PATCH type to create - ERROR no body', async () => {
        try {
            const res = await axios.patch(url + "/api/types/" + thingId_error)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 400)
        }

        try {
            await getThingData(thingId_error)
        } catch (e: any) {
            checkError(e, 404)
        }
    })

})

describe('Simple types - Delete', () => {
    let twinId = "test:type_automatic_extended_delete_twin"
    let typeId = "test:type_automatic_extended_delete_type"

    beforeAll(async () => {
        await createThing(typeId, typeData)
        await createThing(twinId, twinData)
    });

    afterAll(async () => {
        try { await deleteThing(typeId) } catch (e: any) { } // If the test was not successful, clean up
        await deleteThing(twinId)
    });

    test('DELETE type', async () => {
        const res = await axios.delete(url + "/api/types/" + typeId)
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        try {
            const res = await getThingData(typeId)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }
    })

    test('DELETE type - ERROR not found', async () => {
        try {
            const res = await axios.delete(url + "/api/types/test:type_automatic_extended_error")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }
    })

    test('DELETE type - ERROR because is a twin', async () => {
        try {
            const res = await axios.delete(url + "/api/types/" + twinId)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }
    })

})

describe('Simple types - Query', () => {
    let typeId = "test:type_automatic_extended_query_type"
    let typeIdAll = "test:type_automatic_extended_query_type_all"
    let twinId = "test:type_automatic_extended_query_twin"

    beforeAll(async () => {
        await createThing(typeId, typeData)
        await createThing(twinId, twinData)
        await createThing(typeIdAll, typeDataAll)
    });

    afterAll(async () => {
        await deleteThing(twinId)
        await deleteThing(typeId)
        await deleteThing(typeIdAll)
    });

    test('GET root types', async () => {
        await new Promise(r => setTimeout(r, 5000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twin
        const res = await axios.get(url + "/api/types")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        const resData = (res.data != null && res.data.hasOwnProperty("items")) ? (res.data as any).items : res.data
        expect(resData).toContainEqual({
            thingId: typeId,
            ...data
        })
        expect(resData).not.toContainEqual({
            thingId: twinId,
            ...data
        })
        expect(resData).not.toContainEqual({
            thingId: typeIdAll,
            attributes: {
                ...othersSpecificAttributes,
                ...attributes_data
            },
            ...rest_data
        })
    }, 10000)

    test('GET all types', async () => {
        await new Promise(r => setTimeout(r, 5000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twin
        const res = await axios.get(url + "/api/types/all")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        const resData = (res.data != null && res.data.hasOwnProperty("items")) ? (res.data as any).items : res.data
        expect(resData).toContainEqual({
            thingId: typeId,
            ...data
        })
        expect(resData).not.toContainEqual({
            thingId: twinId,
            ...data
        })
        expect(resData).toContainEqual({
            thingId: typeIdAll,
            attributes: {
                ...othersSpecificAttributes,
                ...attributes_data
            },
            ...rest_data
        })
    }, 10000)

    test('GET type', async () => {
        const res = await axios.get(url + "/api/types/" + typeId)

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toStrictEqual({
            thingId: typeId,
            ...data
        })
    })

    test('GET type - all specific attributes', async () => {
        const res = await axios.get(url + "/api/types/" + typeIdAll)

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toStrictEqual({
            thingId: typeIdAll,
            attributes: {
                ...othersSpecificAttributes,
                ...attributes_data
            },
            ...rest_data
        })
    })

    test('GET type - ERROR not found', async () => {
        try {
            const res = await axios.get(url + "/api/types/test:type_automatic_extended_error")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }
    })

    test('GET type - ERROR because is a type', async () => {
        try {
            const res = await axios.get(url + "/api/types/" + twinId)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }
    })

})

describe('Simple twins - Modify', () => {

    let twinId = "test:type_automatic_extended_modify_twin"
    let typeId = "test:type_automatic_extended_modify_type"

    beforeEach(async () => {
        await createThing(typeId, typeDataAll)
        await createThing(twinId, twinData)
    });

    afterEach(async () => {
        await deleteThing(twinId)
        await deleteThing(typeId)
    });

    test('PUT type to modify', async () => {
        const res = await axios.put(url + "/api/types/" + typeId, data2)
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        const check = await getThingData(typeId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: typeId,
            attributes: {
                ...isType,
                ...othersSpecificAttributes,
                ...attributes_data2
            },
            ...rest_data2
        })
    })

    test('PUT type to modify - attempt to remove all attributes', async () => {
        // The response will be correct, but the restricted attributes will not be deleted. 
        const res = await axios.put(url + "/api/types/" + typeId, {
            policyId: data.policyId,
            features: data.features,
            attributes: null
        })
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        const check = await getThingData(typeId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: typeId,
            attributes: {
                ...isType,
                ...othersSpecificAttributes
            },
            ...rest_data
        })
    })

    test('PATCH type to modify - add attribute', async () => {
        const res = await axios.patch(url + "/api/types/" + typeId, {
            attributes: newAttribute,
            features: newFeature
        })
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        const check = await getThingData(typeId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: typeId,
            policyId: data.policyId,
            attributes: {
                ...isType,
                ...othersSpecificAttributes,
                ...data.attributes,
                ...newAttribute
            },
            features: {
                ...newFeature,
                ...data.features
            }
        })
    })

    test('PATCH type to modify - without modifying attributes', async () => {
        const res = await axios.patch(url + "/api/types/" + typeId, {
            features: newFeature
        })
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        const check = await getThingData(typeId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: typeId,
            policyId: data.policyId,
            attributes: {
                ...isType,
                ...othersSpecificAttributes,
                ...data.attributes
            },
            features: {
                ...newFeature,
                ...data.features
            }
        })
    })

    test('PATCH type to modify - attempt to remove all attributes', async () => {
        // The response will be correct, but the restricted attributes will not be deleted. 
        const res = await axios.patch(url + "/api/types/" + typeId, {
            attributes: null
        })
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        const check = await getThingData(typeId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: typeId,
            attributes: {
                ...isType,
                ...othersSpecificAttributes
            },
            ...rest_data
        })
    })

    test('PATCH type to modify - attempt to remove all attributes and modify something else', async () => {
        // The response will be correct, but the restricted attributes will not be deleted. 
        const res = await axios.patch(url + "/api/types/" + typeId, {
            attributes: null,
            features: newFeature
        })
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        const check = await getThingData(typeId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: typeId,
            policyId: data.policyId,
            attributes: {
                ...isType,
                ...othersSpecificAttributes
            },
            features: {
                ...data.features,
                ...newFeature
            }
        })
    })

    test('PUT type to modify - ERROR restricted attributes', async () => {
        const preData: any = await getThingData(typeId)

        for (let attr of restrictedAttributes) {
            try {
                const res = await axios.put(url + "/api/types/" + typeId, {
                    policyId: data.policyId,
                    features: data.features,
                    attributes: {
                        ...data.attributes,
                        [attr]: null
                    }
                })
                expect(res).toBeFalsy()
            } catch (e: any) {
                checkError(e, 442)
            }
        }

        const check = await getThingData(typeId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData.data)
    })

    test('PUT type to modify - ERROR because is a type', async () => {
        const preData: any = await getThingData(twinId)

        try {
            const res = await axios.put(url + "/api/types/" + twinId, {
                policyId: data.policyId,
                features: data.features,
                attributes: data.attributes
            })
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }

        const check = await getThingData(twinId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData.data)
    })

    test('PATCH type to modify - ERROR restricted attributes', async () => {
        const preData: any = await getThingData(typeId)

        for (let attr of restrictedAttributes) {
            try {
                const res = await axios.patch(url + "/api/types/" + typeId, {
                    attributes: {
                        [attr]: null
                    }
                })
                expect(res).toBeFalsy()
            } catch (e: any) {
                checkError(e, 442)
            }
        }

        const check = await getThingData(typeId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData.data)
    })

    test('PATCH type to modify - ERROR because is a twin', async () => {
        const preData: any = await getThingData(twinId)

        try {
            const res = await axios.patch(url + "/api/types/" + twinId, {
                attributes: newAttribute
            })
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }

        const check = await getThingData(twinId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData.data)
    })

})

describe('Simple types - Create twin from type', () => {
    let twinId = "test:type_automatic_extended_create_twin"
    let typeId = "test:type_automatic_extended_create_type"
    let newId = "test:type_automatic_extended_create_new_twin"

    beforeEach(async () => {
        await createThing(typeId, typeData)
        try { await deleteThing(newId) } catch (e: any) { } // If the test was not successful, clean up
        await new Promise(r => setTimeout(r, 3000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins
    });

    afterEach(async () => {
        await deleteThing(typeId)
        try { await deleteThing(newId) } catch (e: any) { } // Clean up
    });

    test('POST create twin from type', async () => {
        const res = await axios.post(url + "/api/types/" + typeId + "/create/" + newId)

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        let null_rest_data: any = { ...rest_data }
        null_rest_data.features.feature1.properties.value = null

        const check = await getThingData(newId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: newId,
            attributes: {
                type: typeId,
                _isType: false,
                ...attributes_data
            },
            ...null_rest_data
        })
    })

    test('POST create twin from type - with empty body', async () => {
        const res = await axios.post(url + "/api/types/" + typeId + "/create/" + newId, {})

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        let null_rest_data: any = { ...rest_data }
        null_rest_data.features.feature1.properties.value = null

        const check = await getThingData(newId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: newId,
            attributes: {
                type: typeId,
                _isType: false,
                ...attributes_data
            },
            ...null_rest_data
        })
    })

    test('POST create twin from type - with body', async () => {
        const res = await axios.post(url + "/api/types/" + typeId + "/create/" + newId, {
            attributes: newAttribute,
            features: newFeature
        })

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        let null_rest_data: any = {
            policyId: rest_data.policyId,
            features: {
                ...rest_data.features,
                ...newFeature
            }
        }
        null_rest_data.features.feature1.properties.value = null
        null_rest_data.features.feature3.properties.value = null

        const check = await getThingData(newId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: newId,
            attributes: {
                type: typeId,
                _isType: false,
                ...attributes_data,
                ...newAttribute
            },
            ...null_rest_data
        })
    })

    test('POST create twin from type - with wrong body (feature)', async () => {
        const res = await axios.post(url + "/api/types/" + typeId + "/create/" + newId, {
            attributes: newAttribute,
            ...newFeature
        })
        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        let null_rest_data: any = { ...rest_data }
        null_rest_data.features.feature1.properties.value = null

        const check = await getThingData(newId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: newId,
            attributes: {
                type: typeId,
                _isType: false,
                ...attributes_data,
                ...newAttribute
            },
            ...null_rest_data
        })
    })

    test('POST create twin from type - with wrong body (attribute)', async () => {
        const res = await axios.post(url + "/api/types/" + typeId + "/create/" + newId, {
            ...newAttribute,
            features: newFeature
        })
        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        let null_rest_data: any = {
            policyId: rest_data.policyId,
            features: {
                ...rest_data.features,
                ...newFeature
            }
        }
        null_rest_data.features.feature1.properties.value = null
        null_rest_data.features.feature3.properties.value = null

        const check = await getThingData(newId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: newId,
            attributes: {
                type: typeId,
                _isType: false,
                ...attributes_data
            },
            ...null_rest_data
        })
    })

    test('POST create twin from type - ERROR twin with newId already exist', async () => {
        await createThing(newId, typeData)
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        try {
            const res = await axios.post(url + "/api/types/" + typeId + "/create/" + newId)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 400, "The thing with the provided identifier already exist in Eclipse Ditto.")
        }
    })

    test('POST create twin from type - ERROR type with newId already exist', async () => {
        await createThing(twinId, twinData)
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        try {
            const res = await axios.post(url + "/api/types/" + typeId + "/create/" + twinId)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 400, "The thing with the provided identifier already exist in Eclipse Ditto.")
        }

        await deleteThing(twinId)
    })

    test('POST create twin from type - ERROR attempt to create a twin from twin', async () => {
        await createThing(twinId, twinData)
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        try {
            const res = await axios.post(url + "/api/types/" + twinId + "/create/" + newId)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }

        await deleteThing(twinId)
    })

    test('POST create twin from type - ERROR body has restricted attributes', async () => {
        for (let attr of restrictedAttributes) {
            try {
                const res = await axios.post(url + "/api/types/" + typeId + "/create/" + newId, {
                    attributes: {
                        [attr]: null
                    }
                })
                expect(res).toBeFalsy()
            } catch (e: any) {
                checkError(e, 442)
            }
        }
    })

})