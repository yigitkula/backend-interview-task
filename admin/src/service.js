const config = require("config")
const axios = require("axios")

exports.fetchInvestments = () => {
  return axios.get(`${config.investmentsServiceUrl}/investments`)
}

exports.fetchCompanies = () => {
  return axios.get(`${config.financialCompaniesServiceUrl}/companies`)
}

exports.uploadReport = (csvReport) => {
  const postData = {
    csv: csvReport,
  }
  return axios.post(`${config.investmentsServiceUrl}/investments/export`, postData)
}
