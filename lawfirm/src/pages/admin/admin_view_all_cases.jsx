import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../cssFolder/admin/admin_view_all_cases.css';
import * as cons from "../constant"
import * as util from "../utility"

const AdminViewAllCases = () => {
    const [collectionsData, setCollectionsData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOptions = async () => {
            const data = {};
            
            data[cons.caseCollectionName] = await util.getAllCases();
            data[cons.lawyerCollectionName] = await util.getLawyerFromUsers();
            data[cons.case_typeCollectionName] = await util.getCaseTypeStatus(cons.case_typeCollectionName);
            data[cons.case_statusCollectionName] = await util.getCaseTypeStatus(cons.case_statusCollectionName);

            setCollectionsData(data);
        }
        console.log(collectionsData)
        fetchOptions();

    }, []);

    function directToCase(case_id) {
        navigate(`/admin/ViewRejectedCases/${case_id}`)
    }

    // Based on the status name, navigate to the appropriate page
    function directToCase(case_id, case_status_id) {
        if (case_status_id === collectionsData[cons.case_statusCollectionName][0].id) {
            navigate(`/admin/ViewCaseApplication/${case_id}`);
        } else if (case_status_id === collectionsData[cons.case_statusCollectionName][1].id) {
            navigate(`/admin/ViewRejectedCases/${case_id}`)
        } else if (case_status_id === collectionsData[cons.case_statusCollectionName][3].id) {
            // navigate(`/admin/ViewRejectedCases/${case_id}`)
            //view report
        }else {
            // in progress
            navigate(`/admin/ViewSpecificCase/${case_id}`);
        }
    }
    

    return (
        <div className='admin_view_all_cases-page'>
            <div className='page-header'>ALL CASES</div>
            <div className='admin-section-container'>
                <div className='cases-section'>
                    <div className='cases-header'>Title</div>
                    <div className='cases-header-small'>Type</div>
                    <div className='cases-header-small'>Lawyer</div>
                    <div className='cases-header-small'>Status</div>
                </div>
                {collectionsData[cons.caseCollectionName]?.map((item, index) => (
                    <React.Fragment key={item.id}>
                    <div className={`cases-section-${index % 2 === 0 ? 'even': 'odd'}`}>
                        <div 
                            className='cases-row-content-title' 
                            onClick={() => directToCase(item.id, item.data.case_status)}
                        >
                            {item.data.case_title}
                        </div>
                        <div className='cases-row-content'>
                            {util.getCaseTypeName(collectionsData[cons.case_typeCollectionName], item.data.case_type)}
                        </div> 
                        <div className='cases-row-content'>
                            {util.getLawyerName(collectionsData[cons.lawyerCollectionName], item.data.lawyer)}
                        </div>
                        <div className='cases-row-content'>
                            {util.getCaseStatusName(collectionsData[cons.case_statusCollectionName], item.data.case_status)}
                        </div>
                    </div>
                </React.Fragment>
                ))}
            </div>
        </div>
    );
}

export default AdminViewAllCases;