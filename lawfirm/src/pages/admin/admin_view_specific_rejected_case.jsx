import React, { useEffect, useState } from 'react';
import '../../cssFolder/admin/admin_view_specific_rejected_cases.css';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, getDocs, query, where, collection } from 'firebase/firestore';

const AdminViewSpecificRejectedCase = () => {
    const { case_id } = useParams();  
    const [collectionsData, setCollectionsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const caseName = 'case';
    const documentName = 'document';
    const dataNames = ['users', 'client'];
    const collectionNames = ['case_type', 'lawyer', 'case_status'];
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = {};
                try {
                    const caseRef = doc(db, caseName, case_id)
                    const querySnapshot = await getDoc(caseRef)
                    data[caseName] = {
                        id: querySnapshot.id,
                        data: querySnapshot.data(),
                    };
                } catch (error) {
                    console.log("Error: ", error);
                }
                const user_id = data[caseName].data.client;
                console.log(user_id);

                for (const dataName of dataNames){
                    try {
                        const dataRef = doc(db, dataName, user_id);
                        const querySnapshot = await getDoc(dataRef);
                        data[dataName] = {
                            id: querySnapshot.id,
                            data: querySnapshot.data(),
                        };
                    } catch (error) {
                        console.log('Error: ', error);
                    }
                }

                const collectionRef = collection(db, documentName);
                try {
                    const initialQuery = query(collectionRef, where('case_id', '==', case_id));
                    const querySnapshot = await getDocs(initialQuery);
                    data[documentName] = querySnapshot.docs.map((doc) => ({
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
            } catch (error) {
                setError(error);
                console.error("Error fetching data: ", error);
            }
            setIsLoading(false);
        };

        fetchData();
    }, [case_id]); // Dependency array ensures useEffect runs when case_id changes

    if (isLoading) {
        return <div></div>;
    }

    if (error) {
        return <div>Error loading data: {error.message}</div>;
    }

    if (!collectionsData) {
        return <div>No case data available.</div>;
    }

    // Helper functions (e.g., getCaseTypeName) go here
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

    function openURL(url){
        window.open(url, '_blank');
    };
    // Main component rendering
    return (
        <div className='admin_view_specific_rejected_case-page'>
            <div className='page-header'>REJECTED CASE DETAILS</div>
            <div className='section-container'>
                <div className='form-header'>
                    {collectionsData['case'].data.case_title}
                </div>

                <div>
                    <div className='section-small-header'>
                        Personal Information
                    </div>
                    <div className='section-divider'>
                        <div className='divider-left'>
                            <div className='inner-left-part'>
                                <div className='content-label-field'>Case Owner</div>
                                <div className='content-label-field'>Email Address</div>
                                <div className='content-label-field'>Contact Number</div>
                            </div>
                            <div className='inner-right-part'>
                                <div className='content-data-field'>{collectionsData['users'].data.fullname}</div>
                                <div className='content-data-field'>{collectionsData['client'].data.email}</div>
                                <div className='content-data-field'>{collectionsData['client'].data.contact}</div>
                            </div>
                        </div>
                        <div className='divider-right'>
                            <div className='inner-left-part'>
                                <div className='content-label-field'>Gender</div>
                                <div className='content-label-field'>IC Number</div>
                                <div className='content-label-field'>Date of Birth</div>
                            </div>
                            <div className='inner-right-part'>
                                <div className='content-data-field'>{collectionsData['client'].data.gender}</div>
                                <div className='content-data-field'>{collectionsData['client'].data.client_ic}</div>
                                <div className='content-data-field'>{collectionsData['client'].data.dob}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className='section-small-header'>
                        Case Information
                    </div>
                    <div className='section-divider'>
                        <div className='divider-left'>
                            <div className='inner-left-part'>
                                <div className='content-label-field'>Case Title</div>
                                <div className='content-label-field'>Case Type</div>
                                <div className='content-label-field'>Case Status</div>
                            </div>
                            <div className='inner-right-part'>
                                <div className='content-data-field'>{collectionsData['case'].data.case_title}</div>
                                <div className='content-data-field'>{getCaseTypeName(collectionsData['case'].data.case_type)}</div>
                                <div className='content-data-field'>{getCaseStatusName(collectionsData['case'].data.case_status)}</div>
                            </div>
                        </div>
                        <div className='divider-right'>
                            <div className='inner-left-part'>
                                <div className='content-label-field'>Lawyer</div>
                                <div className='content-label-field'>Case Price</div>
                                <div className='content-label-field'>Event Date</div>
                            </div>
                            <div className='inner-right-part'>
                                <div className='content-data-field'>{getLawyerName(collectionsData['case'].data.lawyer)}</div>
                                <div className='content-data-field'>{collectionsData['case'].data.lawyer}</div>
                                <div className='content-data-field'>{collectionsData['case'].data.event_date}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className='content-label-field'>
                        Case Description
                    </div>
                    <div className='content-frame'>
                    {collectionsData['case'].data.case_description}
                    </div>
                </div>

                <div>
                    <div className='content-label-field'>
                        Related Documents
                    </div>
                    <div className='content-frame'>
                        {collectionsData['document']?.map((item) => (
                            <li onClick={() => openURL(item.data.url)}>{item.data.document_name}</li>
                        ))}
                    </div>
                </div>

                <div className='rejected-status-container'>
                    Rejected
                </div>
            </div>
        </div>
    );
}

export default AdminViewSpecificRejectedCase;
