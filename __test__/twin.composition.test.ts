import { restrictedAttributes } from '../src/auxiliary/attributes/consts'
import axios from 'axios'
import { url, getThingData, data, rest_data, attributes_data, data2, rest_data2, attributes_data2, deleteThing, createThing, checkError, checkData } from './helper';


const isType = { _isType: false }
const twinData = { attributes: { ...isType, ...attributes_data }, ...rest_data }
const typeData = { attributes: { _isType: true, ...attributes_data }, ...rest_data }

// This data will only be used to create the twin directly in ditto, so we don't care if the IDs don't exist.
const othersSpecificAttributes = { type: "test:type", _parents: "test:parent", copyOf: "test:copy" }
const twinDataAll = { attributes: { ...isType, ...othersSpecificAttributes, ...attributes_data }, ...rest_data }

describe('Compositional twins - Query', () => {
    let parentId = "test:automatic_extended_parent"
    let childId1 = "test:automatic_extended_child1"
    let childId2 = "test:automatic_extended_child2"
    let badChildId = "test:automatic_extended_badChild"
    let anotherChild = "test:automatic_extended_anotherChild"

    beforeAll(async () => {
        await createThing(parentId, twinData)
        await createThing(childId1, { attributes: { _isType: false, _parents: parentId, ...attributes_data }, ...rest_data })
        await createThing(childId2, { attributes: { _isType: false, _parents: parentId }, ...rest_data })
        await createThing(badChildId, { attributes: { _isType: true, _parents: parentId, ...attributes_data }, ...rest_data })
        await new Promise(r => setTimeout(r, 3000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins
    });

    afterAll(async () => {
        await deleteThing(childId1)
        await deleteThing(childId2)
        await deleteThing(parentId)
        await deleteThing(badChildId)
        try { await deleteThing(anotherChild) } catch (e) {}
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
                    _parents: parentId
                },
                ...rest_data
            }
        ]))
        expect(res.data).not.toContainEqual([
            {
                thingId: badChildId,
                attributes: {
                    ...attributes_data,
                    _parents: parentId
                },
                ...rest_data
            }
        ])
    })

    test('GET all children - empty list', async () => {
        const res = await axios.get(url + "/api/twins/" + childId1 + "/children")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toStrictEqual([])
    })

    
    test('GET all children - more than 200 children', async () => {
        const numChildren = 201
        let expectedArray:any[] = []
        for (let i = 1; i <= numChildren; i++) {
            await createThing("test:automatic_extended_child200_" + i, { attributes: { _isType: false, _parents: parentId }, ...rest_data })
            expectedArray = [
                ...expectedArray,
                {
                    thingId: "test:automatic_extended_child200_" + i,
                    attributes: {
                        _parents: parentId
                    },
                    ...rest_data
                }
            ]
        }
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        const res = await axios.get(url + "/api/twins/" + parentId + "/children")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toEqual(expect.arrayContaining(expectedArray))

        for (let i = 1; i <= numChildren; i++) {
            await deleteThing("test:automatic_extended_child200_" + i)
        }
    }, 1000000)

    test('GET all children - using options', async () => {
        const numChildren = 10
        let expectedArray:any[] = []
        for (let i = 1; i <= numChildren; i++) {
            await createThing("test:automatic_extended_child" + i, { attributes: { _isType: false, _parents: parentId }, ...rest_data })
            expectedArray = [
                ...expectedArray,
                {
                    thingId: "test:automatic_extended_child" + i,
                    attributes: {
                        _parents: parentId
                    },
                    ...rest_data
                }
            ]
        }
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        const res = await axios.get(url + "/api/twins/" + parentId + "/children?option=size(5)")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        const data1 = res.data as any
        expect(data1.items).toBeTruthy()
        expect(data1.cursor).toBeTruthy()
        expect(data1.items.length).toBe(5)

        const res2 = await axios.get(url + "/api/twins/" + parentId + "/children?option=size(5),cursor(" + data1.cursor + ")")
        expect(res2.status).toBe(200)
        const data2 = res2.data as any
        expect(data2.items).toBeTruthy()
        expect(data2.items.length).toBe(5)

        expect([...data1.items, ...data2.items]).toEqual(expect.arrayContaining(expectedArray))

        for (let i = 3; i <= numChildren; i++) {
            await deleteThing("test:automatic_extended_child" + i)
        }
    }, 1000000)

    test('GET parent', async () => {
        const res = await axios.get(url + "/api/twins/" + childId1 + "/parent")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toEqual(parentId)
    })

    test('GET parent - ERROR not found parent', async () => {
        try {
            const res = await axios.get(url + "/api/twins/" + parentId + "/parent")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }
    })

    test('GET parent - ERROR child is a type', async () => {
        try {
            const res = await axios.get(url + "/api/twins/" + badChildId + "/parent")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }
    })
/*
    test('GET parent - ERROR parent is a type', async () => {
        await createThing(anotherChild, { attributes: { _isType: false, _parents: badChildId }, ...rest_data })
        try {
            const res = await axios.get(url + "/api/twins/" + anotherChild + "/parent")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }
    })
*/
})

describe('Compositional twins - Delete twin with children', () => {
    let parentId = "test:automatic_extended_parent"
    let childId1 = "test:automatic_extended_child1"
    let childId2 = "test:automatic_extended_child2"
    let badChildId = "test:automatic_extended_badChild"
    let notFound = "test:automatic_extended_notfound"

    beforeEach(async () => {
        await createThing(parentId, twinData)
        await createThing(childId1, { attributes: { _isType: false, _parents: parentId, ...attributes_data }, ...rest_data })
        await createThing(childId2, { attributes: { _isType: false, _parents: parentId }, ...rest_data })
        await createThing(badChildId, { attributes: { _isType: true, _parents: parentId, ...attributes_data }, ...rest_data })
        await new Promise(r => setTimeout(r, 3000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins
    });

    afterAll(async () => {
        try { await deleteThing(childId1) } catch (e) { }
        try { await deleteThing(childId2) } catch (e) { }
        try { await deleteThing(parentId) } catch (e) { }
        await deleteThing(badChildId)
    });

    test('DELETE twin and all children', async () => {
        const preData: any = await getThingData(badChildId)

        const res = await axios.delete(url + "/api/twins/" + parentId + "/children")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        try {
            await getThingData(parentId)
        } catch (e: any) {
            expect(e.response.status).toBe(404)
        }

        try {
            await getThingData(childId1)
        } catch (e: any) {
            expect(e.response.status).toBe(404)
        }

        try {
            await getThingData(childId2)
        } catch (e: any) {
            expect(e.response.status).toBe(404)
        }

        const check = await getThingData(badChildId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData.data)
    })

    test('DELETE only twin and unlink children', async () => {
        let preData_1: any = await getThingData(childId1)
        let preData_2: any = await getThingData(childId2)
        const preData_bad: any = await getThingData(badChildId)

        const res = await axios.delete(url + "/api/twins/" + parentId)
        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        try {
            const res = await getThingData(parentId)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }

        delete preData_1.data.attributes._parents
        let check = await getThingData(childId1)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData_1.data)

        delete preData_2.data.attributes._parents
        check = await getThingData(childId2)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData_2.data)

        check = await getThingData(badChildId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData_bad.data)
    })

    test('DELETE twin and all children - ERROR is a type', async () => {
        await createThing(parentId, typeData)
        const preData1: any = await getThingData(childId1)
        const preData2: any = await getThingData(childId2)
        const preData3: any = await getThingData(badChildId)

        try {
            const res = await axios.delete(url + "/api/twins/" + parentId + "/children")
            expect(res).toBeFalsy()
        } catch(e) {
            checkError(e, 412)
        }

        let check = await getThingData(parentId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({ thingId: parentId, ...typeData })

        check = await getThingData(childId1)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData1.data)

        check = await getThingData(childId2)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData2.data)

        check = await getThingData(badChildId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData3.data)
    })

    test('DELETE only twin and unlink children - ERROR is a type', async () => {
        await createThing(parentId, typeData) // TIENES QUE HACER ESTA 
        const preData1: any = await getThingData(childId1)
        const preData2: any = await getThingData(childId2)
        const preData3: any = await getThingData(badChildId)

        try {
            const res = await axios.delete(url + "/api/twins/" + parentId)
            expect(res).toBeFalsy()
        } catch(e) {
            checkError(e, 412)
        }

        let check = await getThingData(parentId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({ thingId: parentId, ...typeData })

        check = await getThingData(childId1)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData1.data)

        check = await getThingData(childId2)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData2.data)

        check = await getThingData(badChildId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData3.data)
    })

    test('DELETE twin and all children - ERROR not found', async () => {
        try {
            const res = await axios.delete(url + "/api/twins/" + notFound + "/children")
            expect(res).toBeFalsy()
        } catch(e) {
            checkError(e, 404)
        }
    })

    test('DELETE only twin and unlink children - ERROR not found', async () => {
        await createThing(parentId, typeData) // TIENES QUE HACER ESTA 
        const preData1: any = await getThingData(childId1)
        const preData2: any = await getThingData(childId2)
        const preData3: any = await getThingData(badChildId)

        try {
            const res = await axios.delete(url + "/api/twins/" + parentId)
            expect(res).toBeFalsy()
        } catch(e) {
            checkError(e, 412)
        }

        let check = await getThingData(parentId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({ thingId: parentId, ...typeData })

        check = await getThingData(childId1)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData1.data)

        check = await getThingData(childId2)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData2.data)

        check = await getThingData(badChildId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData3.data)
    })
})

describe('Compositional twins - Link child', () => {
    let parentId = "test:automatic_extended_parent"
    let childId1 = "test:automatic_extended_child1"
    let childId2 = "test:automatic_extended_child2"
    let badChild = "test:automatic_extended_bad_child"

    beforeAll(async () => {
        await createThing(parentId, twinData)
        //await new Promise(r => setTimeout(r, 3000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins
    });

    afterAll(async () => {
        await deleteThing(parentId)
    });

    test('PUT children - add existing twin as child', async () => {
        await createThing(childId1, twinData)

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

        await deleteThing(childId1)
    })

    test('PUT children - add existing twin as child and modify its data (child data)', async () => {
        await createThing(childId1, twinData)

        const res = await axios.put(url + "/api/twins/" + parentId + "/children/" + childId1, data2)

        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        const check = await getThingData(childId1)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: childId1,
            attributes: {
                _isType: false,
                _parents: parentId,
                ...attributes_data2
            },
            ...rest_data2
        })

        await deleteThing(childId1)
    })

    test('PUT children - create new twin as child', async () => {
        try { await deleteThing(childId2) } catch (e) { } // It will probably fail, but we don't care. We're just doing this to make sure there is not this twin in Eclipse Ditto

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

        await deleteThing(childId2)
    })

    test('PUT children - ERROR try to add existing type as child', async () => {
        await createThing(badChild, typeData)

        try {
            const res = await axios.put(url + "/api/twins/" + parentId + "/children/" + badChild)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }

        const check = await getThingData(badChild)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({ thingId: badChild, ...typeData })

        await deleteThing(badChild)
    })

    test('PUT children - ERROR try to add existing type as child and modify its data (child data)', async () => {
        await createThing(badChild, typeData)

        try {
            const res = await axios.put(url + "/api/twins/" + parentId + "/children/" + badChild, data2)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }

        const check = await getThingData(badChild)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({ thingId: badChild, ...typeData })

        await deleteThing(badChild)
    })

    test('PUT children - ERROR try to add existing twin and modify its restricted attributes', async () => {
        await createThing(childId1, twinDataAll)

        for (let attr of restrictedAttributes) {
            try {
                const res = await axios.put(url + "/api/twins/" + parentId + "/children/" + childId1, {
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

        const check = await getThingData(childId1)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({ thingId: childId1, ...twinDataAll })

        await deleteThing(childId1)
    })

    test('PUT children - ERROR try to create new twin without body', async () => {
        try { await deleteThing(childId2) } catch (e) { }

        try {
            const res = await axios.put(url + "/api/twins/" + parentId + "/children/" + childId2)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 400)
        }

        try {
            const res = await getThingData(childId2)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }

        try { await deleteThing(childId2) } catch (e) { }
    })

    test('PUT children - ERROR try to create new twin with restricted attributes', async () => {
        try { await deleteThing(childId2) } catch (e) { }

        for (let attr of restrictedAttributes) {
            try {
                const res = await axios.put(url + "/api/twins/" + parentId + "/children/" + childId2, {
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
            const res = await getThingData(childId2)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }

        try { await deleteThing(childId2) } catch (e) { }
    })

})

describe('Compositional twins - Unlink children', () => {
    let parentId = "test:automatic_extended_parent"
    let childId1 = "test:automatic_extended_child1"
    let childId2 = "test:automatic_extended_child2"
    let badChildId = "test:automatic_extended_badChild"
    let notfound = "test:automatic_extended_notfound"

    beforeEach(async () => {
        await createThing(parentId, twinData)
        await createThing(childId1, { attributes: { ...isType, _parents: parentId, ...attributes_data }, ...rest_data })
        await createThing(childId2, { attributes: { _parents: parentId }, ...rest_data })
        await createThing(badChildId, { attributes: { _isType: true, _parents: parentId, ...attributes_data }, ...rest_data })
        await new Promise(r => setTimeout(r, 3000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins
    });

    afterAll(async () => {
        await deleteThing(childId1)
        await deleteThing(childId2) 
        await deleteThing(parentId)
        await deleteThing(badChildId)
    });

    test('PATCH unlink all children', async () => {
        const res = await axios.patch(url + "/api/twins/" + parentId + "/children/unlink")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        checkData(childId1, { attributes: { ...isType, ...attributes_data }, ...rest_data })
        checkData(childId2, { attributes: {}, ...rest_data })
        checkData(badChildId, {attributes: { _isType: true, _parents: parentId, ...attributes_data }, ...rest_data})
        checkData(parentId, twinData)
    })

    test('PATCH unlink parent', async () => {
        const res = await axios.patch(url + "/api/twins/" + childId1 + "/parent/unlink")

        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        checkData(childId1, { attributes: { ...isType, ...attributes_data }, ...rest_data })
        checkData(childId2, { attributes: { _parents: parentId }, ...rest_data })
        checkData(badChildId, {attributes: { _isType: true, _parents: parentId, ...attributes_data }, ...rest_data})
        checkData(parentId, twinData)
    })

    test('PATCH unlink children - No children', async () => {
        const res = await axios.patch(url + "/api/twins/" + childId1 + "/children/unlink")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        checkData(childId1, { attributes: { ...isType, _parents: parentId, ...attributes_data }, ...rest_data })
        checkData(childId2, { attributes: { _parents: parentId }, ...rest_data })
        checkData(badChildId, {attributes: { _isType: true, _parents: parentId, ...attributes_data }, ...rest_data})
        checkData(parentId, twinData)
    })

    test('PATCH unlink parent - No parent', async () => {
        const res = await axios.patch(url + "/api/twins/" + parentId + "/parent/unlink")

        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        checkData(childId1, { attributes: { ...isType, _parents: parentId, ...attributes_data }, ...rest_data })
        checkData(childId2, { attributes: { _parents: parentId }, ...rest_data })
        checkData(badChildId, {attributes: { _isType: true, _parents: parentId, ...attributes_data }, ...rest_data})
        checkData(parentId, twinData)
    })

    test('PATCH unlink children - ERROR is a type', async () => {
        try {
            const res = await axios.patch(url + "/api/twins/" + badChildId + "/children/unlink")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }

        checkData(childId1, { attributes: { ...isType, _parents: parentId, ...attributes_data }, ...rest_data })
        checkData(childId2, { attributes: { _parents: parentId }, ...rest_data })
        checkData(badChildId, {attributes: { _isType: true, _parents: parentId, ...attributes_data }, ...rest_data})
        checkData(parentId, twinData)
    })

    test('PATCH unlink parent - ERROR is a type', async () => {
        try {
            const res = await axios.patch(url + "/api/twins/" + badChildId + "/parent/unlink")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }

        checkData(childId1, { attributes: { _isType: false, _parents: parentId, ...attributes_data }, ...rest_data })
        checkData(childId2, { attributes: { _parents: parentId }, ...rest_data })
        checkData(badChildId, {attributes: { _isType: true, _parents: parentId, ...attributes_data }, ...rest_data})
        checkData(parentId, twinData)
    })

    test('PATCH unlink children - ERROR not found', async () => {
        try { await deleteThing(notfound) } catch (e) {}

        try {
            const res = await axios.patch(url + "/api/twins/" + notfound + "/children/unlink")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }
    })

    test('PATCH unlink parent - ERROR not found', async () => {
        try { await deleteThing(notfound) } catch (e) {}

        try {
            const res = await axios.patch(url + "/api/twins/" + notfound + "/parent/unlink")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }
    })
})

describe('Compositional twins - Fix', () => {
    let twin = "test:automatic_extended_fix_twin"
    let type = "test:automatic_extended_fix_type"
    let notfound = "test:automatic_extended_notfound"

    test('PUT fix - without problems', async () => {
        const childData = { attributes: { ...isType, _parents: twin + "1", ...attributes_data }, ...rest_data }

        await createThing(twin + "1", twinData)
        await createThing(twin + "2", childData)
        await createThing(twin + "3", childData)
        await createThing(twin + "4", twinData)
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        const res = await axios.put(url + "/api/twins/fix")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toStrictEqual("")

        checkData(twin + "1", twinData)
        checkData(twin + "2", childData)
        checkData(twin + "3", childData)
        checkData(twin + "4", twinData)

        await deleteThing(twin + "1")
        await deleteThing(twin + "2") 
        await deleteThing(twin + "3")
        await deleteThing(twin + "4")
    }, 20000)

    test('PUT fix - parent dont exist only 3', async () => {
        let childData: any = { attributes: { ...isType, _parents: "notfound", ...attributes_data }, ...rest_data }

        await createThing(twin + "1", childData)
        await createThing(twin + "2", childData)
        await createThing(twin + "3", childData)
        await createThing(twin + "4", twinData)
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        const res = await axios.put(url + "/api/twins/fix")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toStrictEqual("Thing with ID test:automatic_extended_fix_twin1 has modified its parents attribute from \"notfound\" to \"null\". Thing with ID test:automatic_extended_fix_twin2 has modified its parents attribute from \"notfound\" to \"null\". Thing with ID test:automatic_extended_fix_twin3 has modified its parents attribute from \"notfound\" to \"null\". ")

        childData.attributes._parents = null
        await checkData(twin + "1", childData)
        await checkData(twin + "2", childData)
        await checkData(twin + "3", childData)
        await checkData(twin + "4", twinData)

        await deleteThing(twin + "1")
        await deleteThing(twin + "2") 
        await deleteThing(twin + "3")
        await deleteThing(twin + "4")
    }, 20000)

    test('PUT fix - parent dont exist more than 200', async () => {
        let numChild = 250
        let childData: any = { attributes: { ...isType, _parents: "notfound", ...attributes_data }, ...rest_data }

        for(let i = 1; i <= numChild; i++) {
            await createThing(twin + i, childData)
        }
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        const res = await axios.put(url + "/api/twins/fix")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        childData.attributes._parents = null
        for(let i = 1; i <= numChild; i++) {
            await checkData(twin + i, childData)
        }

        for(let i = 1; i <= numChild; i++) {
            await deleteThing(twin + i)
        }
    }, 1000000)

    test('PUT fix - parent is type', async () => {
        let childData: any = { attributes: { ...isType, _parents: type + "3", ...attributes_data }, ...rest_data }

        await createThing(twin + "1", childData)
        await createThing(twin + "2", childData)
        await createThing(twin + "3", typeData)
        await createThing(twin + "4", twinData)
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        const res = await axios.put(url + "/api/twins/fix")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toStrictEqual("Thing with ID test:automatic_extended_fix_twin1 has modified its parents attribute from \"test:automatic_extended_fix_type3\" to \"null\". Thing with ID test:automatic_extended_fix_twin2 has modified its parents attribute from \"test:automatic_extended_fix_type3\" to \"null\". ")

        childData.attributes._parents = null
        checkData(twin + "1", childData)
        checkData(twin + "2", childData)
        checkData(twin + "3", typeData)
        checkData(twin + "4", twinData)

        await deleteThing(twin + "1")
        await deleteThing(twin + "2")
        await deleteThing(twin + "3")
        await deleteThing(twin + "4")
    }, 20000)


})