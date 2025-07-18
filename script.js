

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

  const links = document.querySelectorAll('.sidebar ul li a');
  links.forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add('active');
    }
  });


document.querySelectorAll('.sidebar ul li a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();

    const page = this.getAttribute('data-page');
    fetch(page)
      .then(res => res.text())
      .then(data => {
        document.getElementById('main-content').innerHTML = data;
      });

    // Remove active from all, add active to clicked
    document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
    this.parentElement.classList.add('active');
  });
});








//line chart

function fetchAndRenderChart(group ,year) {
fetch(`get_chart_data.php?group=${group}&year=${year}`)

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
            data:counts,
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

       function renderCustomLegend(containerId, labels, counts, colors) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const total = counts.reduce((a, b) => a + b, 0) || 1;

  container.innerHTML = labels.map((label, i) => `
    <div style="
      display: inline-flex;
      align-items: center;
      background: rgba(0,0,0,0.05);
      margin: 4px;
      padding: 15px;
      border-radius: 5px;
      font-size: 12px;
    ">
      <span style="
        width: 10px; 
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
      console.error(' Error loading status pie chart:', err);
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
            plugins:{
              legend:{display:false}
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
              backgroundColor: COMMAND_COLORS
            }]
          },
          options: {
            plugins: { legend: { display:false } }
          }
        });
      }
      
  // custom legend    
  function renderCustomLegend(containerId, labels, counts, colors) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const total = counts.reduce((a, b) => a + b, 0) || 1;

  container.innerHTML = labels.map((label, i) => `
    <div style="
      display: inline-flex;
      align-items: center;
      background: rgba(0,0,0,0.05);
      margin: 4px;
      padding: 15px;
      border-radius: 5px;
      font-size: 12px;
    ">
      <span style="
        width: 10px; 
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

renderCustomLegend('underRepairLegendBox', COMMAND_LABELS, underRepairCounts, COMMAND_COLORS);
renderCustomLegend('awaitingCollectionLegendBox', COMMAND_LABELS, awaitingCollectionCounts, COMMAND_COLORS);


    })
    .catch(err => console.error(' Error loading command-wise pie charts:', err));
}

  

   let repairAgeChart = null; 
   const REPAIRSTATUS_LABEL =  ['Under 3 Months', '3-6 Months', '6-12 Months', 'Over 1 Year'];  
   const REPAIRSTATUS_COLOR = ['#e67e22','#e67e22','#e67e22','#e67e22'];
  function loadRepairAgeChart(group) {
    fetch(`equipment_data.php?group=${group}`)
    .then(res => res.json())
    .then(data => {
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
              backgroundColor: REPAIRSTATUS_COLOR
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Equipment Count' },
                ticks:{
                  stepSize:1,
                  precision:0
                }
              }
            }
          }
        });

        //custom legend

        function renderCustomLegend(containerId, labels, counts, colors) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const total = counts.reduce((a, b) => a + b, 0) || 1;

  container.innerHTML = labels.map((label, i) => `
    <div style="
      display: inline-flex;
      align-items: center;
      background: rgba(0,0,0,0.05);
      margin: 4px;
      padding: 15px;
      border-radius: 5px;
      font-size: 12px;
    ">
      <span style="
        width: 10px; 
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

 renderCustomLegend('underRepairbarchart', REPAIRSTATUS_LABEL, data.counts,REPAIRSTATUS_COLOR);
      }
    })
    .catch(err => console.error(' Error loading repair age chart:', err));
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
  selectGroup('tl');  // ✅ Set default group on page load

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


function selectGroup(group) {
  const year = document.getElementById('yearSelect')?.value || new Date().getFullYear();

  // Set the dropdown value so both stay in sync
  const groupSelect = document.getElementById('groupSelect');
  if (groupSelect) groupSelect.value = group;
updateHeading(group, year);
  fetchAndRenderChart(group, year);
  fetchPieData(group);
  loadCommandWiseCharts(group);
  loadRepairAgeChart(group);
    document.querySelectorAll('.group-buttons button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.group-buttons button[onclick="selectGroup('${group}')"]`)?.classList.add('active');
}

// function selectGroup(group) {
//   const year = document.getElementById('yearSelect')?.value || new Date().getFullYear();
//   document.getElementById('groupSelect').value = group;

//   fetchAndRenderChart(group, year);
//   fetchPieData(group);
//   loadCommandWiseCharts(group);
//   loadRepairAgeChart(group);

//   // Button active state

// }


