import Router from 'express-promise-router'
import { twinController } from '../controllers/twin.controller'

export const router = Router()

router.get("/", twinController.getRootTwins)
router.post("/", twinController.postTwin)

// twinId
router.get("/:twinId", twinController.getTwinById)
router.put("/:twinId", twinController.putTwinById)
router.patch("/:twinId", twinController.patchTwinById)
router.delete("/:twinId", twinController.deleteOnlyTwinById)

// Children
router.get("/:twinId/children", twinController.getChildrenOfTwinById)
router.delete("/:twinId/children", twinController.deleteTwinWithChildrenById)

// Children + childId
router.put("/:twinId/children/:childId", twinController.putChildrenOfTwin)

// Children unlink
router.patch("/:twinId/children/unlink", twinController.unlinkAllChildrenOfTwin)

// Parent
router.get("/:twinId/parent", twinController.getParentOfTwin)

// Parent unlink
router.patch("/:twinId/parent/unlink", twinController.unlinkParentAndTwin)

//Duplicate
router.post("/:twinId/duplicate/:copyId", twinController.duplicateTwin)
//Duplicate keep hidden fields
//router.post("/:twinId/duplicate/:copyId/keepHiddenFields", twinController.duplicateTwinKeepHiddenFields)