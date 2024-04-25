let currentUser = null;
let currentUserData = null;

const setUser = (username) => {
  currentUser = username;
  console.log(username);
  fetch(`/userData/${encodeURIComponent(username)}`)
    .then((response) => {
      console.log(response);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((userData) => {
      currentUser = username;
      currentUserData = userData;
    })
    .then(() => {
      window.location.href = "http://localhost:8000/index.html";
    })
    .catch((error) => {
      console.error("There was a problem fetching user data:", error);
    });
};
