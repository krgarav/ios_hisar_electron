const express = require("express");
const fs = require("fs");
const { createObjectCsvWriter } = require("csv-writer");
const path = require("path");

// Sample array of objects
// const data = [
//     { name: "John", age: 30, city: "New York" },
//     { name: "Alice", age: 25, city: "Los Angeles" },
//     { name: "Bob", age: 35, city: "Chicago" }
// ];

// // Define CSV file path
// const csvFilePath = 'data.csv';

// // Define CSV column headers
// const csvWriter = createObjectCsvWriter({
//     path: csvFilePath,
//     header: [
//         { id: 'name', title: 'Name' },
//         { id: 'age', title: 'Age' },
//         { id: 'city', title: 'City' }
//     ]
// });

// Route to create CSV file
// app.get('/create-csv', (req, res) => {
//     csvWriter.writeRecords(data)
//         .then(() => {
//             console.log('CSV file has been created successfully.');
//             res.send('CSV file has been created successfully.');
//         })
//         .catch(err => {
//             console.error('Error creating CSV file:', err);
//             res.status(500).send('Error creating CSV file.');
//         });
// });

// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });

exports.generateCsv = (req, res, next) => {
  // console.log(req.body);
//   const data = [
//     { notAttempted: "John", wrongAnswer: 30, correctAnswer: "New York" },
  
//   ];
const data=req.body.finalAnswers

  const dataFolderPath = path.join(__dirname, '..', 'data');

    // Ensure the data folder exists, if not create it
    if (!fs.existsSync(dataFolderPath)) {
        fs.mkdirSync(dataFolderPath);
    }

    // Define CSV file path within the data folder
    const csvFilePath = path.join(dataFolderPath, 'data.csv');
    



  // Define CSV column headers
  const csvWriter = createObjectCsvWriter({
    path: csvFilePath,
    header: req.body.headers
  });
  csvWriter
    .writeRecords(data)
    .then((csvfile) => {
      console.log("CSV file has been created successfully.");
      // console.log(csvFilePath)
      res.sendFile(csvFilePath);
    })
    .catch((err) => {
      console.error("Error creating CSV file:", err);
      res.status(500).send("Error creating CSV file.");
    });
};
