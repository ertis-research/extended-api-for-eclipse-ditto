function getController (Model, idProperty) {
    return {
        getAll: async (req, res) => {
            try {
                const all = await Model.find()
                res
                    .status(200)
                    .json(all)
            } catch (err) {
                res
                    .status(400)
                    .json({
                        message: err
                    })
            }
        },
        saveObject: async (req, res) => {
            const body = req.body
            try {
                const savedObject = await Model.create(body)
                res
                    .status(200)
                    .json(savedObject)
            } catch (err) {
                res
                    .status(500)
                    .json({
                        message: err
                    })
            }
        },
        getObject: async (req, res) => {
            const _id = req.params.id
            try {
              const obj = {}
              obj[idProperty] = _id
              const object = await Model.findOne(obj)
              res
                .status(200)
                .json(object)
            } catch (err) {
              res
                .status(400)
                .json({
                  message: err
                })
            }
        },
        deleteObject: async (req, res) => {
            const _id = req.params.id
            try {
              const obj = {}
              obj[idProperty] = _id
              const removedObject = await Model.findOneAndDelete(obj);
        
              if (!removedObject) {
                return res.status(404).json({
                  message: err
                })
              }
        
              res.json(removedObject)
            } catch (err) {
              res
                .status(400)
                .json({
                  message: err
                })
            }
        },
        updateObject: async (req, res) => {
            const _id = req.params.id
            const body = req.body
            try {
              const obj = {}
              obj[idProperty] = _id
              const updatedObject = await Model.findOneAndUpdate(
                obj,
                body,
                {new: true});
        
              if (!updatedObject) {
                return res.status(404).json({
                  message: err
                })
              }
              res.status(200).json(updatedObject)

            } catch (err) {
              res
                .status(500)
                .json({
                  message: err
                })
            }
        }
    }
}

module.exports = getController