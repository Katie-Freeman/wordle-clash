const hCCheckbox = document.getElementById("hc-checkbox");

const toggleHighContrast = () => {
  const hCIsChecked = hCCheckbox.checked;

  localStorage.setItem("highcontrast", hCIsChecked ? "true" : "");

  const hCLink = document.createElement("link");

  hCLink.type = "text/css";
  hCLink.rel = "stylesheet";
  hCLink.href = "/css/highcontrast.css";
  if (hCIsChecked) {
    document.head.appendChild(hCLink);
  } else {
    const sheet = document.querySelector("link[href='/css/highcontrast.css']");
    document.head.removeChild(sheet);
  }
};

const highContrastFromStorage = localStorage.getItem("highcontrast");

if (highContrastFromStorage) {
  hCCheckbox.checked = true;
  toggleHighContrast();
}
