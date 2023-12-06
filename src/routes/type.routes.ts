import Router from 'express-promise-router'
import { typeController } from '../controllers/type.controller'

export const router = Router()
router.get("/", typeController.getRootTypes)
router.get("/all", typeController.getAllTypes)
router.post("/", typeController.postType)

// typeId
router.get("/:typeId", typeController.getTypeById)
router.put("/:typeId", typeController.putTypeById)
router.patch("/:typeId", typeController.patchTypeById)
router.delete("/:typeId", typeController.deleteTypeById)

// Children
router.get("/:typeId/children", typeController.getChildrenOfTypeById)

// Children + childId
router.put("/:typeId/children/:childId/:numChild", typeController.putChildrenOfType)

// Children + childId + unlink
router.patch("/:typeId/children/:childId/unlink", typeController.unlinkOneChildrenOfType)

// Children unlink
router.patch("/:typeId/children/unlink", typeController.unlinkAllChildrenOfType)

// Parent
router.get("/:typeId/parent", typeController.getParentsOfType)

// Parent unlink
router.patch("/:typeId/parent/unlink", typeController.unlinkAllParentsOfType)

//Create twin
router.post("/:typeId/create/:twinId", typeController.createTwinFromType)
