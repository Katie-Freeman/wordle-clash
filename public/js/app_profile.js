const ctx = document.getElementById("myChart");
const chartWin = document.getElementById("chartWin");
const chartLoss = document.getElementById("chartLoss");

let win = chartWin.value;
let loss = chartLoss.value;

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
