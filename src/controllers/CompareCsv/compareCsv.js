const path = require("path");
const fs = require("fs");
const csvToJson = require("../../services/csvExtractor");
const { parse } = require('json2csv');
const { app} = require('electron');


const compareCsv = async (req, res) => {
    // console.log("entered");
    try {
        // Access other form data parameters
        const { firstInputFileName, secondInputFileName, primaryKey, skippingKey, imageColName, formFeilds } = req.body;
        const { omrImages } = req.uploadedFiles;
        const firstCSVFile = req.uploadedFiles.firstInputCsvFile
        const secondCSVFile = req.uploadedFiles.secondInputCsvFile
        // const firstFilePath = path.join(app.getPath('userData'), "../", "../", "COMPARECSV_FILES", "multipleCsvCompare", firstInputFileName);
        // const secondFilePath = path.join(app.getPath('userData'), "../", "../", "COMPARECSV_FILES", "multipleCsvCompare", secondInputFileName);
        const firstFilePath =  'COMPARECSV_FILES/'+ "multipleCsvCompare/"+ firstInputFileName;
         const secondFilePath =  'COMPARECSV_FILES/'+ "multipleCsvCompare/"+ secondInputFileName;
      
        
        const f1 = await csvToJson(firstFilePath)
        const f2 = await csvToJson(secondFilePath)

        const diff = [];




        for (let i = 0; i < f1.length; i++) {
            for (let j = 0; j < f2.length; j++) {
                const pkLength = f1[i][primaryKey].length;
                const str = " ".repeat(pkLength);
                if (f1[i][primaryKey] === f2[j][primaryKey] && f1[i][primaryKey] !== str && f2[i][primaryKey] !== str) {
                    for (let [key, value] of Object.entries(f1[i])) {
                        const val1 = value;
                        const val2 = f2[j][key];
                        const imgPathArr = f1[i][imageColName]?.split("\\");
                        const imgName = imgPathArr[imgPathArr.length - 1]
                        if (val1.includes("*") || val2.includes("*") || /^\s*$/.test(val1) || /^\s*$/.test(val2)) {
                            if (!skippingKey.includes(key) && formFeilds.includes(key)) {
                                const obj = {
                                    "PRIMARY": ` ${f1[i][primaryKey]}`,
                                    "COLUMN_NAME": key,
                                    "FILE_1_DATA": val1,
                                    "FILE_2_DATA": val2,
                                    "IMAGE_NAME": imgName,
                                    "CORRECTED": [],
                                    "CORRECTED BY": "",
                                    "PRIMARY KEY": primaryKey
                                }
                                diff.push(obj);
                            }
                        } else if (value !== f2[j][key]) {
                            if (!skippingKey.includes(key)) {
                                const obj = {
                                    "PRIMARY": ` ${f1[i][primaryKey]}`,
                                    "COLUMN_NAME": key,
                                    "FILE_1_DATA": val1,
                                    "FILE_2_DATA": val2,
                                    "IMAGE_NAME": imgName,
                                    "CORRECTED": [],
                                    "CORRECTED BY": "",
                                    "PRIMARY KEY": primaryKey
                                }
                                diff.push(obj);
                            }
                        }
                    }
                }

            }

        }

        const csvData = parse(diff);
        // const csvData = parse(arr)
        const correctedCsv = parse(f1);
        const directoryPath = 'COMPARECSV_FILES/'+ 'ErrorCsv';
        // Create directory if it doesn't exist
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }
        const CorrectionDirectoryPath ='COMPARECSV_FILES/'+  'CorrectedCsv';
        // Create directory if it doesn't exist
        if (!fs.existsSync(CorrectionDirectoryPath)) {
            fs.mkdirSync(CorrectionDirectoryPath, { recursive: true });
        }
        // Function to format date for file names
        const formatDate = (date) => {
            return date.toISOString().replace(/[:.]/g, '-'); // Replace colons and periods with dashes
        };
        // Specify the file path within the directory
        const errorDate = new Date();
        const errorFilePath = path.join(directoryPath, `error_${formatDate(errorDate)}.csv`);

        fs.writeFile(errorFilePath, csvData, (err) => {
            if (err) {
                console.error('Error writing CSV file:', err);
            } else {
                console.log('CSV file saved successfully.');
            }
        });
        const correctionDate = new Date();
        const correctionFilePath = path.join(CorrectionDirectoryPath, `corrected_${formatDate(correctionDate)}.csv`);
        fs.writeFile(correctionFilePath, correctedCsv, (err) => {
            if (err) {
                console.error('Error writing CSV file:', err);
            } else {
                console.log('CSV file saved successfully.');
            }
        });
        // Set the content type to CSV
        res.set('Content-Type', 'text/csv');

        // Set the content disposition header to trigger download
        res.set('Content-Disposition', 'attachment; filename="data.csv"');

        // Send the CSV data as the response
        res.status(200).send({
            csvFile: f1,
            data: diff,
            errorFilePath: errorFilePath,
            correctedFilePath: correctionFilePath,
            imageDirectoryName: omrImages

        });
    } catch (err) {
        // console.log(err)
        res.status(501).send({ error: err })
    }
}

module.exports = compareCsv;

