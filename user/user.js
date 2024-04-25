const setUser = (username) => {
  fetch(`/userData/${encodeURIComponent(username)}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((userData) => {
      localStorage.setItem("currentUser", username);
      for (var i = 0; i < userData.length; i++) {
        userData[i] = JSON.stringify(userData[i]);
      }
      localStorage.setItem("currentUserData", JSON.stringify(userData));
    })
    .then(() => {
      window.location.href = "http://localhost:8000/index.html";
    })
    .catch((error) => {
      console.error("There was a problem fetching user data:", error);
    });
};

const logOut = () => {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("currentUserData");
  location.reload();
};
