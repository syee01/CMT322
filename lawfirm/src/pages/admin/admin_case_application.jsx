import React, { useEffect, useState } from 'react';
import '../../cssFolder/admin/admin_case_application.css';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, getDocs, query, where, collection, updateDoc } from 'firebase/firestore';

const AdminCaseApplication = () => {
    const { case_id } = useParams();  // Assuming case_id is from URL params
    const [collectionsData, setCollectionsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const caseName = 'case';
    const documentName = 'document';
    const dataNames = ['users', 'client'];
    const collectionNames = ['case_type', 'lawyer', 'case_status'];
    const USERID = 'XpO1g9i8hLTjVrOvm41jo5MXIY33';
    const [showModal, setShowModal] = useState(false);
    const [selectedLawyer, setSelectedLawyer] = useState('');
    const [showRejectionConfirm, setShowRejectionConfirm] = useState(false);


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

                for (const dataName of dataNames) {
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
        for (let i = 0; i < length; i++) {
            if (caseTypes[i].id === case_type_id) {
                return caseTypes[i].data.case_type_name
            }
        }
    }

    function getLawyerName(lawyer_id) {
        const lawyerList = collectionsData['lawyer'];
        const length = lawyerList.length;
        for (let i = 0; i < length; i++) {
            if (lawyerList[i].id === lawyer_id) {
                return lawyerList[i].data.name
            }
        }
    }

    function getCaseStatusName(case_status_id) {
        const caseStatus = collectionsData['case_status'];
        const length = caseStatus.length;
        for (let i = 0; i < length; i++) {
            if (caseStatus[i].id === case_status_id) {
                return caseStatus[i].data.case_status_name
            }
        }
    }

    function openURL(url) {
        window.open(url, '_blank');
    };

    const updateLawyerForCase = async () => {
        if (!selectedLawyer) {
            alert('Please select a lawyer before proceeding.');
            return;
        }
    
        // Fetch the ID of the 'In Progress' status
        const inProgressStatusId = collectionsData['case_status'].find(status => status.data.case_status_name === 'In Progress').id;
    
        const caseRef = doc(db, caseName, case_id);
    
        try {
            await updateDoc(caseRef, {
                lawyer: selectedLawyer, // this now contains the lawyer's ID
                case_status: inProgressStatusId // setting the case status to 'In Progress'
            });
            alert('The lawyer has been assigned and the case status has been updated to In Progress.');
            setShowModal(false); // close the modal
        } catch (error) {
            console.error("Error updating case: ", error);
            alert('There was an error updating the case.');
        }
    };
    

    const handleRejectCase = () => {
        setShowRejectionConfirm(true);
    };

    const confirmRejection = async () => {
        // Fetch the ID of the 'Rejected' status
        const rejectedStatusId = collectionsData['case_status'].find(status => status.data.case_status_name === 'Rejected').id;

        const caseRef = doc(db, caseName, case_id);

        try {
            await updateDoc(caseRef, {
                case_status: rejectedStatusId
            });
            alert('The case has been marked as Rejected.');
            setShowRejectionConfirm(false); // close the modal
        } catch (error) {
            console.error("Error updating case status: ", error);
            alert('There was an error updating the status of this case.');
        }
    };

    // Main component rendering
    return (
        <div className='admin_view_specific_rejected_case-page'>
            <div className='page-header'>CASE APPLICATION DETAILS</div>
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

                <div className='buttons-container'>
                    <button className='reject-button' onClick={handleRejectCase}>
                        Reject
                    </button>
                    <button className='accept-button' onClick={() => setShowModal(true)}>
                        Accept
                    </button>
                </div>


                {showModal && (
                    <div className='modal'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <span className='close' onClick={() => setShowModal(false)}>&times;</span>
                            </div>
                            <div className='modal-body'>
                                <p>Please assign a paralegal for this case</p>
                                <select
                                    value={selectedLawyer}
                                    onChange={(e) => setSelectedLawyer(e.target.value)}
                                    className='lawyer-dropdown'
                                >
                                    <option value="">Select a Lawyer</option>
                                    {collectionsData['lawyer'].map((lawyer) => (
                                        <option key={lawyer.id} value={lawyer.id}>
                                            {lawyer.data.name}
                                        </option>
                                    ))}
                                </select>

                            </div>
                            <div className='modal-footer'>
                            <button className='ok-button' onClick={updateLawyerForCase}>OK</button>
                            </div>
                        </div>
                    </div>
                )}

                {showRejectionConfirm && (
                    <div className='modal'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <span className='close' onClick={() => setShowRejectionConfirm(false)}>&times;</span>
                            </div>
                            <div className='modal-body'>
                                <p>Are you sure you want to reject this case?</p>
                            </div>
                            <div className='modal-footer'>
                                <button className='confirm-button' onClick={confirmRejection}>Confirm</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminCaseApplication;
