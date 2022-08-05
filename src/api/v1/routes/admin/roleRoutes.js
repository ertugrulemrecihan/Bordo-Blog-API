const express = require("express");
const router = express.Router();
const controller = require("../../controllers/RoleController");
const authenticate = require("../../middlewares/authenticate");
const authorize = require("../../middlewares/authorization");
const bodyValidator = require("../../middlewares/bodyValidator");
const schemas = require("../../validations/role");
const paramIdValidator = require("../../middlewares/paramsIdValidator");

router.get(
    "/getAll",
    authenticate,
    authorize("Admin"),
    controller.fetchAllByQuery
);
router.get(
    "/get/:id",
    authenticate,
    authorize("Admin"),
    paramIdValidator,
    controller.fetchOneByParamsId
);
router.post(
    "/create",
    authenticate,
    authorize("Admin"),
    bodyValidator(schemas.createValidations),
    controller.create
);
router.put(
    "/update/:id",
    authenticate,
    authorize("Admin"),
    paramIdValidator,
    bodyValidator(schemas.updateValidations),
    controller.updateByParamsId
);
router.delete(
    "/delete/:id",
    authenticate,
    authorize("Admin"),
    paramIdValidator,
    controller.deleteByParamsId
);

module.exports = router;
