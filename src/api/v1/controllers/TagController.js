const TagService = require("../services/TagService");
const BaseController = require('./BaseController');

class TagController extends BaseController {
    constructor() {
        super(TagService);
    }
}

module.exports = new TagController();