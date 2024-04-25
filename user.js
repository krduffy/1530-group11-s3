let currentUser = null;
let currentUserData = null;

const setUser = (username) => {
  currentUser = username;
  fetch("https://localhost/userData?username=krduffy")
    .then((response) => {
      console.log(response);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((userData) => {
      currentUserData = userData;
      console.log("User data:", user);
    })
    .catch((error) => {
      console.error("There was a problem fetching user data:", error);
    });
};
