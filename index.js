const mysql = require('mysql')
const queryBuilder = require('./lib/QueryBuilder')
const dbBuilder = require('./lib/DatabaseBuilder')
const qModel = require('./lib/ModelBinding')
const parameters = require('./lib/Parameters')

let connection = null

/**
 * [Get the MySQL module package for more advanced functions]
 * @return {MySQL} [Mysql module package]
 */
exports.getMysql = () => {
  return mysql
}

/**
 * [Set the options of mysql engine: hostname; username; password; database]
 * @param {Object} dbSetting [Configuration of connection of mysql engine]
 */
exports.setOptions = (dbSetting) => {
  connection = mysql.createConnection({
    host: dbSetting.hostname,
    user: dbSetting.username,
    password: dbSetting.password,
    database: dbSetting.database
  })
}

/**
 * [Connect to MySQL server]
 */
exports.connectToDatabase = () => {
  connection.connect()
}

/**
 * [Close the MySQL connection]
 */
exports.closeTheConnection = () => {
  connection.end()
}

/**
 * [Start to change the Database strcture]
 * @return {DatabaseBuilder} [Database Builder Creator for modify the structure of Table on database]
 */
exports.setDatabaseStructure = () => {
  return dbBuilder
}

/**
 * [Make table scheme and use some common methods]
 * @param  {Array} schema [List of columns on table which You want to used for current case]
 * @param {String} table   [Database table for that schema]
 * @return {ModelBinding}  [description]
 */
exports.useScheme = (schema, table) => {
  return qModel.setSchema(schema, table)
}

/**
 * [Start to create SQL Query]
 * @return {QueryBuilder} [Query Builder Creator of sql queries and connect to database]
 */
exports.makeQuery = () => {
  parameters.params = []
  return queryBuilder
}

/**
 * [Get all sql query parameters]
 * @return {Array} [SQL Query parameters]
 */
exports.getParameters = () => {
  return parameters.params
}

/**
 * [Set parameters for created sql query]
 * @param {Array} values  [SQL query parameres only values]
 * @return {QueryBuilder} [Query Builder Creator of sql queries and connect to database]
 */
exports.setParameters = function (values) {
  let len = values.length

  if (!Array.isArray(values)) {
    throw new Error('The values variable is required to be array!')
  }

  if (len > 0) {
    for (let i = 0; i < len; i++) {
      parameters.params.push(values[i])
    }
  }

  return this
}

/**
 * [Set Your own sql query]
 * @param  {String} command [SQL Query]
 * @return {QueryBuilder}   [Query Builder Creator of sql queries and connect to database]
 */
exports.setCommand = function (command) {
  parameters.command = command
  return this
}

/**
 * [Get the created sql query]
 * @return {String} [SQL Query]
 */
exports.getCommand = () => {
  return parameters.command
}

/**
 * [Prepare the sql query and set what kind of query is will used]
 * @return {QueryBuilder} [Query Builder Creator of sql queries and connect to database]
 */
exports.prepare = function () {
  if (parameters.option === 'select') {
    parameters.command = parameters.select + parameters.from +
      parameters.join + parameters.groupBy + parameters.where +
      parameters.orderBy + parameters.limit + parameters.skip
  } else if (parameters.option === 'insert') {
    parameters.command = parameters.insert
  } else if (parameters.option === 'update') {
    parameters.command = parameters.update + parameters.where + parameters.limit + parameters.skip
  } else if (parameters.option === 'delete') {
    parameters.command = parameters.delete + parameters.where + parameters.limit + parameters.skip
  } else {
    parameters.command = parameters.where + parameters.limit + parameters.skip
  }

  parameters.select = ''
  parameters.from = ''
  parameters.join = ''
  parameters.where = ''
  parameters.groupBy = ''
  parameters.orderBy = ''
  parameters.limit = ''
  parameters.skip = ''
  parameters.insert = ''
  parameters.update = ''
  parameters.delete = ''

  return this
}

/**
 * [Run the sql query on mysql]
 */
exports.execute = function () {
  if (parameters.command.indexOf('?') !== -1) {
    connection.query(parameters.command, parameters.params, (err, result) => {
      if (err) console.log(err)
    })
  } else {
    connection.query(parameters.command, (err, result) => {
      if (err) console.log(err)
    })
  }
}

/**
 * [Get the result from created sql query]
 * @param {fn} callback [Callback where first parameter is Error and second is list of records]
 */
exports.getResult = (callback) => {
  if (parameters.command.indexOf('?') !== -1) {
    connection.query(parameters.command, parameters.params, (err, rows, fields) => {
      if (err) callback(err, null)
      callback(null, JSON.parse(JSON.stringify(rows)))
    })
  } else {
    connection.query(parameters.command, (err, rows, fields) => {
      if (err) callback(err, null)
      callback(null, JSON.parse(JSON.stringify(rows)))
    })
  }
}
