import { Policy } from '../auxiliary/database/models/policy.model'
import { Request, Response } from 'express'

export const policyController = {
    getAll: async (req: Request, res: Response) => {
        // #swagger.tags = ['Policies']
        try {
            const all = await Policy.aggregate([
                { 
                    $sort: { 
                        to: -1 
                    } 
                },
                {
                    $group: {
                        _id: "$pid",
                        manifiest: { $first: "$events.manifest" }
                    }
                },
                { 
                    $match: { 
                        manifiest: { 
                            $ne: "policies.events:policyDeleted"
                        }  
                    } 
                }
            ])

            const allPolicies = all.map(policy => {
                return policy._id.slice(7)
            })

            res.status(200).json(allPolicies)
        } catch (err) {
            res.status(400).json({
                message: err
            })
        }
    },
}