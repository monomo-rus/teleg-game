const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
    'teleg_game',
    'postgres',
    'zAq1XcvB',
    {
        host: 'localhost',
        port: '5432',
        dialect: 'postgres'
    }
)