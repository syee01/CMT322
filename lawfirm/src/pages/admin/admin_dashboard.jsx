import React, { useEffect, useState } from 'react';
import { Bar, Pie , Line} from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, BarElement,PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../../cssFolder/admin/admin_dashboard.css'; 
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, ArcElement, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  
  const [financialChartData, setFinancialChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Total Case Price',
      data: [],
      fill: false,
      borderColor: 'rgb(57, 62, 104)',
      tension: 0.1
    }]
  });
  

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Number of Cases',
      data: [],
      backgroundColor: [
        'rgba(116,164,178, 0.2)',
        'rgba(246,202,229, 0.2)',
        'rgba(254,189,89, 0.2)',
        'rgba(166,166,166, 0.2)'
      ],
      borderColor: [
        'rgba(116,164,178, 1)',
        'rgba(246,202,229, 1)',
        'rgba(254,189,89, 1)',
        'rgba(166,166,166, 1)'
      ],
      borderWidth: 1
    }]
  });

  const [inProgressChartData, setInProgressChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverOffset: 4
    }]
  });

  const [finishedChartData, setFinishedChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverOffset: 4
    }]
  });

  const [cases, setCases] = useState([]);
  const [caseTypes, setCaseTypes] = useState({});
  const [caseStatuses, setCaseStatuses] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTypesAndStatuses = async () => {
      const typeSnapshot = await getDocs(collection(db, 'case_type'));
      const statusSnapshot = await getDocs(collection(db, 'case_status'));
      const types = {}, statuses = {};

      typeSnapshot.forEach(doc => {
        types[doc.id] = doc.data().case_type_name;
      });

      statusSnapshot.forEach(doc => {
        statuses[doc.id] = doc.data().case_status_name;
      });

      setCaseTypes(types);
      setCaseStatuses(statuses);
    };

    fetchTypesAndStatuses();
  }, []);

  useEffect(() => {
    const fetchCases = async () => {
      if (Object.keys(caseTypes).length && Object.keys(caseStatuses).length) {
        const caseSnapshot = await getDocs(collection(db, 'case'));
        let caseTypeCounts = {};

        const casesData = caseSnapshot.docs.map(doc => {
          const data = doc.data();
          const caseType = caseTypes[data.case_type] || 'Unknown';
          const caseStatus = caseStatuses[data.case_status] || 'Unknown';
       
        if (caseStatus === 'In Progress' || caseStatus === 'Finished') {
          caseTypeCounts[caseType] = (caseTypeCounts[caseType] || 0) + 1;
        }

          return {
            id: doc.id,
            ...data,
            case_type: caseType,
            case_status: caseStatus,
      
          };
        });

        console.log("casedata", casesData)
        setCases(casesData);
        setChartData({
          labels: Object.keys(caseTypeCounts),
          datasets: [{
            label: 'Number of Cases',
            data: Object.values(caseTypeCounts),
            backgroundColor: [
              'rgba(116,164,178, 0.2)',
              'rgba(246,202,229, 0.2)',
              'rgba(254,189,89, 0.2)',
              'rgba(166,166,166, 0.2)'
            ],
            borderColor: [
              'rgba(116,164,178, 1)',
              'rgba(246,202,229, 1)',
              'rgba(254,189,89, 1)',
              'rgba(166,166,166, 1)'
            ],
            borderWidth: 1
          }]
        });
      }
    };

    fetchCases();
  }, [caseTypes, caseStatuses]);

  useEffect(() => {
    const fetchCasesStatusData = async () => {
      // Fetch lawyer names based on IDs
      const lawyerSnapshot = await getDocs(collection(db, 'lawyer'));
      const lawyerNames = {};
      lawyerSnapshot.forEach(doc => {
        lawyerNames[doc.id] = doc.data().name; // Assuming 'name' is the field for the lawyer's name
      });
  
      // Assuming `cases` is already populated with the required `lawyer` and `case_status` fields
      const inProgress = cases.filter(c => c.case_status === 'In Progress');
      const finished = cases.filter(c => c.case_status === 'Finished');
  
      const getChartData = (caseArray) => {
        const counts = {}; // { lawyerName: count }
        caseArray.forEach(c => {
          const lawyerName = lawyerNames[c.lawyer] || 'Unknown'; // Map ID to name, fallback to 'Unknown'
          counts[lawyerName] = (counts[lawyerName] || 0) + 1;
        });
  
        return {
          labels: Object.keys(counts),
          datasets: [{
            data: Object.values(counts),
            backgroundColor: Object.keys(counts).map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`),
            hoverOffset: 4
          }]
        };
      };
  
      setInProgressChartData(getChartData(inProgress));
      setFinishedChartData(getChartData(finished));
    };
  
    if (cases.length > 0) {
      fetchCasesStatusData();
    }
  }, [cases]);
  
  useEffect(() => {
    const fetchFinancialData = async () => {
      // Filter out finished cases with a valid date and price
      const finishedCases = cases.filter(c => c.case_status === 'Finished' && c.case_finished_date && c.case_price);
  
      // Group and sum up the case prices by month and year
      const monthlyTotals = finishedCases.reduce((acc, c) => {
        const date = c.case_finished_date.toDate();
        const year = date.getFullYear();
        const month = date.getMonth();
        const monthYear = `${year}-${month}`;
  
        acc[monthYear] = (acc[monthYear] || 0) + c.case_price;
        return acc;
      }, {});
  
      // Sort by year and month
      const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => new Date(a.split('-')[0], a.split('-')[1]) - new Date(b.split('-')[0], b.split('-')[1]));
  
      // Create labels in the format "Month Year" (e.g., "January 2024")
      const labels = sortedMonths.map(monthYear => {
        const [year, month] = monthYear.split('-');
        return `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
      });
  
      // Map sorted keys to their values for the data points
      const data = sortedMonths.map(monthYear => monthlyTotals[monthYear]);
  
      setFinancialChartData({
        labels,
        datasets: [{
          label: 'Total Case Price',
          data,
          fill: false,
          borderColor: 'rgb(57, 62, 104)',
          tension: 0.1
        }]
      });
    };
  
    if (cases.length > 0) {
      fetchFinancialData();
    }
  }, [cases]);
  
  function directToViewAllCase() {
    navigate(`/admin/ViewAllCases`)
  }

  return (
    <div className="admin-dashboard">
      <div className='page-header'>
        DASHBOARD
      </div>

      <div className="dashboard-row">
        <div className="financial-overview">
          <h2>Financial Overview</h2>
          <div className="line-chart-container" >
            <Line data={financialChartData} />
          </div>
        </div>
        <div className="case-assignment">
          <h2>Case Assignment</h2>
          <div className="case-table">
            <div className="table-header">
              <div>Case Title</div>
              <div>Case Type</div>
     
              <div>Status</div>
            </div>
            <div className="table-body">
              {cases.map(caseItem => (
                <div key={caseItem.id} className="table-row">
                  <div>{caseItem.case_title}</div>
                  <div>{caseItem.case_type}</div>
                
                  <div>{caseItem.case_status}</div>
                </div>
              ))}
            </div>
          </div>
         
              <button className="view-all-button" onClick={() => directToViewAllCase()}>View all</button>
          
        </div>
      </div>

      <div className="dashboard-row">
        <div className="case-types-chart">
          <h2>Case Types Chart</h2>
          <div className="chart-container">
            <Bar data={chartData} options={{
              indexAxis: 'y', scales: {
                x: {
                  type: 'linear',
                  ticks: {
                    stepSize: 1,
                    callback: function (value) {
                      if (value % 1 === 0) {
                        return value;
                      }
                    }
                  },
                }
              }
            }
            }
            />
          </div>
        </div>
        <div className="case-status-charts">
          <h2>Cases Status</h2>
          <div className="pie-charts-container">
            <div className="pie-chart-container">
              <h3>In Progress</h3>
              <Pie data={inProgressChartData} />
            </div>
            <div className="pie-chart-container">
              <h3>Finished</h3>
              <Pie data={finishedChartData} />
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default AdminDashboard;