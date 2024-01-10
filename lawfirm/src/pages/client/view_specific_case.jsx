import React, { useEffect, useState } from 'react';
import '../../cssFolder/client/view_specific_case.css';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import * as cons from "../constant"
import * as util from "../utility"

const ViewSpecificCase = ({ userId }) => {
    const { case_id } = useParams();  // Assuming case_id is from URL params
    const [collectionsData, setCollectionsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [acceptConfirmation, setAcceptConfirmation] = useState(false);
    const [rejectConfirmation, setRejectConfirmation] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = {};
                data[cons.caseCollectionName] = await util.getOneCase(case_id);
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

    console.log(collectionsData)

    function displayWithCaseStatus () {
        const b = collectionsData[cons.caseCollectionName].data.case_status;
        if (b == "case_status_05"){
            return (
                <div className='buttons-container'>
                    <button className='reject-button' onClick={() => setRejectConfirmation(true)}>Reject</button>
                    <button className='accept-button' onClick={() => setAcceptConfirmation(true)}>Accept</button>
                </div>
            )
        }
        else if (b == "case_status_02"){
            return (
                <div>
                    <div className='rejected-status-container'>
                        Rejected
                    </div>
                </div>
            )
        }
    }

    const updateLawyerForCase = async () => {
        
        const inProgressStatusId = collectionsData['case_status'].find(status => status.data.case_status_name === 'In Progress').id;
    
        const caseRef = doc(db, cons.caseCollectionName, case_id);
    
        try {
            await updateDoc(caseRef, {
                case_status: inProgressStatusId
            });
            setAcceptConfirmation(false);
            window.location.reload()
        } catch (error) {
            console.error("Error updating case: ", error);
            alert('There was an error updating the case.');
        }
    };

    const confirmRejection = async () => {
        const rejectedStatusId = collectionsData['case_status'].find(status => status.data.case_status_name === 'Rejected').id;

        const caseRef = doc(db, cons.caseCollectionName, case_id);

        try {
            await updateDoc(caseRef, {
                case_status: rejectedStatusId
            });
            setRejectConfirmation(false);
            window.location.reload()
        } catch (error) {
            console.error("Error updating case status: ", error);
            alert('There was an error updating the status of this case.');
        }
    };

    function openURL(url){
        window.open(url, '_blank');
    };

    return (
        <div className='view_specific_case-page'>
            <div className='header-section-3'>
                <div className='header-title-3'>
                    <div>CASE DETAILS</div>
                </div>
            </div>
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
                    {collectionsData['case'].data.case_description}
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

                <div>
                    <div className='content-label-field'>
                        Important Dates
                    </div>
                    <div className='content-frame'>
                        <div className='date-section-column'>
                            <div className='date-section-row'>
                                <div className='date-header'>Date and Time</div>
                                <div className='date-header'>Event</div>
                                <div className='date-header'>Location</div>
                                <div className='date-header'>Status</div>
                            </div>
                            <div className='date-section-row'>
                                <div className='date-content-value'>Data</div>
                                <div className='date-content-value'>Data</div>
                                <div className='date-content-value'>Data</div>
                                <div className='date-content-value'>Data</div>
                            </div>
                        </div>
                    </div>
                </div>

                {displayWithCaseStatus()}

                {acceptConfirmation && (
                    <div className='modal'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <span className='close' onClick={() => setAcceptConfirmation(false)}>&times;</span>
                            </div>
                            <div className='modal-body'>
                                <p>
                                    {util.getLawyerName(collectionsData[cons.lawyerCollectionName], collectionsData[cons.caseCollectionName].data.lawyer)} will be the lawyer in charge of your case.
                                    </p>
                            </div>
                            <div className='modal-footer'>
                                <button className='ok-button' onClick={updateLawyerForCase}>OK</button>
                            </div>
                        </div>
                    </div>
                )}

                {rejectConfirmation && (
                    <div className='modal'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <span className='close' onClick={() => setRejectConfirmation(false)}>&times;</span>
                            </div>
                            <div className='modal-body'>
                                <p>Are you sure you want to reject this case with the lawyer?</p>
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

export default ViewSpecificCase;
