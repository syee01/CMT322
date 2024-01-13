import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../cssFolder/lawyer/lawyer_view_cases.css';
import * as cons from "../constant"
import * as util from "../utility"

const LawyerViewCases = ({ userId }) => {
    const caseCollectionName = 'case';
    const [collectionsData, setCollectionsData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOptions = async () => {
            const data = {};
            data[cons.caseCollectionName] = await util.getAllCasesUnderOneLawyer(userId);
            data[cons.clientCollectionName] = await util.getClientFromUsers();
            data[cons.case_typeCollectionName] = await util.getCaseTypeStatus(cons.case_typeCollectionName);
            data[cons.case_statusCollectionName] = await util.getCaseTypeStatus(cons.case_statusCollectionName);

            setCollectionsData(data);
            setIsLoading(false);
        }
        fetchOptions();

    }, []);

    function checkNumberOfCases() {
        const numberCases = collectionsData[cons.caseCollectionName].length;
        if (numberCases == 0) {
            return (
                <div className='lawyer-no-data-found'>
                    No Data Found
                </div>
            )
        }
        else{
            return (
                <div>
                </div>
            )
        }
    }

    console.log("CollectionData: ",collectionsData)

    function directToCase(case_id) {
        navigate(`/LawyerViewSpecificCase/${case_id}`)
    }

    if (isLoading) {
        return <div></div>;
    }

    return (
        <div className='lawyer-view_cases-page'>
            <div className='lawyer-header-section-2'>
                <div className='lawyer-header-title-2'>
                    <div>ALL CASES</div>
                </div>
            </div>
            <div className='lawyer-section-container'>
                <div className='lawyer-cases-section'>
                    <div className='lawyer-cases-header'>Title</div>
                    <div className='lawyer-cases-header-small'>Type</div>
                    <div className='lawyer-cases-header-small'>Lawyer</div>
                    <div className='lawyer-cases-header-small'>Status</div>
                </div>

                {checkNumberOfCases()}
                
                {collectionsData[caseCollectionName]?.map((item, index) => (
                    <React.Fragment key={item.id}>
                        <div className={`client-cases-section-${index % 2 === 0 ? 'even': 'odd'}`}>
                            <div className='lawyer-cases-row-content-title' onClick={() => directToCase(item.id)}>
                                {item.data.case_title}
                            </div>
                            <div className='lawyer-cases-row-content-small'>
                                {util.getCaseTypeName(collectionsData[cons.case_typeCollectionName], item.data.case_type)}
                            </div> 
                            <div className='lawyer-cases-row-content-small'>
                                {util.getLawyerName(collectionsData[cons.clientCollectionName], item.data.client)}
                            </div>
                            <div className='lawyer-cases-row-content-small'>
                                {util.getCaseStatusName(collectionsData[cons.case_statusCollectionName], item.data.case_status)}
                            </div>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

export default LawyerViewCases;