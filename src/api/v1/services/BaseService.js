class BaseService {
    constructor(model, populate) {
        this.model = model;
        this.populate = populate;
    }

    fetchAll(query) {
        return this.model.find(query || {}).populate(this.populate);
    }

    fetchOneById(id) {
        return this.model.findById(id).populate(this.populate);
    }

    fetchOneByQuery(query) {
        return this.model.findOne(query).populate(this.populate);
    }

    create(item) {
        return this.model.create(item);
    }

    updateById(id, item) {
        return this.model.findByIdAndUpdate(id, item, { new: true });
    }

    updateByQuery(query, item) {
        return this.model.findOneAndUpdate(query, item, { new: true });
    }

    deleteById(id) {
        return this.model.findByIdAndDelete(id);
    }

    deleteByQuery(query) {
        return this.model.findOneAndDelete(query);
    }

    deleteAll(where) {
        return this.model.deleteMany(where || {});
    }
}

module.exports = BaseService;
