import { Express } from 'express';
import { getAllpolicies_enabled } from './static';
import { router as twinRoutes } from './routes/twin.routes'
import { router as typesRoutes } from './routes/type.routes'
import { router as connectionsRoutes } from './routes/connection.routes'
import { router as policyRoutes } from './routes/policy.routes'

export const router = (app: Express) => {
    app.set('strict routing', true);
    app.use('/api/twins', twinRoutes);
    app.use('/api/types', typesRoutes);
    app.use('/api/connections', connectionsRoutes);
    if (getAllpolicies_enabled) {
        console.log("MongoDB URI detected. GET all policies will be enabled");
        app.use('/api/policies', policyRoutes);
    }
}