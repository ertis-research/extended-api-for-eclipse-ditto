import { restrictedAttributes } from '../src/auxiliary/attributes/consts';
import { DittoThing } from '../src/auxiliary/types';
import axios from 'axios'
import { url, getThingData, data, rest_data, attributes_data, data2, rest_data2, attributes_data2, newAttribute, newFeature, deleteThing, createThing, checkError, checkData } from './helper';

const isType = { _isType: false }
const twinData = { attributes: { ...isType, ...attributes_data }, ...rest_data }
const typeData = { attributes: { _isType: true, ...attributes_data }, ...rest_data }

// This data will only be used to create the twin directly in ditto, so we don't care if the IDs don't exist.
const othersSpecificAttributes = { type: "test:type", _parents: "test:parent", copyOf: "test:copy" }
const twinDataAll = { attributes: { ...isType, ...othersSpecificAttributes, ...attributes_data }, ...rest_data }


describe('Simple twins - Create', () => {
    let randomthingId = ""
    const thingId_put = "test:automatic_extended_create_put"
    const thingId_patch = "test:automatic_extended_create_patch"
    const thingId_error = "test:automatic_extended_create_error"

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

    test('POST twin', async () => {
        const res = await axios.post(url + "/api/twins", data)

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

    test('PUT twin to create', async () => {
        const res = await axios.put(url + "/api/twins/" + thingId_put, data)

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

    test('PATCH twin to create', async () => {
        const res = await axios.patch(url + "/api/twins/" + thingId_patch, data)

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

    test('POST twin - ERROR restricted attributes', async () => {
        for (let attr of restrictedAttributes) {
            try {
                const res = await axios.post(url + "/api/twins", {
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

    test('PUT twin to create - ERROR restricted attributes', async () => {
        for (let attr of restrictedAttributes) {
            try {
                const res = await axios.put(url + "/api/twins/" + thingId_error, {
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

    test('PATCH twin to create - ERROR restricted attributes', async () => {
        for (let attr of restrictedAttributes) {
            try {
                const res = await axios.patch(url + "/api/twins/" + thingId_error, {
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

    test('POST twin to create - ERROR no body', async () => {
        try {
            const res = await axios.post(url + "/api/twins")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 400)
        }
    })

    test('PUT twin to create - ERROR no body', async () => {
        try {
            const res = await axios.put(url + "/api/twins/" + thingId_error)
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

    test('PATCH twin to create - ERROR no body', async () => {
        try {
            const res = await axios.patch(url + "/api/twins/" + thingId_error)
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

describe('Simple twins - Delete', () => {
    let twinId = "test:automatic_extended_delete_twin"
    let typeId = "test:automatic_extended_delete_type"

    beforeAll(async () => {
        await createThing(twinId, twinData)
        await createThing(typeId, typeData)
    });

    afterAll(async () => {
        try { await deleteThing(twinId) } catch (e: any) { } // If the test was not successful, clean up
        await deleteThing(typeId)
    });

    test('DELETE twin', async () => {
        const res = await axios.delete(url + "/api/twins/" + twinId)
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        try {
            const res = await getThingData(twinId)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }
    })

    test('DELETE twin - ERROR not found', async () => {
        try {
            const res = await axios.delete(url + "/api/twins/test:automatic_extended_error")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }
    })

    test('DELETE twin - ERROR because is a type', async () => {
        try {
            const res = await axios.delete(url + "/api/twins/" + typeId)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }
    })

})

describe('Simple twins - Query', () => {
    let twinId = "test:automatic_extended_query_twin"
    let twinIdAll = "test:automatic_extended_query_twin_all"
    let typeId = "test:automatic_extended_query_type"

    beforeAll(async () => {
        await createThing(twinId, twinData)
        await createThing(typeId, typeData)
        await createThing(twinIdAll, twinDataAll)
    });

    afterAll(async () => {
        await deleteThing(twinId)
        await deleteThing(typeId)
        await deleteThing(twinIdAll)
    });

    test('GET root twins', async () => {
        await new Promise(r => setTimeout(r, 5000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twin
        const res = await axios.get(url + "/api/twins")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toBeTruthy()
        const resData = (res.data != null && res.data.hasOwnProperty("items")) ? (res.data as any).items : res.data
        expect(resData).toContainEqual({
            thingId: twinId,
            ...data
        })
        expect(resData).not.toContainEqual({
            thingId: typeId,
            ...data
        })
        expect(resData).not.toContainEqual({
            thingId: twinIdAll,
            attributes: {
                ...othersSpecificAttributes,
                ...attributes_data
            },
            ...rest_data
        })
    }, 10000)

    test('GET twin', async () => {
        const res = await axios.get(url + "/api/twins/" + twinId)

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toStrictEqual({
            thingId: twinId,
            ...data
        })
    })

    test('GET twin - all specific attributes', async () => {
        const res = await axios.get(url + "/api/twins/" + twinIdAll)

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toStrictEqual({
            thingId: twinIdAll,
            attributes: {
                ...othersSpecificAttributes,
                ...attributes_data
            },
            ...rest_data
        })
    })

    test('GET twin - ERROR not found', async () => {
        try {
            const res = await axios.get(url + "/api/twins/test:automatic_extended_error")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }
    })

    test('GET twin - ERROR because is a type', async () => {
        try {
            const res = await axios.get(url + "/api/twins/" + typeId)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }
    })

})

describe('Simple twins - Modify', () => {

    let twinId = "test:automatic_extended_modify_twin"
    let typeId = "test:automatic_extended_modify_type"

    beforeEach(async () => {
        await createThing(twinId, twinDataAll)
        await createThing(typeId, typeData)
    });

    afterEach(async () => {
        await deleteThing(twinId)
        await deleteThing(typeId)
    });

    test('PUT twin to modify', async () => {
        const res = await axios.put(url + "/api/twins/" + twinId, data2)
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        const check = await getThingData(twinId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: twinId,
            attributes: {
                ...isType,
                ...othersSpecificAttributes,
                ...attributes_data2
            },
            ...rest_data2
        })
    })

    test('PUT twin to modify - attempt to remove all attributes', async () => {
        // The response will be correct, but the restricted attributes will not be deleted. 
        const res = await axios.put(url + "/api/twins/" + twinId, {
            policyId: data.policyId,
            features: data.features,
            attributes: null
        })
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        const check = await getThingData(twinId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: twinId,
            attributes: {
                ...isType,
                ...othersSpecificAttributes
            },
            ...rest_data
        })
    })

    test('PATCH twin to modify - add attribute', async () => {
        const res = await axios.patch(url + "/api/twins/" + twinId, {
            attributes: newAttribute,
            features: newFeature
        })
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        const check = await getThingData(twinId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: twinId,
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

    test('PATCH twin to modify - without modifying attributes', async () => {
        const res = await axios.patch(url + "/api/twins/" + twinId, {
            features: newFeature
        })
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        const check = await getThingData(twinId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: twinId,
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

    test('PATCH twin to modify - attempt to remove all attributes', async () => {
        // The response will be correct, but the restricted attributes will not be deleted. 
        const res = await axios.patch(url + "/api/twins/" + twinId, {
            attributes: null
        })
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        const check = await getThingData(twinId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: twinId,
            attributes: {
                ...isType,
                ...othersSpecificAttributes
            },
            ...rest_data
        })
    })

    test('PATCH twin to modify - attempt to remove all attributes and modify something else', async () => {
        // The response will be correct, but the restricted attributes will not be deleted. 
        const res = await axios.patch(url + "/api/twins/" + twinId, {
            attributes: null,
            features: newFeature
        })
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        const check = await getThingData(twinId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: twinId,
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

    test('PUT twin to modify - ERROR restricted attributes', async () => {
        const preData: any = await getThingData(twinId)

        for (let attr of restrictedAttributes) {
            try {
                const res = await axios.put(url + "/api/twins/" + twinId, {
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

        const check = await getThingData(twinId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData.data)
    })

    test('PUT twin to modify - ERROR because is a type', async () => {
        const preData: any = await getThingData(typeId)

        try {
            const res = await axios.put(url + "/api/twins/" + typeId, {
                policyId: data.policyId,
                features: data.features,
                attributes: data.attributes
            })
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }

        const check = await getThingData(typeId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData.data)
    })

    test('PATCH twin to modify - ERROR restricted attributes', async () => {
        const preData: any = await getThingData(twinId)

        for (let attr of restrictedAttributes) {
            try {
                const res = await axios.patch(url + "/api/twins/" + twinId, {
                    attributes: {
                        [attr]: null
                    }
                })
                expect(res).toBeFalsy()
            } catch (e: any) {
                checkError(e, 442)
            }
        }

        const check = await getThingData(twinId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData.data)
    })

    test('PATCH twin to modify - ERROR because is a type', async () => {
        const preData: any = await getThingData(typeId)

        try {
            const res = await axios.patch(url + "/api/twins/" + typeId, {
                attributes: newAttribute
            })
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }

        const check = await getThingData(typeId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData.data)
    })

})

describe('Simple twins - Duplicate', () => {
    let twinId = "test:automatic_extended_duplicate_twin"
    let typeId = "test:automatic_extended_duplicate_type"
    let newId = "test:automatic_extended_duplicate_new_twin"

    beforeEach(async () => {
        await createThing(twinId, twinData)
        try { await deleteThing(newId) } catch (e: any) { } // If the test was not successful, clean up
        await new Promise(r => setTimeout(r, 3000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins
    });

    afterEach(async () => {
        await deleteThing(twinId)
        try { await deleteThing(newId) } catch (e: any) { } // Clean up
    });

    test('POST duplicate twin', async () => {
        const res = await axios.post(url + "/api/twins/" + twinId + "/duplicate/" + newId)

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        let null_rest_data: any = { ...rest_data }
        null_rest_data.features.feature1.properties.value = null

        const check = await getThingData(newId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: newId,
            attributes: {
                copyOf: twinId,
                ...isType,
                ...attributes_data
            },
            ...null_rest_data
        })
    })

    test('POST duplicate twin - with empty body', async () => {
        const res = await axios.post(url + "/api/twins/" + twinId + "/duplicate/" + newId, {})

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        let null_rest_data: any = { ...rest_data }
        null_rest_data.features.feature1.properties.value = null

        const check = await getThingData(newId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: newId,
            attributes: {
                copyOf: twinId,
                ...isType,
                ...attributes_data
            },
            ...null_rest_data
        })
    })

    test('POST duplicate twin - with body', async () => {
        const res = await axios.post(url + "/api/twins/" + twinId + "/duplicate/" + newId, {
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
                copyOf: twinId,
                ...isType,
                ...attributes_data,
                ...newAttribute
            },
            ...null_rest_data
        })
    })

    test('POST duplicate twin - with wrong body (feature)', async () => {
        const res = await axios.post(url + "/api/twins/" + twinId + "/duplicate/" + newId, {
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
                copyOf: twinId,
                ...isType,
                ...attributes_data,
                ...newAttribute
            },
            ...null_rest_data
        })
    })

    test('POST duplicate twin - with wrong body (attribute)', async () => {
        const res = await axios.post(url + "/api/twins/" + twinId + "/duplicate/" + newId, {
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
                copyOf: twinId,
                ...isType,
                ...attributes_data
            },
            ...null_rest_data
        })
    })

    test('POST duplicate twin - ERROR twin with newId already exist', async () => {
        await createThing(newId, twinData)
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        try {
            const res = await axios.post(url + "/api/twins/" + twinId + "/duplicate/" + newId)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 400, "The thing with the provided identifier already exist in Eclipse Ditto.")
        }
    })

    test('POST duplicate twin - ERROR type with newId already exist', async () => {
        await createThing(typeId, typeData)
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        try {
            const res = await axios.post(url + "/api/twins/" + twinId + "/duplicate/" + typeId)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 400, "The thing with the provided identifier already exist in Eclipse Ditto.")
        }

        await deleteThing(typeId)
    })

    test('POST duplicate twin - ERROR attempt to duplicate a type', async () => {
        await createThing(typeId, typeData)
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        try {
            const res = await axios.post(url + "/api/twins/" + typeId + "/duplicate/" + newId)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }

        await deleteThing(typeId)
    })

    test('POST duplicate twin - ERROR body has restricted attributes', async () => {
        for (let attr of restrictedAttributes) {
            try {
                const res = await axios.post(url + "/api/twins/" + twinId + "/duplicate/" + newId, {
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