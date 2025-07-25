Chart.register(ChartDataLabels);

// Disable by default for all charts
Chart.defaults.set('plugins.datalabels', {
  display: false
});

// Enhanced loading and error handling
let isLoading = false;

function setLoadingState(loading) {
  isLoading = loading;
  const cards = document.querySelectorAll('.card');
  
  if (loading) {
    cards.forEach(card => card.classList.add('loading'));
    // Show loading overlay if needed
    // document.getElementById('loadingOverlay').style.display = 'flex';
  } else {
    cards.forEach(card => card.classList.remove('loading'));
    // document.getElementById('loadingOverlay').style.display = 'none';
  }
}

function showToast(message, type = 'info') {
  if (typeof window.showToast === 'function') {
    window.showToast(message, type);
  } else {
    console.log(`${type.toUpperCase()}: ${message}`);
  }
}

function handleError(error, context = '') {
  console.error(`Error in ${context}:`, error);
  showToast(`Failed to load ${context}. Please try again.`, 'error');
  setLoadingState(false);
}

// Global constants
const STATUS_LABELS = [
  'UNDER REPAIR', 'UNDER VIR', 'UNDER WCN PROCESS',
  'AWAITING COLLECTION',
   'IN WKSP'
];
const STATUS_COLORS = ['#0088FE', '#FF8042', '#FFBB28', '#00C49F', '#A28CFE', '#FF6699', '#FF4444'];

let lineChart;
let pieChart;

document.addEventListener('DOMContentLoaded', function() {
  const yearSelect = document.getElementById('yearSelect');
  const currentYear = new Date().getFullYear();

  for (let year = 2017; year <= currentYear; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    if (year === currentYear) option.selected = true;
    yearSelect.appendChild(option);
  }
});
function reloadChart() {
  const selectedGroup = document.getElementById('groupSelect').value;
  const selectedYear = document.getElementById('yearSelect').value;
  fetchAndRenderChart(selectedGroup, selectedYear);
}

function updateHeading(group, year) {
  const heading = document.getElementById('lineChartHeading');
  heading.textContent = `Month Wise Input & Output - ${group.toUpperCase()} (${year})`;
}


 






  


//line chart

function fetchAndRenderChart(group ,year) {
setLoadingState(true);
fetch(`get_chart_data.php?group=${group}&year=${year}`)

    .then(res => res.json())
    .then(result => {
      setLoadingState(false);
      const data = result.data;
      const labels = data.map(item => item.label);
      const inputCounts = data.map(item => item.input);
      const outputCounts = data.map(item => item.output);

      showToast(`Chart updated for ${group.toUpperCase()} (${year})`, 'success');

      if (lineChart) lineChart.destroy();

      const ctx = document.getElementById('lineChart').getContext('2d');
      lineChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Input (job_date)',
              data: inputCounts,
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              tension: 0.4,
              pointBackgroundColor: '#4CAF50',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
            },
            {
              label: 'Output (wcn_date)',
              data: outputCounts,
              borderColor: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.2)',
              tension: 0.4,
              pointBackgroundColor: '#2196F3',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
          },
          plugins: {
            title: {
              display: true,
            
            },
            legend: {
              position: 'left',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12,
                  weight: 'bold'
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: '#9455f4',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true,
              callbacks: {
                title: function(context) {
                  return `Period: ${context[0].label}`;
                },
                label: function(context) {
                  return `${context.dataset.label}: ${context.parsed.y} equipments`;
                }
              }
            }
          },
          scales: {
            x:{
              ticks:{
                font:{
                  weight:'bold',
                  size:11
                },
                padding:10,
                maxRotation: 45
              },
              grid: {
                offset: true,
                color: 'rgba(0, 0, 0, 0.1)'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'No. of Equipments',
                font: {
                  weight: 'bold',
                  size: 12
                }
              },
              ticks: {
                stepSize: 1,
                precision: 0,
                font:{
                  weight:'bold',
                  size: 11
              }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              }
            }
          }
        }
      });
    })
    .catch(err => handleError(err, 'chart data'));
}

// On Page Load - Default Group TL
// document.addEventListener('DOMContentLoaded', function () {
//   const groupSelect = document.getElementById('groupSelect');
//   fetchAndRenderChart(groupSelect.value);

//   groupSelect.addEventListener('change', function () {
//     fetchAndRenderChart(this.value);
//   });
// });



// pie chart

function fetchPieData(group) {
  const ctxPie = document.getElementById('statusChart')?.getContext('2d');
  if (!ctxPie) return;

  setLoadingState(true);
  fetch(`get_status_pie.php?group=${group}`)
    .then(res => res.json())
    .then(data => {
      setLoadingState(false);
      const counts = STATUS_LABELS.map(status =>
        data.find(d => d.status === status)?.count || 0
      );

      if (pieChart) pieChart.destroy();

      pieChart = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
          labels: STATUS_LABELS,
          datasets: [{
            data:counts,
            backgroundColor: STATUS_COLORS,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverBorderWidth: 3,
            hoverBorderColor: '#9455f4'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000,
            easing: 'easeInOutQuart'
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: '#9455f4',
              borderWidth: 1,
              cornerRadius: 8,
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const value = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percent = ((value / total) * 100).toFixed(0);
                  return `${label}: ${value} (${percent}%)`;
                }
              }
            }
          },
          onHover: (event, activeElements) => {
            event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
          }
        }
      });

       function renderCustomLegend(containerId, labels, counts, colors) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const total = counts.reduce((a, b) => a + b, 0) || 1;

  container.innerHTML = labels.map((label, i) => `
    <div style="
      display: inline-flex;
      align-items: center;
      background:	#e7d0f5;
      margin: 7px;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s ease;
    ">
      <span style=" 
        width: 7px; 
        height: 10px;
        border-radius: 50%; 
        background-color: ${colors[i]};
        display: inline-block; 
        margin-right: 5px;">
      </span>
      ${label} — ${counts[i]} (${((counts[i] / total) * 100).toFixed(1)}%)
    </div>
  `).join('');
}

renderCustomLegend('statuswise-legend', STATUS_LABELS, counts, STATUS_COLORS);


    })
    .catch(err => {
      handleError(err, 'status pie chart');
    });
}






       





// command pie chart 
// 🎯 Constants
const COMMAND_LABELS = ['SWC', 'NC', 'WC', 'EC', 'SC', 'CC', 'IAF'];
const COMMAND_COLORS = ['#0088FE', '#FF8042', '#FFBB28', '#00C49F', '#A28CFE', '#FF6699', '#FF4444'];



let underRepairPie, awaitingCollectionPie;

function loadCommandWiseCharts(group) {
  setLoadingState(true);
  fetch(`get_command_pie.php?group=${group}`)
    .then(res => res.json())
    .then(data => {
      setLoadingState(false);
      const underRepairCounts = COMMAND_LABELS.map(cmd =>
        data['under_repair'].find(d => d.command === cmd)?.count || 0
      );
      const awaitingCollectionCounts = COMMAND_LABELS.map(cmd =>
        data['awaiting_collection'].find(d => d.command === cmd)?.count || 0
      );

      console.log('Under Repair Data:', underRepairCounts);
      console.log('Awaiting Collection Data:', awaitingCollectionCounts);

      if (underRepairPie) underRepairPie.destroy();
      if (awaitingCollectionPie) awaitingCollectionPie.destroy();

      const ctx1 = document.getElementById('underRepairChart')?.getContext('2d');
      if (ctx1) {
        underRepairPie = new Chart(ctx1, {
          type: 'pie',
          data: {
            labels: COMMAND_LABELS,
            datasets: [{
              data: underRepairCounts,
              backgroundColor: COMMAND_COLORS,
              borderWidth: 2,
              borderColor: '#ffffff',
              hoverBorderWidth: 3,
              hoverBorderColor: '#9455f4'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: 1000,
              easing: 'easeInOutQuart'
            },
            plugins:{
              legend:{display:false},
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#9455f4',
                borderWidth: 1,
                cornerRadius: 8
              }
            },
            onHover: (event, activeElements) => {
              event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
            }
          }
        });
      }

      const ctx2 = document.getElementById('repairAwaitingChart')?.getContext('2d');
      if (ctx2) {
        awaitingCollectionPie = new Chart(ctx2, {
          type: 'pie',
          data: {
            labels: COMMAND_LABELS,
            datasets: [{
              data: awaitingCollectionCounts,
              backgroundColor: COMMAND_COLORS,
              borderWidth: 2,
              borderColor: '#ffffff',
              hoverBorderWidth: 3,
              hoverBorderColor: '#9455f4'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: 1000,
              easing: 'easeInOutQuart'
            },
            plugins: { 
              legend: { display:false },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#9455f4',
                borderWidth: 1,
                cornerRadius: 8
              }
            },
            onHover: (event, activeElements) => {
              event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
            }
          }
        });
      }
      
  // custom legend    
  function renderCustomLegend(containerId, labels, counts, colors) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const total = counts.reduce((a, b) => a + b, 0) || 1;



  container.innerHTML = labels.map((label,i)=>`
  <div class="legend-item">
  <span class="legend-dot" style="background-color:${colors[i]};"></span>
  ${label}-${counts[i]} (${((counts[i]/total)*100).toFixed(1)}%)
  </div>
  `).join('');
}

renderCustomLegend('underRepairLegendBox', COMMAND_LABELS, underRepairCounts, COMMAND_COLORS);
renderCustomLegend('awaitingCollectionLegendBox', COMMAND_LABELS, awaitingCollectionCounts, COMMAND_COLORS);


    })
    .catch(err => handleError(err, 'command-wise pie charts'));
}

  



let repairAgeChart = null;
const REPAIRSTATUS_LABEL = ['Under 3 Months', '3-6 Months', '6-12 Months', 'Over 1 Year'];
const REPAIRSTATUS_COLOR = ['#e67e22', '#e67e22', '#e67e22', '#e67e22'];

// ✅ Register plugin (only once globally)
Chart.register(ChartDataLabels);

function loadRepairAgeChart(group) {
  setLoadingState(true);
  fetch(`equipment_data.php?group=${group}`)
    .then(res => res.json())
    .then(data => {
      setLoadingState(false);
      console.log('Repair Age Data:', data.counts);

      if (repairAgeChart && typeof repairAgeChart.destroy === 'function') {
        repairAgeChart.destroy();
      }

      const ctx = document.getElementById('repairAgeChart')?.getContext('2d');
      if (ctx) {
        repairAgeChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: REPAIRSTATUS_LABEL,
            datasets: [{
              label: 'Equipment Count',
              data: data.counts,
              backgroundColor: REPAIRSTATUS_COLOR,
              borderWidth: 2,
              borderColor: '#ffffff',
              hoverBackgroundColor: '#d35400',
              hoverBorderColor: '#9455f4',
              hoverBorderWidth: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 1000,
              easing: 'easeInOutQuart'
            },
            plugins: {
              legend: { display: false },
              // ✅ Show labels above each bar
              datalabels: {
                display:true,
                anchor: 'end',
                align: 'end',
                color: '#000',
                font: {
                  weight: 'bold'
                },
                formatter: Math.round
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#9455f4',
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                  label: function(context) {
                    return `Equipment Count: ${context.parsed.y}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: { 
                  display: true, 
                  text: 'Equipment Count',
                  font: {
                    weight: 'bold',
                    size: 12
                  }
                },
                ticks: {
                  stepSize: 1,
                  precision: 0,
                  font: {
                    weight: 'bold',
                    size: 11
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              },
              x: {
                ticks: {
                  font: {
                    weight: 'bold',
                    size: 11
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              }
            },
            onHover: (event, activeElements) => {
              event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
            }
          },
          plugins: [ChartDataLabels] // ✅ Attach plugin here
        });

        // ✅ Custom Legend Renderer
        function renderCustomLegend(containerId, labels, counts, colors) {
          const container = document.getElementById(containerId);
          if (!container) return;

          const total = counts.reduce((a, b) => a + b, 0) || 1;

          container.innerHTML = labels.map((label, i) => `
            <div style="
              display: inline-flex;
              align-items: center;
              background: #e7d0f5;
              margin: 4px;
              border-radius: 5px;
              padding: 2px 6px;
              cursor: pointer;
              transition: all 0.3s ease;
            ">
              <span style="
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: ${colors[i]};
                display: inline-block;
                margin-right: 5px;">
              </span>
              ${label}-${counts[i]} (${((counts[i] / total) * 100).toFixed(1)}%)
            </div>
          `).join('');
        }

        renderCustomLegend('underRepairbarchart', REPAIRSTATUS_LABEL, data.counts, REPAIRSTATUS_COLOR);
      }
    })
    .catch(err => handleError(err, 'repair age chart'));
}

       
                          



// window.addEventListener('DOMContentLoaded', () => {
//   const defaultGroup = 'tl';
//   const defaultyear = new Date().getFullYear();
//   fetchAndRenderChart(defaultGroup ,defaultyear)
//   fetchPieData(defaultGroup);
//   loadCommandWiseCharts(defaultGroup);
//   loadRepairAgeChart(defaultGroup)


  
//   document.getElementById('groupSelect')?.addEventListener('change', reloadChart);
//   document.getElementById('yearSelect')?.addEventListener('change', reloadChart);
 

//   document.getElementById('groupSelect')?.addEventListener('change', function () {
//     const group = this.value;
//     fetchAndRenderChart(group ,defaultyear)
//     fetchPieData(group);
//     loadCommandWiseCharts(group);
//     loadRepairAgeChart(group);
//       // fetchAndRenderRepairChart(group);
//   });
// });
window.addEventListener('DOMContentLoaded', () => {
  selectGroup('tl');  

  // Also attach dropdown change event
  const groupSelect = document.getElementById('groupSelect');
  const yearSelect = document.getElementById('yearSelect');

  if (groupSelect) {
    groupSelect.addEventListener('change', function () {
      selectGroup(this.value);
    });
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', function () {
      const group = groupSelect?.value || 'tl';
      selectGroup(group);
    });
  }
});

// get summary of chart 

// function fetchSummary(group, year) {
//   fetch(`get_summary_chart.php?group=${group}&year=${year}`)
//     .then(res => res.json())
//     .then(data => {
//       document.getElementById('totalInputs').textContent = data.totalInputs;
//       document.getElementById('totalOutputs').textContent = data.totalOutputs;
//       document.getElementById('currentMonthSummary').textContent = `${data.currentMonthInputs} / ${data.currentMonthOutputs}`;
//     });
// }

// function fetchSummary(group, year) {
//   fetch(`get_summary_chart.php?group=${group}&year=${year}`)
//     .then(res => res.json())
//     .then(data => {
//       document.getElementById('totalInputs').textContent = data.totalInputs;
//       document.getElementById('totalOutputs').textContent = data.totalOutputs;
//       document.getElementById('currentMonthSummary').textContent = `${data.currentMonthInputs} / ${data.currentMonthOutputs}`;
//       document.getElementById('summaryYear').textContent = year;
//       document.getElementById('summaryYear2').textContent = year;
//     });
// }

function fetchSummary(group, year) {
  setLoadingState(true);
  fetch(`get_summary_chart.php?group=${group}&year=${year}`)
    .then(res => res.json())
    .then(data => {
      setLoadingState(false);
      document.getElementById('totalInputs').textContent = data.totalInputs;
      document.getElementById('totalOutputs').textContent = data.totalOutputs;
      document.getElementById('currentInputs').textContent = data.currentMonthInputs;
      document.getElementById('currentOutputs').textContent = data.currentMonthOutputs;

      // Update year displays
      document.getElementById('summaryYear').textContent = year;
      document.getElementById('summaryYear2').textContent = year;

      showToast(`Summary updated for ${group.toUpperCase()} (${year})`, 'success');
    })
    .catch(err => handleError(err, 'summary data'));
}





function selectGroup(group) {
  const year = document.getElementById('yearSelect')?.value || new Date().getFullYear();

  // Set the dropdown value so both stay in sync
  const groupSelect = document.getElementById('groupSelect');
  if (groupSelect) groupSelect.value = group;
updateHeading(group, year);
  fetchAndRenderChart(group, year);
    fetchSummary(group, year);  // 

  fetchPieData(group);
  loadCommandWiseCharts(group);
  loadRepairAgeChart(group);
    document.querySelectorAll('.group-buttons button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.group-buttons button[onclick="selectGroup('${group}')"]`)?.classList.add('active');
  
  showToast(`Switched to ${group.toUpperCase()} group`, 'info');
  
  // Announce to screen readers
  if (window.announceToScreenReader) {
    window.announceToScreenReader(`Switched to ${group.toUpperCase()} group data`);
  }
}





