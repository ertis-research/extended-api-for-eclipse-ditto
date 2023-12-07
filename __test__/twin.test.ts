import { ditto_password, ditto_username } from './../src/static';
import { restrictedAttributes } from './../src/auxiliary/attributes/consts';
import { DittoThing, Features } from './../src/auxiliary/types';
import axios from 'axios'
import { url, ditto, getThingData, data, rest_data, attributes_data, data2, rest_data2, attributes_data2, newAttribute, newFeature, deleteThing, createThing } from './helper';

const dataWithIsType = {attributes: { _isType: false, ...attributes_data },...rest_data}

describe('Simple twins - Create', () => {
    let randomthingId = ""
    const thingId_put = "test:automatic_extended_create_put"
    const thingId_patch = "test:automatic_extended_create_patch"
    const thingId_error = "test:automatic_extended_create_error"

    beforeAll(async () => {
        // It will probably fail, but we don't care. We're just doing this to make sure there are not those twins in Eclipse Ditto.
        try { await deleteThing(randomthingId) } catch (e) {}
        try { await deleteThing(thingId_put) } catch (e) {}
        try { await deleteThing(thingId_patch) } catch (e) {}
        try { await deleteThing(thingId_error) } catch (e) {}
    });

    afterAll(async () => {
        await deleteThing(randomthingId)
        await deleteThing(thingId_put)
        await deleteThing(thingId_patch)
        try { await deleteThing(thingId_error) } catch (e) {} // It will always fail, but we don't care.
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
                _isType: false
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
                _isType: false
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
                _isType: false
            },
            ...rest_data
        })
    })

    test('POST twin - ERROR restricted attributes', async () => {
        for (let attr of restrictedAttributes) {
            try {
                await axios.post(url + "/api/twins", {
                    ...rest_data,
                    attributes: {
                        ...attributes_data,
                        [attr]: null
                    }
                })
            } catch (e: any) {
                expect(e.response.status).toBe(442)
            }
        }
    })

    test('PUT twin to create - ERROR restricted attributes', async () => {
        for (let attr of restrictedAttributes) {
            try {
                await axios.put(url + "/api/twins/" + thingId_error, {
                    policyId: data.policyId,
                    features: data.features,
                    attributes: {
                        ...data.attributes,
                        [attr]: null
                    }
                })
            } catch (e: any) {
                expect(e.response.status).toBe(442)
            }
        }

        try {
            await getThingData(thingId_error)
        } catch(e: any) {
            expect(e.response.status).toBe(404)
        }
    })

    test('PATCH twin to create - ERROR restricted attributes', async () => {

        for (let attr of restrictedAttributes) {
            try {
                await axios.patch(url + "/api/twins/" + thingId_error, {
                    ...rest_data,
                    attributes: {
                        ...attributes_data,
                        [attr]: null
                    }
                })
            } catch (e: any) {
                expect(e.response.status).toBe(442)
            }
        }

        try {
            await getThingData(thingId_error)
        } catch(e: any) {
            expect(e.response.status).toBe(404)
        }
    })

})

describe('Simple twins - Delete', () => {
    let thingId = "test:automatic_extended_delete"

    beforeAll(async () => {
        await createThing(thingId, dataWithIsType)
    });

    afterAll(async () => {
        try { await deleteThing(thingId) } catch (e: any) {} // If the test was not successful, clean up
    });

    test('DELETE twin', async () => {
        const res = await axios.delete(url + "/api/twins/" + thingId)
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        try {
            await getThingData(thingId)
        } catch (e: any) {
            expect(e.response.status).toBe(404)
        }
    })

    test('DELETE twin - ERROR not found', async () => {
        try {
            await axios.delete(url + "/api/twins/test:automatic_extended_error")
        } catch (e: any) {
            expect(e.response.status).toBe(404)
        }
    })

})

describe('Simple twins - Query', () => {
    let thingId = "test:automatic_extended_query"

    beforeAll(async () => {
        await createThing(thingId, dataWithIsType)
    });

    afterAll(async () => {
        await deleteThing(thingId)
    });

    test('GET root twins', async () => {
        const res = await axios.get(url + "/api/twins")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        /*expect(res.data).toContainEqual({
            thingId: thingId,
            ...data
        })*/
    })

    test('GET twin', async () => {
        const res = await axios.get(url + "/api/twins/" + thingId)

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toStrictEqual({
            thingId: thingId,
            ...data
        })
    })

    test('GET twin - ERROR not found', async () => {
        try {
            await axios.get(url + "/api/twins/test:automatic_extended_error")
        } catch (e: any) {
            expect(e.response.status).toBe(404)
        }
    })

})

describe('Simple twins - Modify', () => {

    let thingId = "test:automatic_extended_modify"

    beforeEach(async () => {
        await createThing(thingId, dataWithIsType)
    });

    afterEach(async () => {
        await deleteThing(thingId)
    });

    test('PUT twin to modify', async () => {
        const res = await axios.put(url + "/api/twins/" + thingId, data2)
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        const check = await getThingData(thingId)
        expect(check.data).toStrictEqual({
            thingId: thingId,
            attributes: {
                _isType: false,
                ...attributes_data2
            },
            ...rest_data2
        })
    })

    test('PATCH twin to modify', async () => {
        const res = await axios.patch(url + "/api/twins/" + thingId, {
            attributes: newAttribute, 
            features:  newFeature
        })
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        const check = await getThingData(thingId)
        expect(check).toBeTruthy()
        expect(check.data).toMatchObject({
            thingId: thingId,
            policyId: data.policyId,
            attributes: {
                ...data.attributes,
                ...newAttribute
            },
            features: {
                ...newFeature,
                ...data.features
            }
        })
    })

    test('PUT twin to modify - ERROR restricted attributes', async () => {
        for (let attr of restrictedAttributes) {
            try {
                await axios.put(url + "/api/twins/" + thingId, {
                    policyId: data.policyId,
                    features: data.features,
                    attributes: {
                        ...data.attributes,
                        [attr]: null
                    }
                })
            } catch (e: any) {
                expect(e.response.status).toBe(442)
            }
        }
    })

    test('PUT twin to modify - ERROR attempt to remove all attributes', async () => {
        try {
            await axios.put(url + "/api/twins/" + thingId, {
                policyId: data.policyId,
                features: data.features,
                attributes: null
            })
        } catch (e: any) {
            expect(e.response.status).toBe(442)
        }
    })

    test('PATCH twin to modify - ERROR restricted attributes', async () => {
        for (let attr of restrictedAttributes) {
            try {
                await axios.patch(url + "/api/twins/" + thingId, {
                    attributes: {
                        [attr]: null
                    }
                })
            } catch (e: any) {
                expect(e.response.status).toBe(442)
            }
        }
    })

    test('PATCH twin to modify - ERROR attempt to remove all attributes', async () => {
        try {
            await axios.patch(url + "/api/twins/" + thingId, {
                attributes: null
            })
        } catch (e: any) {
            expect(e.response.status).toBe(442)
        }
    })

})

describe('Compositional twins - Link child', () => {
    let parentId = "test:automatic_extended_parent"
    let childId1 = "test:automatic_extended_child1"
    let childId2 = "test:automatic_extended_child2"

    beforeAll(async () => {
        await createThing(parentId, dataWithIsType)
        await createThing(childId1, dataWithIsType)
        try {
            await deleteThing(childId2)
        } catch (e) {
            // It will probably fail, but we don't care. We're just doing this to make sure there is not this twin in Eclipse Ditto.
        }
    });

    afterAll(async () => {
        await deleteThing(childId1)
        await deleteThing(childId2)
        await deleteThing(parentId)
    });

    test('PUT children - add existing twin as child', async () => {
        const res = await axios.put(url + "/api/twins/" + parentId + "/children/" + childId1)

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        
        const check = await getThingData(childId1)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: childId1,
            attributes: {
                _isType: false,
                _parents: parentId,
                ...attributes_data
            },
            ...rest_data
        })
    })

    test('PUT children - create new twin as child', async () => {
        const res = await axios.put(url + "/api/twins/" + parentId + "/children/" + childId2, data)

        expect(res).toBeTruthy()
        expect(res.status).toBe(201)

        const check = await getThingData(childId2)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: childId2,
            attributes: {
                _isType: false,
                _parents: parentId,
                ...attributes_data
            },
            ...rest_data
        })

    })

})

describe('Compositional twins - Query', () => {
    let parentId = "test:automatic_extended_parent"
    let childId1 = "test:automatic_extended_child1"
    let childId2 = "test:automatic_extended_child2"

    beforeAll(async () => {
        await createThing(parentId, dataWithIsType)
        await createThing(childId1, {attributes: { _isType: false, _parents: parentId, ...attributes_data },...rest_data})
        await createThing(childId2, {attributes: { _isType: false, _parents: parentId, ...attributes_data },...rest_data})
        await new Promise(r => setTimeout(r, 3000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins
    });

    afterAll(async () => {
        await deleteThing(childId1)
        await deleteThing(childId2)
        await deleteThing(parentId)
    });

    test('GET all children', async () => {
        const res = await axios.get(url + "/api/twins/" + parentId + "/children")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toEqual(expect.arrayContaining([
            {
                thingId: childId1,
                attributes: {
                    ...attributes_data,
                    _parents: parentId
                },
                ...rest_data
            },
            {
                thingId: childId2,
                attributes: {
                    ...attributes_data,
                    _parents: parentId
                },
                ...rest_data
            }
        ]))
    })

})