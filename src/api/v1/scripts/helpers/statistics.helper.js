const postStatistics = (posts) => {
    const postCount = posts.length;

    const likesCount = posts.reduce(
        (partialSum, post) => partialSum + post.likes.length,
        0
    );

    const viewsCount = posts.reduce(
        (partialSum, post) => partialSum + post.viewers.length,
        0
    );

    return {
        postCount,
        likesCount,
        viewsCount,
    };
};

module.exports = {
    postStatistics,
};
