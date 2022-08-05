const express = require("express");
const router = express.Router();
const controller = require("../../controllers/TagController");
const authenticate = require("../../middlewares/authenticate");
const authorize = require("../../middlewares/authorization");
const bodyValidator = require("../../middlewares/bodyValidator");
const paramIdValidator = require("../../middlewares/paramsIdValidator");
const schemas = require("../../validations/tag");

router
    .route("/getAll")
    .get(authenticate, controller.fetchAll);
router.get(
    "/get/:id",
    authenticate,
    paramIdValidator,
    controller.fetchOneByParamsId
);
router.put(
    "/create",
    authenticate,
    authorize("Admin"),
    bodyValidator(schemas.createValidation),
    controller.create
);
router.patch(
    "/update/:id",
    authenticate,
    authorize("Admin"),
    paramIdValidator,
    bodyValidator(schemas.updateValidation),
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
