const { app, BrowserWindow } = require('electron');
const express = require("express");
const expressApp = express();
const cors = require("cors");
const sequelize = require("./utils/database");
const bodyParser = require("body-parser");
const templeteRoutes = require("./routes/templete");
const userRoutes = require("./routes/userManagement");
const compareCsv = require("./routes/compareCsv");
const Templete = require("./models/TempleteModel/templete");
const User = require("./models/User");
const MetaData = require("./models/TempleteModel/metadata");
const Files = require("./models/TempleteModel/files");
const PORT = 4000;
const upload = require("./routes/upload");
const path = require("path");
const bcrypt = require("bcryptjs");
const Assigndata = require("./models/TempleteModel/assigndata");
const RowIndexData = require("./models/TempleteModel/rowIndexData");

//middlewares
expressApp.use(cors());
expressApp.use(express.json());
expressApp.use(bodyParser.json({ extended: false }));
expressApp.use(bodyParser.urlencoded({ extended: false }));

const imageDirectoryPath = path.join(
  __dirname,
  "../",
  "COMPARECSV_FILES",
  "OmrImages",
  "Images_2024-05-04T04-38-30-972Z/005.jpg"
);
expressApp.use("/images", express.static(imageDirectoryPath));
// Serve static files
expressApp.use(express.static(path.join(__dirname, 'build')));
//all routes
expressApp.use("/users", userRoutes);
expressApp.use(upload);
expressApp.use(compareCsv);
expressApp.use(templeteRoutes);

// Set up database associations
Templete.hasMany(MetaData);
MetaData.belongsTo(Templete);
Templete.hasMany(Files);
Files.belongsTo(Templete);
Assigndata.hasMany(RowIndexData);
RowIndexData.belongsTo(Assigndata);

// Sync database and create admin user if not exists
sequelize
  .sync({ force: false })
  .then(async () => {
    const adminUser = await User.findOne({ where: { role: "admin" } });
    const hashedPassword = await bcrypt.hash("123456", 12);
    if (!adminUser) {
      await User.create({
        userName: "admin",
        mobile: "1234567891",
        password: hashedPassword,
        role: "Admin",
        email: "admin@gmail.com",
        permissions: {
          dataEntry: true,
          comparecsv: true,
          csvuploader: true,
          createTemplate: true,
          resultGenerator: true,
        },
      });
    }
    // Start the server
    expressApp.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// Create main Electron window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    autoHideMenuBar:false,
    
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.setMenu(null);
  mainWindow.loadURL(`http://localhost:${PORT}`);
  // mainWindow.webContents.openDevTools();
}

// Start Electron app
app.whenReady().then(() => {
  createWindow();
});

// Quit the app when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, quit the app when all windows are closed unless Cmd + Q is explicitly used
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// When the app is activated, create a new browser window if none are open
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
