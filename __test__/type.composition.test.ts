import { restrictedAttributes } from '../src/auxiliary/attributes/consts'
import axios from 'axios'
import { url, getThingData, data, rest_data, attributes_data, data2, rest_data2, attributes_data2, deleteThing, createThing, checkError, checkData } from './helper';


const isType = { _isType: true }
const typeData = { attributes: { ...isType, ...attributes_data }, ...rest_data }
const twinData = { attributes: { _isType: false, ...attributes_data }, ...rest_data }

// This data will only be used to create the twin directly in ditto, so we don't care if the IDs don't exist.
const othersSpecificAttributes = { _parents: {"test:type_parent" : 1}, copyOf: "test:type_copy" }
const typeDataAll = { attributes: { ...isType, ...othersSpecificAttributes, ...attributes_data }, ...rest_data }

describe('Compositional types - Query', () => {
    let parentId = "test:type_automatic_extended_parent"
    let childId1 = "test:type_automatic_extended_child1"
    let childId2 = "test:type_automatic_extended_child2"
    let badChildId = "test:type_automatic_extended_badChild"
    let anotherChild = "test:type_automatic_extended_anotherChild"

    beforeAll(async () => {
        await createThing(parentId, typeData)
        await createThing(childId1, { attributes: { ...isType, _parents: { [parentId] : 1}, ...attributes_data }, ...rest_data })
        await createThing(childId2, { attributes: { ...isType, _parents: { [parentId] : 1}}, ...rest_data })
        await createThing(badChildId, { attributes: { _isType: false, _parents: parentId, ...attributes_data }, ...rest_data })
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
        const res = await axios.get(url + "/api/types/" + parentId + "/children")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toEqual(expect.arrayContaining([
            {
                thingId: childId1,
                attributes: {
                    ...attributes_data,
                    _parents: { [parentId] : 1}
                },
                ...rest_data
            },
            {
                thingId: childId2,
                attributes: {
                    _parents: { [parentId] : 1}
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
        const res = await axios.get(url + "/api/types/" + childId1 + "/children")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toStrictEqual([])
    })

    
    test('GET all children - more than 200 children', async () => {
        const numChildren = 201 
        let expectedArray:any[] = []
        for (let i = 1; i <= numChildren; i++) {
            await createThing("test:type_automatic_extended_child200_" + i, { attributes: { ...isType, _parents: { [parentId] : 1} }, ...rest_data })
            expectedArray = [
                ...expectedArray,
                {
                    thingId: "test:type_automatic_extended_child200_" + i,
                    attributes: {
                        _parents: { [parentId] : 1}
                    },
                    ...rest_data
                }
            ]
        }
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        const res = await axios.get(url + "/api/types/" + parentId + "/children")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toEqual(expect.arrayContaining(expectedArray))

        for (let i = 1; i <= numChildren; i++) {
            await deleteThing("test:type_automatic_extended_child200_" + i)
        }
    }, 1000000)

    test('GET all children - using options', async () => {
        const numChildren = 10
        let expectedArray:any[] = []
        for (let i = 1; i <= numChildren; i++) {
            await createThing("test:type_automatic_extended_child" + i, { attributes: { ...isType, _parents: { [parentId] : 1} }, ...rest_data })
            expectedArray = [
                ...expectedArray,
                {
                    thingId: "test:type_automatic_extended_child" + i,
                    attributes: {
                        _parents: { [parentId] : 1}
                    },
                    ...rest_data
                }
            ]
        }
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        const res = await axios.get(url + "/api/types/" + parentId + "/children?option=size(5)")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        const data1 = res.data as any
        expect(data1.items).toBeTruthy()
        expect(data1.cursor).toBeTruthy()
        expect(data1.items.length).toBe(5)

        const res2 = await axios.get(url + "/api/types/" + parentId + "/children?option=size(5),cursor(" + data1.cursor + ")")
        expect(res2.status).toBe(200)
        const data2 = res2.data as any
        expect(data2.items).toBeTruthy()
        expect(data2.items.length).toBe(5)

        expect([...data1.items, ...data2.items]).toEqual(expect.arrayContaining(expectedArray))

        for (let i = 3; i <= numChildren; i++) {
            await deleteThing("test:type_automatic_extended_child" + i)
        }
    }, 1000000)

    test('GET parent', async () => {
        const res = await axios.get(url + "/api/types/" + childId1 + "/parent")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toEqual({ [parentId] : 1 } )
    })

    test('GET parent - ERROR not found parent', async () => {
        try {
            const res = await axios.get(url + "/api/types/" + parentId + "/parent")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }
    })

    test('GET parent - ERROR child is a twin', async () => {
        try {
            const res = await axios.get(url + "/api/types/" + badChildId + "/parent")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }
    })
/*
    test('GET parent - ERROR parent is a type', async () => {
        await createThing(anotherChild, { attributes: { _isType: false, _parents: badChildId }, ...rest_data })
        try {
            const res = await axios.get(url + "/api/types/" + anotherChild + "/parent")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }
    })
*/
})

describe('Compositional types - Delete type with children', () => {
    let parentId = "test:type_automatic_extended_parent"
    let childId1 = "test:type_automatic_extended_child1"
    let childId2 = "test:type_automatic_extended_child2"
    let badChildId = "test:type_automatic_extended_badChild"
    let notFound = "test:type_automatic_extended_notfound"

    beforeEach(async () => {
        await createThing(parentId, typeData)
        await createThing(childId1, { attributes: { ...isType, _parents: { [parentId] : 1}, ...attributes_data }, ...rest_data })
        await createThing(childId2, { attributes: { ...isType, _parents: { [parentId] : 2, "other" : 3}}, ...rest_data })
        await createThing(badChildId, { attributes: { _isType: false, _parents: parentId, ...attributes_data }, ...rest_data })
        await new Promise(r => setTimeout(r, 3000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins
    });

    afterAll(async () => {
        try { await deleteThing(childId1) } catch (e) { }
        try { await deleteThing(childId2) } catch (e) { }
        try { await deleteThing(parentId) } catch (e) { }
        await deleteThing(badChildId)
    });

    test('DELETE type and all children - ERROR not possible', async () => {
        try {
            const res = await axios.delete(url + "/api/types/" + parentId + "/children")
            expect(res).toBeFalsy()
        } catch(e) {
            checkError(e, 404)
        }
    })

    test('DELETE only type and unlink children a', async () => {
        let preData_1: any = await getThingData(childId1)
        let preData_2: any = await getThingData(childId2)
        const preData_bad: any = await getThingData(badChildId)

        const res = await axios.delete(url + "/api/types/" + parentId)
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

        delete preData_2.data.attributes._parents[parentId]
        check = await getThingData(childId2)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData_2.data)

        check = await getThingData(badChildId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual(preData_bad.data)
    })

    test('DELETE only type and unlink children - ERROR is a twin', async () => {
        await createThing(parentId, twinData) // TIENES QUE HACER ESTA 
        const preData1: any = await getThingData(childId1)
        const preData2: any = await getThingData(childId2)
        const preData3: any = await getThingData(badChildId)

        try {
            const res = await axios.delete(url + "/api/types/" + parentId)
            expect(res).toBeFalsy()
        } catch(e) {
            checkError(e, 412)
        }

        let check = await getThingData(parentId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({ thingId: parentId, ...twinData })

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

    test('DELETE only type and unlink children - ERROR not found', async () => {
        await createThing(parentId, twinData) // TIENES QUE HACER ESTA 
        const preData1: any = await getThingData(childId1)
        const preData2: any = await getThingData(childId2)
        const preData3: any = await getThingData(badChildId)

        try {
            const res = await axios.delete(url + "/api/types/" + parentId)
            expect(res).toBeFalsy()
        } catch(e) {
            checkError(e, 412)
        }

        let check = await getThingData(parentId)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({ thingId: parentId, ...twinData })

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

describe('Compositional types - Link child', () => {
    let parentId = "test:type_automatic_extended_parent"
    let childId1 = "test:type_automatic_extended_child1"
    let childId2 = "test:type_automatic_extended_child2"
    let badChild = "test:type_automatic_extended_bad_child"

    beforeAll(async () => {
        await createThing(parentId, typeData)
        //await new Promise(r => setTimeout(r, 3000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins
    });

    afterAll(async () => {
        await deleteThing(parentId)
    });

    test('PUT children - modifies the number of children of a parent', async () => {
        let newData:any = { ...typeData }
        newData.attributes = { _parents: { [parentId] : 1 }, ...newData.attributes }
        await createThing(childId1, newData)

        const res = await axios.put(url + "/api/types/" + parentId + "/children/" + childId1 + "/3")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        const check = await getThingData(childId1)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: childId1,
            attributes: {
                ...isType,
                _parents: { [parentId] : 3 },
                ...attributes_data
            },
            ...rest_data
        })

        await deleteThing(childId1)
    })

    test('PUT children - add existing type as child - no parents', async () => {
        await createThing(childId1, typeData)

        const res = await axios.put(url + "/api/types/" + parentId + "/children/" + childId1 + "/3")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        const check = await getThingData(childId1)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: childId1,
            attributes: {
                ...isType,
                _parents: { [parentId] : 3 },
                ...attributes_data
            },
            ...rest_data
        })

        await deleteThing(childId1)
    })

    test('PUT children - add existing type as child - having more parents', async () => {
        let newData:any = { ...typeData }
        newData.attributes = { _parents: { "other" : 2 }, ...newData.attributes }
        await createThing(childId1, newData)

        const res = await axios.put(url + "/api/types/" + parentId + "/children/" + childId1 + "/3")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        const check = await getThingData(childId1)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: childId1,
            attributes: {
                ...isType,
                _parents: { "other" : 2, [parentId] : 3 },
                ...attributes_data
            },
            ...rest_data
        })

        await deleteThing(childId1)
    })

    test('PUT children - add existing type as child and modify its data (child data) - no parents', async () => {
        await createThing(childId1, typeData)

        const res = await axios.put(url + "/api/types/" + parentId + "/children/" + childId1 + "/2", data2)

        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        const check = await getThingData(childId1)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: childId1,
            attributes: {
                ...isType,
                _parents: { [parentId] : 2 },
                ...attributes_data2
            },
            ...rest_data2
        })

        await deleteThing(childId1)
    })

    test('PUT children - add existing type as child and modify its data (child data) - having more parents', async () => {
        let newData:any = { ...typeData }
        newData.attributes = { _parents: { "other" : 2 }, ...newData.attributes }
        await createThing(childId1, newData)

        const res = await axios.put(url + "/api/types/" + parentId + "/children/" + childId1 + "/2", data2)

        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        const check = await getThingData(childId1)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: childId1,
            attributes: {
                ...isType,
                _parents: { "other" : 2, [parentId] : 2 },
                ...attributes_data2
            },
            ...rest_data2
        })

        await deleteThing(childId1)
    })

    test('PUT children - create new type as child - no parents', async () => {
        try { await deleteThing(childId2) } catch (e) { } // It will probably fail, but we don't care. We're just doing this to make sure there is not this twin in Eclipse Ditto

        const res = await axios.put(url + "/api/types/" + parentId + "/children/" + childId2 + "/2", data)

        expect(res).toBeTruthy()
        expect(res.status).toBe(201)

        const check = await getThingData(childId2)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({
            thingId: childId2,
            attributes: {
                ...isType,
                _parents: { [parentId] : 2 },
                ...attributes_data
            },
            ...rest_data
        })

        await deleteThing(childId2)
    })

    test('PUT children - ERROR try to add existing twin as child', async () => {
        await createThing(badChild, twinData)

        try {
            const res = await axios.put(url + "/api/types/" + parentId + "/children/" + badChild + "/1")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }

        const check = await getThingData(badChild)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({ thingId: badChild, ...twinData })

        await deleteThing(badChild)
    })

    test('PUT children - ERROR try to add existing twin as child and modify its data (child data)', async () => {
        await createThing(badChild, twinData)

        try {
            const res = await axios.put(url + "/api/types/" + parentId + "/children/" + badChild + "/1", data2)
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }

        const check = await getThingData(badChild)
        expect(check).toBeTruthy()
        expect(check.data).toStrictEqual({ thingId: badChild, ...twinData })

        await deleteThing(badChild)
    })

    test('PUT children - ERROR try to add existing type and modify its restricted attributes', async () => {
        await createThing(childId1, typeDataAll)

        for (let attr of restrictedAttributes) {
            try {
                const res = await axios.put(url + "/api/types/" + parentId + "/children/" + childId1 + "/1", {
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
        expect(check.data).toStrictEqual({ thingId: childId1, ...typeDataAll })

        await deleteThing(childId1)
    })

    test('PUT children - ERROR try to create new type without body', async () => {
        try { await deleteThing(childId2) } catch (e) { }

        try {
            const res = await axios.put(url + "/api/types/" + parentId + "/children/" + childId2 + "/2")
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

    test('PUT children - ERROR try to create new type with restricted attributes', async () => {
        try { await deleteThing(childId2) } catch (e) { }

        for (let attr of restrictedAttributes) {
            try {
                const res = await axios.put(url + "/api/types/" + parentId + "/children/" + childId2 + "/2", {
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

describe('Compositional types - Unlink children', () => {
    let parentId = "test:type_automatic_extended_parent"
    let childId1 = "test:type_automatic_extended_child1"
    let childId2 = "test:type_automatic_extended_child2"
    let badChildId = "test:type_automatic_extended_badChild"
    let notfound = "test:type_automatic_extended_notfound"

    let othersParents = {"other": 1, "other2": 3}

    const everyThingSame = () => {
        checkData(childId1, { attributes: { ...isType, _parents: { [parentId] : 1 }, ...attributes_data }, ...rest_data })
        checkData(childId2, { attributes: { ...isType, _parents: { ...othersParents, [parentId] : 3 } }, ...rest_data })
        checkData(badChildId, {attributes: { _isType: false, _parents: parentId, ...attributes_data }, ...rest_data})
        checkData(parentId, typeData)
    }

    beforeEach(async () => {
        await createThing(parentId, typeData)
        await createThing(childId1, { attributes: { ...isType, _parents: { [parentId] : 1 }, ...attributes_data }, ...rest_data })
        await createThing(childId2, { attributes: { ...isType, _parents: { ...othersParents, [parentId] : 3 } }, ...rest_data })
        await createThing(badChildId, { attributes: { _isType: false, _parents: parentId, ...attributes_data }, ...rest_data })
        await new Promise(r => setTimeout(r, 3000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins
    });

    afterAll(async () => {
        await deleteThing(childId1)
        await deleteThing(childId2) 
        await deleteThing(parentId)
        await deleteThing(badChildId)
    });

    test('PATCH unlink all children', async () => {
        const res = await axios.patch(url + "/api/types/" + parentId + "/children/unlink")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        checkData(childId1, { attributes: { ...isType, ...attributes_data }, ...rest_data })
        checkData(childId2, { attributes: { ...isType, _parents: { ...othersParents} }, ...rest_data })
        checkData(badChildId, {attributes: { _isType: false, _parents: parentId, ...attributes_data }, ...rest_data})
        checkData(parentId, typeData)
    })

    test('PATCH unlink parent - no more parents', async () => {
        const res = await axios.patch(url + "/api/types/" + childId1 + "/parent/unlink")

        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        checkData(childId1, { attributes: { ...isType, ...attributes_data }, ...rest_data })
        checkData(childId2, { attributes: { ...isType, _parents: { ...othersParents, [parentId] : 3 } }, ...rest_data })
        checkData(badChildId, {attributes: { _isType: false, _parents: parentId, ...attributes_data }, ...rest_data})
        checkData(parentId, typeData)
    })

    test('PATCH unlink parent - more', async () => {
        const res = await axios.patch(url + "/api/types/" + childId2 + "/parent/unlink")

        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        checkData(childId1, { attributes: { ...isType, _parents: { [parentId] : 1 }, ...attributes_data }, ...rest_data })
        checkData(childId2, { attributes: { ...isType }, ...rest_data })
        checkData(badChildId, {attributes: { _isType: false, _parents: parentId, ...attributes_data }, ...rest_data})
        checkData(parentId, typeData)
    })

    test('PATCH unlink children - No children', async () => {
        const res = await axios.patch(url + "/api/types/" + childId1 + "/children/unlink")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        everyThingSame()
    })

    test('PATCH unlink parent - No parent', async () => {
        const res = await axios.patch(url + "/api/types/" + parentId + "/parent/unlink")

        expect(res).toBeTruthy()
        expect(res.status).toBe(204)

        everyThingSame()
    })

    test('PATCH unlink children - ERROR is a type', async () => {
        try {
            const res = await axios.patch(url + "/api/types/" + badChildId + "/children/unlink")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }

        everyThingSame()
    })

    test('PATCH unlink parent - ERROR is a type', async () => {
        try {
            const res = await axios.patch(url + "/api/types/" + badChildId + "/parent/unlink")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 412)
        }

        everyThingSame()
    })

    test('PATCH unlink children - ERROR not found', async () => {
        try { await deleteThing(notfound) } catch (e) {}

        try {
            const res = await axios.patch(url + "/api/types/" + notfound + "/children/unlink")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }

        everyThingSame()
    })

    test('PATCH unlink parent - ERROR not found', async () => {
        try { await deleteThing(notfound) } catch (e) {}

        try {
            const res = await axios.patch(url + "/api/types/" + notfound + "/parent/unlink")
            expect(res).toBeFalsy()
        } catch (e: any) {
            checkError(e, 404)
        }

        everyThingSame()
    })
})

describe('Compositional types - Fix', () => {
    let twin = "test:type_automatic_extended_fix_twin"
    let type = "test:type_automatic_extended_fix_type"
    let notfound = "test:type_automatic_extended_notfound"

    test('PUT fix - without problems', async () => {
        const childData = { attributes: { ...isType, _parents: { [type + "1"] : 2}, ...attributes_data }, ...rest_data }

        await createThing(type + "1", typeData)
        await createThing(type + "2", childData)
        await createThing(type + "3", childData)
        await createThing(type + "4", typeData)
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        const res = await axios.put(url + "/api/types/fix")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toStrictEqual("")

        checkData(type + "1", typeData)
        checkData(type + "2", childData)
        checkData(type + "3", childData)
        checkData(type + "4", typeData)

        await deleteThing(type + "1")
        await deleteThing(type + "2") 
        await deleteThing(type + "3")
        await deleteThing(type + "4")
    }, 20000)

    test('PUT fix - parent dont exist only 3', async () => {
        let childData: any = { attributes: { ...isType, _parents: { "notfound" : 1 }, ...attributes_data }, ...rest_data }
        let childData2: any = { attributes: { ...isType, _parents: { [type + "4"] : 2, "notfound" : 1 }, ...attributes_data }, ...rest_data }

        await createThing(type + "1", childData)
        await createThing(type + "2", childData2)
        await createThing(type + "3", childData2)
        await createThing(type + "4", typeData)
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        const res = await axios.put(url + "/api/types/fix")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toStrictEqual("Thing with ID test:type_automatic_extended_fix_type1 has modified its parents attribute from {\"notfound\":1} to {}. Thing with ID test:type_automatic_extended_fix_type2 has modified its parents attribute from {\"test:type_automatic_extended_fix_type4\":2,\"notfound\":1} to {\"test:type_automatic_extended_fix_type4\":2}. Thing with ID test:type_automatic_extended_fix_type3 has modified its parents attribute from {\"test:type_automatic_extended_fix_type4\":2,\"notfound\":1} to {\"test:type_automatic_extended_fix_type4\":2}. ")

        childData.attributes._parents = {}
        childData2.attributes._parents = { [type + "4"] : 2 }
        await checkData(type + "1", childData)
        await checkData(type + "2", childData2)
        await checkData(type + "3", childData2)
        await checkData(type + "4", typeData)

        await deleteThing(type + "1")
        await deleteThing(type + "2") 
        await deleteThing(type + "3")
        await deleteThing(type + "4")
    }, 20000)

    test('PUT fix - parent dont exist more than 200', async () => {
        let numChild = 250
        let childData: any = { attributes: { ...isType, _parents: { "notfound" : 1 }, ...attributes_data }, ...rest_data }

        for(let i = 1; i <= numChild; i++) {
            await createThing(type + i, childData)
        }
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        const res = await axios.put(url + "/api/types/fix")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)

        childData.attributes._parents = {}
        for(let i = 1; i <= numChild; i++) {
            await checkData(type + i, childData)
        }

        for(let i = 1; i <= numChild; i++) {
            await deleteThing(type + i)
        }
    }, 1000000)

    test('PUT fix - parent is twin', async () => {
        let childData: any = { attributes: { ...isType, _parents: twin + "4", ...attributes_data }, ...rest_data }

        await createThing(type + "1", childData)
        await createThing(type + "2", childData)
        await createThing(type + "3", typeData)
        await createThing(type + "4", twinData)
        await new Promise(r => setTimeout(r, 2000)) // This is very ugly, but Eclipse Ditto needs a few seconds to process the new twins

        const res = await axios.put(url + "/api/types/fix")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
        expect(res.data).toStrictEqual("Thing with ID test:type_automatic_extended_fix_type1 has modified its parents attribute from \"test:type_automatic_extended_fix_twin4\" to {}. Thing with ID test:type_automatic_extended_fix_type2 has modified its parents attribute from \"test:type_automatic_extended_fix_twin4\" to {}. ")

        childData.attributes._parents = {}
        checkData(type + "1", childData)
        checkData(type + "2", childData)
        checkData(type + "3", typeData)
        checkData(type + "4", twinData)

        await deleteThing(type + "1")
        await deleteThing(type + "2")
        await deleteThing(type + "3")
        await deleteThing(type + "4")
    }, 20000)


})