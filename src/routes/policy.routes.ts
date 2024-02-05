import { Router } from 'express';
import { policyController } from './../controllers/policy.controller';

export const router = Router()
router.get("/", policyController.getAll)