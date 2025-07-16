const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

// Toggle sidebar visibility
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("hidden");
});

// Expand chart to full screen
// function expandChart(chart) {
//   const expanded = document.querySelector('.chart-section.fullscreen');
//   console.log("Clicked chart", chart);

//   if (expanded && expanded !== chart) {
//     expanded.classList.remove('fullscreen');
//   }
//   chart.classList.toggle('fullscreen');
// }

// function expandChart(chart) {
//   const expanded = document.querySelector('.chart-section.expanded');
//   if (expanded && expanded !== chart) {
//     expanded.classList.remove('expanded');
//   }
//   chart.classList.toggle('expanded');
// }
