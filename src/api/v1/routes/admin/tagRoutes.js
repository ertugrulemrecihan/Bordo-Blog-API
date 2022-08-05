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
    .get(authenticate, authorize("Admin"), controller.fetchAll);
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
