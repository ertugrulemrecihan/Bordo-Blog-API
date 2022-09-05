class BaseService {
    constructor(model, populate) {
        this.model = model;
        this.populate = populate;
    }

    fetchAll({ query, sortQuery, limit, skip, populate, select, queryOptions, session } = {}){
        query = {
            ...query,
            ...queryOptions?.filtering,
        };
        
        const dbQuery = this.model.find(query || {});

        sortQuery = sortQuery || queryOptions?.sorting;
        limit = limit || queryOptions?.pagination?.limit;
        skip = skip || queryOptions?.pagination?.skip;

        const finalQuery = this.#getFinalQuery(dbQuery, {
            sortQuery,
            limit,
            skip,
            populate,
            select,
            session,
        });

        return finalQuery.exec();
    }

    fetchOneById(id, { populate, select, session } = {}) {
        const dbQuery = this.model.findById(id);

        const finalQuery = this.#getFinalQuery(dbQuery, {
            populate,
            select,
            session,
        });

        return finalQuery.exec();
    }

    fetchOneByQuery(query, { populate, select, session } = {}) {
        const dbQuery = this.model.findOne(query);

        const finalQuery = this.#getFinalQuery(dbQuery, {
            populate,
            select,
            session,
        });

        return finalQuery.exec();
    }

    create(item, session) {
        const createdData = session ? [item] : item;

        return session
            ? this.model.create(createdData, { session })
            : this.model.create(createdData);
    }

    updateById(id, item, session) {
        const dbQuery = this.model.findByIdAndUpdate(id, item, { new: true });

        const finalQuery = this.#getFinalQuery(dbQuery, {
            session,
        });

        return finalQuery.exec();
    }

    updateByQuery(query, item, session) {
        const dbQuery = this.model.findOneAndUpdate(query, item, { new: true });

        const finalQuery = this.#getFinalQuery(dbQuery, {
            session,
        });

        return finalQuery.exec();
    }

    deleteById(id, session) {
        const dbQuery = this.model.findByIdAndDelete(id);

        const finalQuery = this.#getFinalQuery(dbQuery, {
            session,
        });

        return finalQuery.exec();
    }

    deleteByQuery(query, session) {
        const dbQuery = this.model.findOneAndDelete(query);

        const finalQuery = this.#getFinalQuery(dbQuery, {
            session,
        });

        return finalQuery.exec();
    }

    deleteAll(where, session) {
        const dbQuery = this.model.deleteMany(where || {});

        const finalQuery = this.#getFinalQuery(dbQuery, {
            session,
        });

        return finalQuery.exec();
    }

    count(query){
        return this.model.count(query || {});
    }

    #getFinalQuery(
        query,
        { sortQuery, limit, skip, populate, select, session }
    ) {
        if (sortQuery) {
            query.sort(sortQuery);
        }

        if (limit) {
            query.limit(limit);
        }

        if (skip) {
            query.skip(skip);
        }

        if (populate || this.populate) {
            query.populate(populate || this.populate);
        }

        if (select) {
            query.select(select);
        }

        if (session) {
            query.session(session);
        }

        return query;
    }
}

module.exports = BaseService;
