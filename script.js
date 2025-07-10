

// Global constants
const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STATUS_LABELS = [
  'UNDER REPAIR', 'UNDER VIR', 'UNDER WCN PROCESS',
  'AWAITING COLLECTION', 'EQPT COLLECTED',
  'AWAITING JOB NO', 'IN WKSP'
];
const STATUS_COLORS = ['#0088FE', '#FF8042', '#FFBB28', '#00C49F', '#A28CFE', '#FF6699', '#FF4444'];

let lineChart;
let pieChart;

// Load default data
window.addEventListener('DOMContentLoaded', () => {
  const defaultGroup = 'tl';
  fetchLineChartData(defaultGroup);
  fetchPieData(defaultGroup);

  // Group filter event
  document.getElementById('groupSelect')?.addEventListener('change', function () {
    const group = this.value;
    fetchLineChartData(group);
    fetchPieData(group);
  });
});

// 📊 Line Chart
function fetchLineChartData(group) {
  const ctxLine = document.getElementById('equipmentChart')?.getContext('2d');
  if (!ctxLine) return;

  fetch(`get_chart_data.php?group=${group}`)
    .then(res => res.json())
    .then(data => {
      const monthMap = {};

      // Initialize all months with zero values
      allMonths.forEach(month => {
        monthMap[month] = { input: 0, output: 0 };
      });

      data.forEach(d => {
        if (!d.date) return;

        const parsedDate = new Date(d.date);
        if (isNaN(parsedDate)) return;

        const monthIndex = parsedDate.getMonth();
        const monthName = allMonths[monthIndex];

        monthMap[monthName].input += d.input;
        monthMap[monthName].output += d.output;
      });

      const inputData = allMonths.map(month => monthMap[month].input);
      const outputData = allMonths.map(month => monthMap[month].output);

      if (lineChart) lineChart.destroy();

      lineChart = new Chart(ctxLine, {
        type: 'line',
        data: {
          labels: allMonths,
          datasets: [
            {
              label: 'Input',
              data: inputData,
              borderColor: 'green',
              backgroundColor: 'green',
              pointRadius: 4,
              tension: 0.3
            },
            {
              label: 'Output',
              data: outputData,
              borderColor: 'blue',
              backgroundColor: 'blue',
              pointRadius: 4,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: {
              display: true,
              text: 'Monthly Equipment Input/Output'
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Month'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'No. of Equipments'
              },
              ticks: {
                stepSize: 1,
                precision: 0
              }
            }
          }
        }
      });
    })
    .catch(err => console.error('🔥 Error fetching line chart:', err));
}



function fetchPieData(group) {
  const ctxPie = document.getElementById('statusChart')?.getContext('2d');
  if (!ctxPie) return;

  fetch(`get_status_pie.php?group=${group}`)
    .then(res => res.json())
    .then(data => {
      const counts = STATUS_LABELS.map(status =>
        data.find(d => d.status === status)?.count || 0
      );

      if (pieChart) pieChart.destroy();

      pieChart = new Chart(ctxPie, {
        type: 'pie',
        data: {
          labels: STATUS_LABELS,
          datasets: [{
            data: counts,
            backgroundColor: STATUS_COLORS
          }]
        },
        options: {
          plugins: {
            legend: { display: false },
            tooltip: {
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
          }
        }
      });

      // ✅ Custom legend box
      const legendBox = document.getElementById('legend-box');
      if (legendBox) {
        legendBox.innerHTML = STATUS_LABELS.map((status, i) => `
          <div style="margin: 4px 0;">
            <span style="background:${STATUS_COLORS[i]}; width:12px; height:12px; display:inline-block; border-radius:50%; margin-right:6px;"></span>
            ${status}
          </div>
        `).join('');
      }
    })
    .catch(err => {
      console.error('🔥 Error loading status pie chart:', err);
    });
}

       





// command pie chart 
// 🎯 Constants
const COMMAND_LABELS = ['SWC', 'NC', 'WC', 'EC', 'SC', 'CC', 'IAF'];
const COMMAND_COLORS = ['#0088FE', '#FF8042', '#FFBB28', '#00C49F', '#A28CFE', '#FF6699', '#FF4444'];

let commandChart; // Chart instance

// 🥧 Command-wise Pie Chart
function fetchCommandPieData(group) {
  const canvas = document.getElementById('commandChart');
  if (!canvas) return;

  fetch(`get_command_pie.php?group=${group}`)
    .then(res => res.json())
    .then(data => {
      const filtered = data.filter(item => item.count > 0); // Only show non-zero slices

      // If no data, optionally handle empty chart
      if (filtered.length === 0) {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        document.getElementById('command-legend').innerHTML = '<em>No data available</em>';
        return;
      }

      // Destroy previous chart if it exists
      if (commandChart) commandChart.destroy();

      const ctx = canvas.getContext('2d');

      commandChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: filtered.map(d => d.command),
          datasets: [{
            data: filtered.map(d => d.count),
            backgroundColor: filtered.map(d => {
              const index = COMMAND_LABELS.indexOf(d.command);
              return COMMAND_COLORS[index] || '#ccc';
            })
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false // We will use custom legend
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const value = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percent = ((value / total) * 100).toFixed(0);
                  return `${context.label}: ${value} (${percent}%)`;
                }
              }
            }
          }
        }
      });

      // ✅ Custom legend
    //   const legendBox = document.getElementById('command-legend');
    //   legendBox.innerHTML = filtered.map((d, i) => `
    //     <div class="legend-item">
    //       <span style="background-color:${COMMAND_COLORS[i]}; width:12px; height:12px; display:inline-block; border-radius:50%; margin-right:6px;"></span>
    //       ${d.command}
    //     </div>
    //   `).join('');
    // })
    // .catch(err => {
    //   console.error('🔥 Error loading command pie data:', err);
    // });
     const legendBox = document.getElementById('command-legend');
      legendBox.innerHTML = COMMAND_LABELS.map((cmd, i) => `
        <div class="legend-item">
          <span style="background-color:${COMMAND_COLORS[i]}; width:12px; height:12px; display:inline-block; border-radius:50%; margin-right:6px;"></span>
          ${cmd}
        </div>
      `).join('');
    })
    .catch(err => {
      console.error('🔥 Error loading command pie data:', err);
    });
}




let barChart;

function loadChart(group) {
  fetch(`get_avg_duration.php?group=${group}`)
    .then(res => res.json())
    .then(data => {
      const jobNos = data.map(d => d.job_no);
      const durations = data.map(d => d.duration);
      const bgColors = data.map(d =>
        d.status === 'Completed' ? '#4CAF50' : '#FFA726'
      );

      const ctx = document.getElementById('durationChart').getContext('2d');

      if (barChart) barChart.destroy();

      barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: jobNos,
          datasets: [{
            label: 'Repair Duration (Days)',
            data: durations,
            backgroundColor: bgColors
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: context => `${context.raw} days`
              }
            },
            title: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Duration (Days)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Job No'
              }
            }
          }
        }
      });
    })
    .catch(err => {
      console.error('🔥 Fetch Error:', err);
    });
}



           
                     


// Global constants like allMonths, COLORS, etc.

// Function: fetchLineChartData

// Function: fetchPieData

// Function: fetchCommandPieData

// // ✅ DOMContentLoaded block — PLACE THIS AT END
window.addEventListener('DOMContentLoaded', () => {
  const defaultGroup = 'tl';
  fetchLineChartData(defaultGroup);
  fetchPieData(defaultGroup);
  fetchCommandPieData(defaultGroup);
  loadChart(defaultGroup);

  document.getElementById('groupSelect')?.addEventListener('change', function () {
    const group = this.value;
    fetchLineChartData(group);
    fetchPieData(group);
    fetchCommandPieData(group);
    loadChart(group);
  });
});
