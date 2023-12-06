const axios = require('axios');

const url="http://localhost:3001"

describe('Basic twins', () => {
    test('GET root twins', async () => {
        const res = await axios.get(url + "/api/twins")

        expect(res).toBeTruthy()
        expect(res.status).toBe(200)
    })

    test('POST twin', async () => {
        const res = await axios.post(url + "/api/twins", {
            thingId: "test:test_post",
            policyId: "twin1:basic_policy",
            attributes: {
                name: "Automatic test from extended api"
            },
            features: {
                feature1: {
                    properties: {
                        value: null
                    }
                }
            }
        })

        expect(res).toBeTruthy()
        expect(res.status).toBe(201)
    })
})

//Composition suite