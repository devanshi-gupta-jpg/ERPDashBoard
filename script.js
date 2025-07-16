

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





function fetchAndRenderChart(group) {
  fetch(`get_chart_data.php?group=${group}`)
    .then(res => res.json())
    .then(result => {
      const data = result.data;
      const labels = data.map(item => item.label);
      const inputCounts = data.map(item => item.input);
      const outputCounts = data.map(item => item.output);

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
              tension: 0.4
            },
            {
              label: 'Output (wcn_date)',
              data: outputCounts,
              borderColor: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.2)',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `Monthly Equipment Input & Output - ${group}`
            }
          },
          scales: {
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
    .catch(err => console.error('Error fetching data:', err));
}

// On Page Load - Default Group TL
document.addEventListener('DOMContentLoaded', function () {
  const groupSelect = document.getElementById('groupSelect');
  fetchAndRenderChart(groupSelect.value);

  groupSelect.addEventListener('change', function () {
    fetchAndRenderChart(this.value);
  });
});





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



let underRepairPie, awaitingCollectionPie;

function loadCommandWiseCharts(group) {
  fetch(`get_command_pie.php?group=${group}`)
    .then(res => res.json())
    .then(data => {
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
              backgroundColor: COMMAND_COLORS
            }]
          },
          options: {
            plugins: { legend: { position: 'bottom' } }
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
              backgroundColor: COMMAND_COLORS
            }]
          },
          options: {
            plugins: { legend: { position: 'bottom' } }
          }
        });
      }
    })
    .catch(err => console.error('🔥 Error loading command-wise pie charts:', err));
}

    


let repairChartInstance = null;

function fetchAndRenderRepairChart(group) {
  fetch(`equipment_data.php?group=${group}&year=${year}`)
    .then(res => res.json())
    .then(result => {
      if (repairChartInstance) repairChartInstance.destroy();

      const ctx = document.getElementById('repairChart').getContext('2d');
      repairChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['3–6 Months Under Repair'],
          datasets: [{
            label: 'Equipment Count',
            data: [result.count],
            backgroundColor: '#e67e22'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `Equipment Under Repair (3–6 Months) - ${group}`
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Equipment Count'
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
    .catch(err => console.error('Error fetching repair data:', err));
}

      
         
                          


// // ✅ DOMContentLoaded block — PLACE THIS AT END
window.addEventListener('DOMContentLoaded', () => {
  const defaultGroup = 'tl';
  fetchAndRenderChart(defaultGroup)
  fetchPieData(defaultGroup);
  loadCommandWiseCharts(defaultGroup);

  fetchAndRenderRepairChart(defaultGroup)

  document.getElementById('groupSelect')?.addEventListener('change', function () {
    const group = this.value;
    fetchAndRenderChart(group)
    fetchPieData(group);
    loadCommandWiseCharts(group);
      fetchAndRenderRepairChart(group);
  });
});
