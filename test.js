const models = require("./models");
const { Op } = require("sequelize");

{
    users: [{ userId: 5 }, { userId: 15 }];
}

const testMatches = async (userId) => {
    const results = await models.MatchStat.findAll({
        where: {
            [Op.or]: [
                { "users.0.userId": userId },
                { "users.1.userId": userId },
            ],
        },
    });

    // console.log(results[0]);
    console.log(results[0].users);
    const wins = results.filter((result) => result.winner === userId);
    console.log(wins.length);
};

testMatches(5);
