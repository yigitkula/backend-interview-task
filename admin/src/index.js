const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")
const R = require("ramda")
const Service = require("./service")
const csvHelper = require("./csvhelper")

const app = express()

app.use(bodyParser.json({limit: "10mb"}))

app.get("/investments/:id", (req, res) => {
  const {id} = req.params
  request.get(`${config.investmentsServiceUrl}/investments/${id}`, (e, r, investments) => {
    if (e) {
      console.error(e)
      res.send(500)
    } else {
      res.send(investments)
    }
  })
})


app.get("/report", async (req, res) => {

  try {
    var [investmentsResponse, companiesResponse] = await Promise.all([Service.fetchInvestments(), Service.fetchCompanies()])
  } catch (err) {
    res.status(500).send({message: "Server error. Please try again later"})
  }

  if (investmentsResponse.status !== 200 || companiesResponse.status !== 200) {
    res.status(500).send({message: "Server error. Please try again later"})
  }

  const investments = investmentsResponse.data
  const companies = companiesResponse.data
  const reportData = []

  investments.forEach(investment => {
    investment.holdings.forEach(holding => {
      const company = R.pick(["name"], R.find(R.propEq("id", holding.id))(companies))
      const row = {
        ...R.pick(["userId", "firstName", "lastName", "date"], investment),
        holding: company.name,
        value: holding.investmentPercentage * investment.investmentTotal * 0.01,
      }
      reportData.push(row)
    })
  })

  const fieldMap = [
    {label: "User",        value: "userId"},
    {label: "First Name",  value: "firstName"},
    {label: "Last Name",   value: "lastName"},
    {label: "Date",        value: "date"},
    {label: "Holding",     value: "holding"},
    {label: "Value",       value: "value"},
  ]

  try {
    var csv = csvHelper.convertToCsv(reportData, fieldMap)
    console.log(csv);
  } catch (err) {
    res.status(500).send({message: "Server error. Please try again later"})
  }

  try {
    await Service.uploadReport(csv)
  } catch (err) {
    res.status(500).send({message: "Server error. Please try again later"})
  }

  res.send({
    message: "Report created successfully and posted to investment service",
  })
})



app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err)
    process.exit(1)
  }
  console.log(`Server running on port ${config.port}`)
})
