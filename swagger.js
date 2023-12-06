const swaggerAutogen = require("swagger-autogen")();

const doc = {
    info: {
        title: 'Extended API for Eclipse Ditto',
        description: 'Extended API for Eclipse Ditto',
        version: "1.0.0"
    },
    basePath: "/",
    host: 'localhost:' + (process.env.PORT || 3001),
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"]
}

const outputFile = './docs/swagger-output.json';
const endpointsFiles = ['./src/router.ts'];
swaggerAutogen(outputFile, endpointsFiles, doc);