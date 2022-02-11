const checkbox = document.getElementById("checkbox");

const toggleDarkMode = () => {
    const isChecked = checkbox.checked;

    localStorage.setItem("darkmode", isChecked ? "true" : "");

    const link = document.createElement("link");

    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = "/css/darkmode.css";
    if (isChecked) {
        document.head.appendChild(link);
    } else {
        const sheet = document.querySelector("link[href='/css/darkmode.css']");
        document.head.removeChild(sheet);
    }
};

const darkModeFromStorage = localStorage.getItem("darkmode");

if (darkModeFromStorage) {
    checkbox.checked = true;
    toggleDarkMode();
}
