import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../cssFolder/admin/admin_view_all_cases.css';
import { db } from '../../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

const AdminViewAllCases = () => {
    const caseName = 'case';
    const collectionNames = ['case_type', 'lawyer', 'case_status'];
    const [collectionsData, setCollectionsData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOptions = async () => {
            const data = {};
            const collectionRef = collection(db, caseName);
            try {
                const initialQuery = query(collectionRef);
                const querySnapshot = await getDocs(initialQuery);
                data[caseName] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    data: doc.data(),
                }));
            } catch (error) {
                console.log("Error: ", error);
            };

            for (const collectionName of collectionNames) {
                const collectionRef = collection(db, collectionName);
                try {
                    const query = await getDocs(collectionRef);
                    data[collectionName] = query.docs.map((doc) => ({
                        id: doc.id,
                        data: doc.data()
                    }))
                } catch (error) {
                    console.log('Error: ', error);
                }
            };

            setCollectionsData(data);
        }
        console.log(collectionsData)
        fetchOptions();

    }, []);

    function getCaseTypeName(case_type_id) {
        const caseTypes = collectionsData['case_type'];
        const length = caseTypes.length;
        for (let i=0; i<length; i++){
            if (caseTypes[i].id === case_type_id){
                return caseTypes[i].data.case_type_name
            }
        }
    }

    function getLawyerName(lawyer_id) {
        const lawyerList = collectionsData['lawyer'];
        const length = lawyerList.length;
        for (let i=0; i<length; i++){
            if (lawyerList[i].id === lawyer_id){
                return lawyerList[i].data.name
            }
        }
    }

    function getCaseStatusName(case_status_id) {
        const caseStatus = collectionsData['case_status'];
        const length = caseStatus.length;
        for (let i=0; i<length; i++){
            if (caseStatus[i].id === case_status_id){
                return caseStatus[i].data.case_status_name
            }
        }
    }

    function directToCase(case_id) {
        navigate(`/admin/ViewRejectedCases/${case_id}`)
    }

    // Based on the status name, navigate to the appropriate page
    function directToCase(case_id, case_status_id) {
        const statusName = getCaseStatusName(case_status_id);
        if (statusName === 'Pending') {
            navigate(`/admin/ViewCaseApplication/${case_id}`);
        } else if (statusName === 'Rejected') {
            navigate(`/admin/ViewRejectedCases/${case_id}`)
        } else if (statusName === 'Finished') {
            // navigate(`/admin/ViewRejectedCases/${case_id}`)
            //view report
        }else {
            // in progress
            navigate(`/ViewSpecificCase/${case_id}`);
        }
    }
    

    return (
        <div className='admin_view_all_cases-page'>
            <div className='page-header'>ALL CASES</div>
            <div className='admin-section-container'>
                <div className='cases-section'>
                    <div className='cases-header'>Title</div>
                    <div className='cases-header'>Type</div>
                    <div className='cases-header'>Lawyer</div>
                    <div className='cases-header'>Status</div>
                </div>
                <hr className='line' color='black'/>
                {collectionsData['case']?.map((item) => (
                    <React.Fragment key={item.id}>
                    <div className='cases-section'>
                        <div 
                            className='cases-row-content-title' 
                            onClick={() => directToCase(item.id, item.data.case_status)}
                        >
                            {item.data.case_title}
                        </div>
                        <div className='cases-row-content'>
                            {getCaseTypeName(item.data.case_type)}
                        </div> 
                        <div className='cases-row-content'>
                            {getLawyerName(item.data.lawyer)}
                        </div>
                        <div className='cases-row-content'>
                            {getCaseStatusName(item.data.case_status)}
                        </div>
                    </div>
                </React.Fragment>
                ))}
            </div>
        </div>
    );
}

export default AdminViewAllCases;