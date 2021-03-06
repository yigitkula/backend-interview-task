const {Parser} = require("json2csv")

exports.convertToCsv = (sourceJson, fields) => {
  const opts = {fields}
  const parser = new Parser(opts)
  return parser.parse(sourceJson)
}