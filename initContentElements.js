let incomeForm;
let expenseForm;
let totalIncomeSpan;
let totalExpenseSpan;
let balanceSpan;
let ctx;
let resetDataButton;

let incomeData = [];
let expenseData = [];
let myChart;

const postUserData = (data) => {
  console.log("making post req");
  console.log(localStorage.getItem("currentUser"));
  fetch(
    `/addUserData/${encodeURIComponent(localStorage.getItem("currentUser"))}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Login failed");
      }
    })
    .catch((error) => {
      console.error("Login error:", error.message);
      alert("Login failed. Please check your credentials and try again.");
    });
};

const initContentElements = (userData) => {
  incomeForm = document.getElementById("incomeForm");
  expenseForm = document.getElementById("expenseForm");
  totalIncomeSpan = document.getElementById("totalIncome");
  totalExpenseSpan = document.getElementById("totalExpense");
  balanceSpan = document.getElementById("balance");
  ctx = document.getElementById("myChart").getContext("2d");
  resetDataButton = document.getElementById("resetDataButton");

  console.log(userData);

  let userDataAsJson;
  if (localStorage.getItem("currentUserData") != null) {
    userDataAsJson = JSON.parse(localStorage.getItem("currentUserData"));
    userDataAsJson = userDataAsJson.map((item) => JSON.parse(item));
    console.log(userDataAsJson);
    incomeData = userDataAsJson.filter((item) => {
      console.log(item);
      return item["type"] === "Income";
    });
    expenseData = userDataAsJson.filter((item) => {
      return item["type"] === "Expense";
    });
    console.log("income");
    console.log(incomeData);
    console.log("ex");
    console.log(expenseData);
    updateTotals();
    updateChart();
  }

  incomeForm.addEventListener("submit", function (event) {
    event.preventDefault();
    let incomeAmount = parseFloat(
      document.getElementById("incomeAmount").value
    );
    if (!isNaN(incomeAmount)) {
      incomeData.push(event.target);
      updateTotals();
      updateChart();
      postUserData(event.target);
    }
    document.getElementById("incomeAmount").value = "";
  });

  expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();
    let expenseAmount = parseFloat(
      document.getElementById("expenseAmount").value
    );
    if (!isNaN(expenseAmount)) {
      expenseData.push(event.target);
      updateTotals();
      updateChart();

      postUserData(event.target);
    }
    document.getElementById("expenseAmount").value = "";
  });

  resetDataButton.addEventListener("click", function () {
    incomeData = []; // Reset income data array
    expenseData = []; // Reset expense data array
    updateTotals(); // Update totals and UI
    updateChart(); // Update the chart
  });

  // Initial chart update
  updateChart();
};

function updateTotals() {
  console.log(incomeData);
  console.log(expenseData);
  let totalIncome = incomeData.reduce((total, key) => {
    console.log(key);
    return total + key["amount"];
  }, 0);
  console.log(totalIncome);
  let totalExpense = expenseData.reduce(
    (total, key) => total + key["amount"],
    0
  );
  let balance = totalIncome - totalExpense;
  totalIncomeSpan.textContent = `$${totalIncome.toFixed(2)}`;
  totalExpenseSpan.textContent = `$${totalExpense.toFixed(2)}`;
  balanceSpan.textContent = `$${balance.toFixed(2)}`;
}

function updateChart() {
  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Total Income", "Total Expense", "Balance"],
      datasets: [
        {
          label: "Amount",
          data: [
            incomeData.reduce((total, amount) => total + amount, 0),
            expenseData.reduce((total, amount) => total + amount, 0),
            incomeData.reduce((total, amount) => total + amount, 0) -
              expenseData.reduce((total, amount) => total + amount, 0),
          ],
          backgroundColor: [
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 99, 132, 0.2)",
            "rgba(75, 192, 192, 0.2)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
