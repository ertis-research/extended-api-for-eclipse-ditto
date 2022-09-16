// IMPORTS
// ------------------------------------------------------------------------
const { 
    queryPolicies
} = require('./queries')

const {
    statusIsCorrect
} = require('./responses')

const {executeGET } = require('./requests_for_ditto')


// REQUESTS
// ------------------------------------------------------------------------
const getDistinctPolicies = (list) => {
    var newList = []
    list.forEach(element => {
        const value = element['policyId']
        if (!newList.includes(value)) newList.push(value)
    })
    return newList
}

const getAllPolicies = async () => {
    var res = await executeGET(queryPolicies())
    var policies = []
    while(statusIsCorrect(res.status) && res.message.items.length > 0){
        policies = policies.concat(getDistinctPolicies(res.message.items))
        res = await executeGET(queryPolicies(policies))
    }
    return (policies.length == 0) ? res : {
        status: res.status,
        message: policies
    }
}


// EXPORT
// ------------------------------------------------------------------------
module.exports = {
    getAllPolicies : getAllPolicies
}