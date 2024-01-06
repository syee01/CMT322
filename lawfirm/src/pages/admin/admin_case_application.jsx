import React, { useEffect, useState } from 'react';
import '../../cssFolder/admin/admin_case_application.css';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, getDocs, query, where, collection, updateDoc } from 'firebase/firestore';
import * as cons from "../constant"
import * as util from "../utility"

const AdminCaseApplication = () => {
    const { case_id } = useParams();  // Assuming case_id is from URL params
    const [collectionsData, setCollectionsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedLawyer, setSelectedLawyer] = useState('');
    const [showRejectionConfirm, setShowRejectionConfirm] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = {};

                data[cons.caseCollectionName] = await util.getOneCase(case_id);
                const userId = data[cons.caseCollectionName].data.client;
                data[cons.usersCollectionName] = await util.getOneUserClient(cons.usersCollectionName, userId);
                data[cons.clientCollectionName] = await util.getOneUserClient(cons.clientCollectionName, userId);
                data[cons.documentCollectionName] = await util.getDocumentFromOneCase(case_id);
                data[cons.lawyerCollectionName] = await util.getLawyerFromUsers();
                data[cons.case_typeCollectionName] = await util.getCaseTypeStatus(cons.case_typeCollectionName);
                data[cons.case_statusCollectionName] = await util.getCaseTypeStatus(cons.case_statusCollectionName);
                
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
    
        const caseRef = doc(db, cons.caseCollectionName, case_id);
    
        try {
            await updateDoc(caseRef, {
                lawyer: selectedLawyer, // this now contains the lawyer's ID
                case_status: inProgressStatusId // setting the case status to 'In Progress'
            });
            alert('The lawyer has been assigned and the case status has been updated to In Progress.');
            setShowModal(false); // close the modal
            navigate(`/admin/ViewSpecificCase/${case_id}`);
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

        const caseRef = doc(db, cons.caseCollectionName, case_id);

        try {
            await updateDoc(caseRef, {
                case_status: rejectedStatusId
            });
            alert('The case has been marked as Rejected.');
            setShowRejectionConfirm(false); // close the modal
            navigate(`/admin/ViewRejectedCases/${case_id}`);
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
                                <div className='content-data-field'>{collectionsData[cons.usersCollectionName].data.fullname}</div>
                                <div className='content-data-field'>{collectionsData[cons.usersCollectionName].data.email}</div>
                                <div className='content-data-field'>{collectionsData[cons.usersCollectionName].data.phoneNumber}</div>
                            </div>
                        </div>
                        <div className='divider-right'>
                            <div className='inner-left-part'>
                                <div className='content-label-field'>Gender</div>
                                <div className='content-label-field'>IC Number</div>
                                <div className='content-label-field'>Date of Birth</div>
                            </div>
                            <div className='inner-right-part'>
                                <div className='content-data-field'>{collectionsData[cons.clientCollectionName].data.gender}</div>
                                <div className='content-data-field'>{collectionsData[cons.clientCollectionName].data.client_ic}</div>
                                <div className='content-data-field'>{collectionsData[cons.clientCollectionName].data.dob}</div>
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
                                <div className='content-data-field'>{collectionsData[cons.caseCollectionName].data.case_title}</div>
                                <div className='content-data-field'>{util.getCaseTypeName(collectionsData[cons.case_typeCollectionName], collectionsData[cons.caseCollectionName].data.case_type)}</div>
                                <div className='content-data-field'>{util.getCaseStatusName(collectionsData[cons.case_statusCollectionName], collectionsData[cons.caseCollectionName].data.case_status)}</div>
                            </div>
                        </div>
                        <div className='divider-right'>
                            <div className='inner-left-part'>
                                <div className='content-label-field'>Lawyer</div>
                                <div className='content-label-field'>Case Price</div>
                                <div className='content-label-field'>Submitted Date</div>
                            </div>
                            <div className='inner-right-part'>
                                <div className='content-data-field'>{util.getLawyerName(collectionsData[cons.lawyerCollectionName], collectionsData[cons.caseCollectionName].data.lawyer)}</div>
                                <div className='content-data-field'>{collectionsData[cons.caseCollectionName].data.case_price}</div>
                                <div className='content-data-field'>{collectionsData[cons.caseCollectionName].data.case_created_date.toDate().toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className='content-label-field'>
                        Case Description
                    </div>
                    <div className='content-frame'>
                        {collectionsData[cons.caseCollectionName].data.case_description}
                    </div>
                </div>

                <div>
                    <div className='content-label-field'>
                        Related Documents
                    </div>
                    <div className='content-frame'>
                        {collectionsData[cons.documentCollectionName]?.map((item) => (
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
                                    {collectionsData[cons.case_statusCollectionName].map((lawyer) => (
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
