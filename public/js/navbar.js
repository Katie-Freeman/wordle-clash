const toggleDarkMode = () => {
  const checkbox = document.getElementById("checkbox");
  const isChecked = checkbox.checked;

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
