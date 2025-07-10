const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

// Toggle sidebar visibility
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("hidden");
});

// Expand chart to full screen
// function expandChart(chart) {
//   const expanded = document.querySelector('.chart-section.fullscreen');
//   if (expanded && expanded !== chart) {
//     expanded.classList.remove('fullscreen');
//   }
//   chart.classList.toggle('fullscreen');
// }


// function expandChart() {
//   const chartSection = document.getElementById("equipmentChartContainer");
//   chartSection.classList.add("fullscreen");
// }

// function closeFullScreen() {
//   const chartSection = document.getElementById("equipmentChartContainer");
//   chartSection.classList.remove("fullscreen");
// }
