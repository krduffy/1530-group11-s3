let incomeForm;
let expenseForm;
let totalIncomeSpan;
let totalExpenseSpan;
let balanceSpan;
let ctx;

let incomeData = [];
let expenseData = [];
let myChart;

const getFormData = (form) => {
  var formData = {};
  var formElements = form.elements; // Get all elements in the form
  for (var i = 0; i < formElements.length; i++) {
    var input = formElements[i];
    if (input.tagName === "INPUT" && input.type !== "submit") {
      // Ignore submit button
      formData[input.name] = input.value; // Add input value to the formData object
      if (input.name === "amount") {
        formData[input.name] = parseFloat(formData[input.name]);
      }
    }
  }
  return formData;
};

const postUserData = (data) => {
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

  let userDataAsJson;
  if (localStorage.getItem("currentUserData") != null) {
    userDataAsJson = JSON.parse(localStorage.getItem("currentUserData"));
    userDataAsJson = userDataAsJson.map((item) => JSON.parse(item));
    incomeData = userDataAsJson.filter((item) => {
      return item["type"] === "Income";
    });
    expenseData = userDataAsJson.filter((item) => {
      return item["type"] === "Expense";
    });
    updateTotals();
    updateChart();
  }

  incomeForm.addEventListener("submit", function (event) {
    event.preventDefault();
    let incomeAmount = parseFloat(
      document.getElementById("incomeAmount").value
    );
    if (!isNaN(incomeAmount)) {
      let incomeFormData = getFormData(event.target);
      incomeFormData["type"] = "Income";
      incomeData.push(incomeFormData);
      updateTotals();
      updateChart();
      postUserData(incomeFormData);
    }
    document.getElementById("incomeAmount").value = "";
  });

  expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();
    let expenseAmount = parseFloat(
      document.getElementById("expenseAmount").value
    );
    if (!isNaN(expenseAmount)) {
      let expenseFormData = getFormData(event.target);
      expenseFormData["type"] = "Expense";
      expenseData.push(expenseFormData);
      updateTotals();
      updateChart();

      postUserData(expenseFormData);
    }
    document.getElementById("expenseAmount").value = "";
  });

  // Initial chart update
  updateChart();
};

function updateTotals() {
  let totalIncome = incomeData.reduce((total, key) => {
    return total + key["amount"];
  }, 0);
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
            incomeData.reduce((total, key) => total + key["amount"], 0),
            expenseData.reduce((total, key) => total + key["amount"], 0),
            incomeData.reduce((total, key) => total + key["amount"], 0) -
              expenseData.reduce((total, key) => total + key["amount"], 0),
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
