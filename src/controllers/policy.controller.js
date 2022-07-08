const Policy = require('../auxiliary/database/models/policy.model')

const policyController = {
    getAll: async (req, res) => {
        try {
            const all = await Policy.find({"s2.__lifecycle" : 'ACTIVE'})

            const allPolicies = all.map(policy => {
                return(
                    {
                        policyId : policy.s2.policyId,
                        entries : policy.s2.entries
                    }
                )
            })

            res.status(200).json(allPolicies)
        } catch (err) {
            res.status(400).json({
                message: err
            })
        }
    },
}

module.exports = policyController