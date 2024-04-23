const fs = require("fs");
const databasePath = "./database.json";

/* Currently has no error checking */

const readDatabaseFromFile = () => {
  /* promise to prevent async from leading to auto return of null */
  return new Promise((resolve, reject) => {
    fs.readFile(databasePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading database file. Error: ", err);
        reject(err);
      }

      try {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      } catch (err) {
        console.error("Error parsing database JSON data. Error: ", err);
        reject(err);
      }
    });
  });
};

const writeDatabaseToFile = (data) => {
  try {
    fs.writeFileSync("database.json", JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing to database file. Error: ", err);
  }
};

const writeData = async (userId, dataJson) => {
  const db = await readDatabaseFromFile();
  if (!db[userId]) {
    db[userId] = [];
  }
  db[userId].push(dataJson);
  writeDatabaseToFile(db);
};

const readData = async (userId) => {
  const db = await readDatabaseFromFile();
  return db[userId] || [];
};

(async () => {
  await writeData("sarah", {
    type: "Income",
    amt: 2014.26,
    source: "Paycheck",
  });
  await writeData("timmy", {
    type: "Income",
    amt: 14.5,
    source: "Allowance",
  });
})();
