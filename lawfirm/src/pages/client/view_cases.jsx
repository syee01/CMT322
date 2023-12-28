import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../cssFolder/client/view_cases.css';
import { storage, db } from '../../firebase';
import { doc, setDoc, collection, getDocs, updateDoc, query, where } from 'firebase/firestore';

const ViewCases = () => {
    const caseName = 'case';
    const collectionNames = ['case_type', 'lawyer', 'case_status'];
    const [collectionsData, setCollectionsData] = useState({});
    const clientField = 'client';
    const USERID = "XpO1g9i8hLTjVrOvm41jo5MXIY33";
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOptions = async () => {
            const data = {};
            const collectionRef = collection(db, caseName);
            try {
                const initialQuery = query(collectionRef, where(clientField, '==', USERID));
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
        navigate(`/ViewSpecificCase/${case_id}`)
    }

    return (
        <div className='view_cases-page'>
            <div className='header-section-2'>
                <div className='header-title-2'>
                    <h1>ALL CASES</h1>
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
                {collectionsData['case']?.map((item) => (
                    <React.Fragment key={item.id}>
                        <div className='cases-section'>
                            <div className='cases-row-content' onClick={() => directToCase(item.id)}>
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

export default ViewCases;