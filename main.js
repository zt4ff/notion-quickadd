const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { Client } = require("@notionhq/client");
const dotenv = require("dotenv");

dotenv.config();

const sendTicketToNotionDatabase = (text) => {
  return new Promise(async (res, rej) => {
    try {
      const notion = new Client({
        auth: process.env.NOTION_TOKEN,
      });

      const response = await notion.pages.create({
        parent: { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          title: [
            {
              text: {
                content: text,
              },
            },
          ],
        },
      });

      console.log("Entry successfully added");
      res();
    } catch (err) {
      rej(err);
    }
    // do random stuff for 3 seconds
    setTimeout(() => res("resolved"), 3000);
  });
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 100,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");
};

app.whenReady().then(() => {
  ipcMain.on("ping", (event, text) => {
    console.log(text);

    sendTicketToNotionDatabase(text).then((val) => {
      console.log(val);
      app.quit();
    });
  });
  createWindow();

  app.on("window-all-closed", () => {
    app.quit();
  });
});
