import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../cssFolder/client/view_cases.css';
import * as cons from "../constant"
import * as util from "../utility"

const ViewCases = ({ userId }) => {
    const caseCollectionName = 'case';
    const [collectionsData, setCollectionsData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOptions = async () => {
            const data = {};
            data[cons.caseCollectionName] = await util.getAllCasesUnderOneClient(userId);
            data[cons.lawyerCollectionName] = await util.getLawyerFromUsers();
            data[cons.case_typeCollectionName] = await util.getCaseTypeStatus(cons.case_typeCollectionName);
            data[cons.case_statusCollectionName] = await util.getCaseTypeStatus(cons.case_statusCollectionName);

            setCollectionsData(data);
            setIsLoading(false);
        }
        fetchOptions();

    }, []);

    console.log("CollectionData: ",collectionsData)

    function directToCase(case_id) {
        navigate(`/ViewSpecificCase/${case_id}`)
    }

    if (isLoading) {
        return <div></div>;
    }

    return (
        <div className='view_cases-page'>
            <div className='header-section-2'>
                <div className='header-title-2'>
                    <div>ALL CASES</div>
                </div>
            </div>
            <div className='section-container'>
                <div className='cases-section'>
                    <div className='cases-header'>Title</div>
                    <div className='cases-header'>Type</div>
                    <div className='cases-header'>Lawyer</div>
                    <div className='cases-header'>Status</div>
                </div>
                <hr className='line' color='black'/>
                {collectionsData[caseCollectionName]?.map((item) => (
                    <React.Fragment key={item.id}>
                        <div className='cases-section'>
                            <div className='cases-row-content' onClick={() => directToCase(item.id)}>
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

export default ViewCases;