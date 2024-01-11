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
        <div className='client-view_cases-page'>
            <div className='client-header-section-2'>
                <div className='client-header-title-2'>
                    <div>ALL CASES</div>
                </div>
            </div>
            <div className='client-section-container'>
                <div className='client-cases-section'>
                    <div className='client-cases-header'>Title</div>
                    <div className='client-cases-header-small'>Type</div>
                    <div className='client-cases-header-small'>Lawyer</div>
                    <div className='client-cases-header-small'>Status</div>
                </div>
                {/* <hr className='client-line'/> */}
                {collectionsData[caseCollectionName]?.map((item, index) => (
                    <React.Fragment key={item.id}>
                        <div className={`client-cases-section-${index % 2 === 0 ? 'even': 'odd'}`}>
                            <div className='client-cases-row-content-title' onClick={() => directToCase(item.id)}>
                                {item.data.case_title}
                            </div>
                            <div className='client-cases-row-content-small'>
                                {util.getCaseTypeName(collectionsData[cons.case_typeCollectionName], item.data.case_type)}
                            </div> 
                            <div className='client-cases-row-content-small'>
                                {util.getLawyerName(collectionsData[cons.lawyerCollectionName], item.data.lawyer)}
                            </div>
                            <div className='client-cases-row-content-small'>
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