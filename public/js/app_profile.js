const ctx = document.getElementById("myChart");
const chartWin = document.getElementById("chartWin");
const chartLoss = document.getElementById("chartLoss");
const gameSolo = document.getElementById("gameSolo");
const gameMulti = document.getElementById("gameMulti");
const btnMulti = document.getElementById("btnMulti");
const multiStats = document.getElementById("multiStats");
const soloStats = document.getElementById("soloStats");
const labelTotalMulti = document.getElementById("labelTotalMulti");
const labelTotal = document.getElementById("labelTotal");

let win = chartWin.value;
let loss = chartLoss.value;

let myChart = displayChart(win, loss);

btnMulti.addEventListener("click", () => {
    soloStats.style.display = "none";
    multiStats.style.display = "block";
    labelTotal.style.display = "none";
    labelTotalMulti.style.display = "block";
    myChart.destroy();
    myChart = displayChart(chartWinMulti.value, chartLossMulti.value);
    // tableContainer.innerHTML = tableBuild(game);
});

btnSolo.addEventListener("click", () => {
    multiStats.style.display = "none";
    soloStats.style.display = "block";
    labelTotal.style.display = "block";
    labelTotalMulti.style.display = "none";
    myChart.destroy();
    myChart = displayChart(chartWin.value, chartLoss.value);
});

function changeStats(win, loss) {
    const highContrastFromStorage = localStorage.getItem
    ("highcontrast");
    let correctRGB = "rgb(0, 128, 0)";
    let outRGB = "rgb(211, 211, 6)";

    if (highContrastFromStorage) {
        correctRGB = "rgb(0, 114, 187)";
        outRGB = "rgb(254, 95, 85)";
    }

    const data = {
        labels: [win + " Wins", loss + " Losses"],
        datasets: [
            {
                label: "My First Dataset",
                data: [win, loss],
                backgroundColor: [correctRGB, outRGB],
                hoverOffset: 4,
            },
        ],
    };
    return data;
}
function updateConfig(win, loss) {
    const config = {
        type: "doughnut",
        data: changeStats(win, loss),
        options: {
            responsive: true,
        },
    };
    return config;
}
function displayChart(win, loss) {
    const myChart = new Chart(ctx, updateConfig(win, loss));
    return myChart;
}
