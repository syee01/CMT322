import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../../cssFolder/admin/admin_dashboard.css'; // Make sure this path is correct
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Number of Cases',
      data: [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1
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

          caseTypeCounts[caseType] = (caseTypeCounts[caseType] || 0) + 1;

          return {
            id: doc.id,
            ...data,
            case_type: caseType,
            case_status: caseStatus
          };
        });

        console.log("casedata",casesData)
        setCases(casesData);
        setChartData({
          labels: Object.keys(caseTypeCounts),
          datasets: [{
            label: 'Number of Cases',
            data: Object.values(caseTypeCounts),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
          }]
        });
      }
    };

    fetchCases();
  }, [caseTypes, caseStatuses]);

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
        <div>
           {/* Insert Financial Overview Chart Here */}
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
          <Bar data={chartData} options={{ indexAxis: 'y' }} />
        </div>
      </div>
      <div className="case-status">
        <h2>Cases Status</h2>
        {/* Insert Case Status Chart Here */}
      </div>
    </div>
  </div>
);
};

export default AdminDashboard;