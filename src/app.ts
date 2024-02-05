import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { router } from './router';
import { config } from './config';
import swaggerOutput from '../docs/swagger-output.json'

const app = express();

//swagger documentation
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Extended API for Eclipse Ditto',
            description: 'Extended API for Eclipse Ditto',
            servers: [`http://${process.env.HOST}:${process.env.PORT}`],
            version: "1.0.0"
        },
        basePath: "/api"
    },
    apis: ['./src/routes/*.ts']
}

//const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput))//swaggerUi.setup(swaggerDocs, { explorer: true }))

//settings
app.set("port", process.env.PORT || 3001)
app.set('json spaces', 2)

//config
config(app)

//routes
router(app)

//starting the server
app.listen(app.get("port"), function () {
    console.log("Extended API for Eclipse Ditto listening")
})

export default app;