import express from "express";

const app = express()

app.get('/', function (req, res) {
  res.send('Hello World')
})

const port = 5173
app.listen(port)
console.log(`listening on port ${port}`)


