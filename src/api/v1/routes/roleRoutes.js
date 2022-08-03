const express = require("express");
const router = express.Router();
const controller = require("../controllers/RoleController");
const authenticate = require("../middlewares/authenticate");
const authorize = require('../middlewares/authorization');
const bodyValidator = require("../middlewares/bodyValidator");
const schemas = require('../validations/role')
const paramIdValidator = require('../middlewares/paramsIdValidator');

router.get("", authenticate, authorize('Admin'), controller.fetchAllByQuery);
router.get("/:id", authenticate, authorize('Admin'), paramIdValidator, controller.fetchOneByParamsId);
router.post("/create-role", authenticate, authorize('Admin'), bodyValidator(schemas.createValidations), controller.create);
router.put("/update-role/:id", authenticate, authorize('Admin'), paramIdValidator, controller.updateByParamsId);
router.delete("/delete-role/:id", authenticate, authorize('Admin'), paramIdValidator, controller.deleteByParamsId);

module.exports = router;
