const express = require('express')
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const config = require('./config.js')
const router = require('./router.js')
const app = express()

//swagger documentation
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Ditto extended API',
            description: 'Extended API for Eclipse Ditto',
            servers: ["http://" + process.env.HOST + ":" + process.env.PORT]
        },
        basePath: "/api"
    },
    apis: ['./src/routes/*.js']
}

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, { explorer: true }))

//settings
app.set("port", process.env.PORT || 3001)
app.set('json spaces', 2)

//config
config(app)

//routes
router(app)

//starting the server
app.listen(app.get("port"), function () {
    console.log("Ditto extended API listening")
})

module.exports = app