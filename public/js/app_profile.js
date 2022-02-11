const ctx = document.getElementById("myChart");
const chartWin = document.getElementById("chartWin");
const chartLoss = document.getElementById("chartLoss");
const gameSolo = document.getElementById("gameSolo");
const gameMulti = document.getElementById("gameMulti");
const btnMulti = document.getElementById("btnMulti");
const multiStats = document.getElementById("multiStats");
const soloStats = document.getElementById("soloStats");

let win = chartWin.value;
let loss = chartLoss.value;

btnMulti.addEventListener("click", () => {
  soloStats.style.display = "none";
  multiStats.style.display = "block";
  win = 50;
  loss = 50;
  // tableContainer.innerHTML = tableBuild(game);
});

btnSolo.addEventListener("click", () => {
  multiStats.style.display = "none";
  soloStats.style.display = "block";
  // tableContainer.innerHTML = tableBuild(game);
});

const data = {
  labels: [win + " Wins", loss + " Losses"],
  datasets: [
    {
      label: "My First Dataset",
      data: [chartWin.value, chartLoss.value],
      backgroundColor: ["rgb(157, 177, 113)", "rgb(176, 81, 75)"],
      hoverOffset: 4,
    },
  ],
};

const config = {
  type: "doughnut",
  data: data,
  options: {
    responsive: true,
  },
};

const myChart = new Chart(ctx, config);
