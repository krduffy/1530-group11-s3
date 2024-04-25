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
  if (!db["userFinancialData"][userId]) {
    db["userFinancialData"][userId] = [];
  }
  db["userFinancialData"][userId].push(dataJson);
  writeDatabaseToFile(db);
};

const readData = async (userId) => {
  const db = await readDatabaseFromFile();
  return db["userFinancialData"][userId] || [];
};

/* Returns the user's username if their account could be successfully created,
   null otherwise. */
const createAccount = async (username, password) => {
  const db = await readDatabaseFromFile();

  if (db["userLoginData"].hasOwnProperty(username)) {
    return null;
  }

  db["userLoginData"][username] = password;
  writeDatabaseToFile(db);
  return username;
};

/* Returns the user's username if they exist, null otherwise. */
const logIn = async (username, password) => {
  const db = await readDatabaseFromFile();

  if (
    db["userLoginData"][username] &&
    db["userLoginData"][username] === password
  ) {
    return username;
  }

  return null;
};

const initDatabase = async () => {
  const initialDatabase = {
    userLoginData: {},
    userFinancialData: {},
  };

  writeDatabaseToFile(initialDatabase);
};

(async () => {
  await initDatabase();
  const user = await createAccount("krduffy", "123");
  const seconduser = await createAccount("seconduser", "456");
  await writeData(user, {
    type: "Income",
    amt: 2014.26,
    source: "Paycheck",
  });
  await writeData(seconduser, {
    type: "Expense",
    amt: 1000.0,
    source: "New computer",
  });
  const sameuser = await logIn("krduffy", "123");
  await writeData(sameuser, {
    type: "Income",
    amt: 0.25,
    source: "Found on ground",
  });
})();
