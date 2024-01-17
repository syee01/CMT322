import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../cssFolder/client/view_specific_case.css';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import * as cons from "../constant"
import * as util from "../utility"
import Modal from 'react-modal';


const ViewSpecificCase = ({ userId }) => {
    const { case_id } = useParams();  // Assuming case_id is from URL params
    const [collectionsData, setCollectionsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [acceptConfirmation, setAcceptConfirmation] = useState(false);
    const [rejectConfirmation, setRejectConfirmation] = useState(false);
    const navigate = useNavigate();

    const [meetingID, setMeetingID] = useState(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState({
        meeting:{
            data:{
                event: '',
                date: '',
                case: '',
                description: '',
                location: '',
                status: ''
            }
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = {};
                data[cons.caseCollectionName] = await util.getOneCase(case_id);
                data[cons.usersCollectionName] = await util.getOneUserClient(cons.usersCollectionName, userId);
                if (data[cons.usersCollectionName].data.role !== "client"){
                    alert("This pages can only be visited by client. Redirecting to Home Page");
                    navigate("/home");
                }
                data[cons.clientCollectionName] = await util.getOneUserClient(cons.clientCollectionName, userId);
                data[cons.documentCollectionName] = await util.getDocumentFromOneCase(case_id);
                data[cons.lawyerCollectionName] = await util.getLawyerFromUsers();
                data[cons.case_typeCollectionName] = await util.getCaseTypeStatus(cons.case_typeCollectionName);
                data[cons.case_statusCollectionName] = await util.getCaseTypeStatus(cons.case_statusCollectionName);
                data[cons.meetingCollectionName] = await util.getAllMeetingsUnderOneCase(case_id);
                data[cons.case_typeCollectionName] = await util.getCaseTypeStatus(cons.case_typeCollectionName);
                data[cons.case_statusCollectionName] = await util.getCaseTypeStatus(cons.case_statusCollectionName);
                data[cons.meeting_locationCollectionName] = await util.getCaseTypeStatus(cons.meeting_locationCollectionName);
                data[cons.meeting_statusCollectionName] = await util.getCaseTypeStatus(cons.meeting_statusCollectionName);

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
        const cur_case_status = collectionsData[cons.caseCollectionName].data.case_status;
        const pendingAcceptID = collectionsData['case_status'].find(status => status.data.case_status_name === 'Pending Accept').id;
        const rejectID = collectionsData['case_status'].find(status => status.data.case_status_name === 'Rejected').id;
        if (cur_case_status == pendingAcceptID){
            return (
                <div className='client-buttons-container'>
                    <button className='client-reject-button' onClick={() => setRejectConfirmation(true)}>Reject</button>
                    <button className='client-accept-button' onClick={() => setAcceptConfirmation(true)}>Accept</button>
                </div>
            )
        }
        else if (cur_case_status == rejectID){
            return (
                <div>
                    <div className='client-rejected-status-container'>
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

    const openInfoModal = async(meeting_id) => {
        try {
            console.log("HI", meeting_id)
            const data = {};
            data[cons.meetingCollectionName] = await util.getOneMeeting(meeting_id);
            collectionsData['meeting_document'] = await util.getDocumentFromOneMeeting(meeting_id);

            setSelectedMeeting(data);
            setMeetingID(meeting_id);
            setIsInfoModalOpen(true);

        } catch (error) {
            console.error('Error retrieving specific meeting:', error);
        }
    };

    const closeInfoModal = () => {
        collectionsData['meeting_document'] = [];
        setIsInfoModalOpen(false);
        navigate(`/ViewSpecificCase/${case_id}`)
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
                            {collectionsData[cons.meetingCollectionName]?.map((item) => (
                                <React.Fragment key={item.id}>
                                    <div className='date-section-row'>
                                        <div className='lawyer-meetings-row-content-small'>
                                            {item.data.date}
                                        </div>
                                        <div className='lawyer-meetings-row-content-title' onClick={() => openInfoModal(item.id)}>
                                            {item.data.event}
                                        </div> 
                                        <div className='lawyer-meetings-row-content-small'>
                                            {util.getLocationName(collectionsData[cons.meeting_locationCollectionName], item.data.location)}
                                        </div>
                                        <div className='lawyer-meetings-row-content-small'>
                                            {util.getStatusName(collectionsData[cons.meeting_statusCollectionName], item.data.status)}
                                        </div>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Info Modal */}
                <Modal
                    isOpen={isInfoModalOpen}
                    onRequestClose={closeInfoModal}
                    contentLabel="Info Modal"
                >
                    <div></div>
                    <button class="move-right" onClick={closeInfoModal}>Close</button>
                    <div>
                        <div className='modal-section-small-header'>
                            Meeting Information
                        </div>
                        <div className='section-divider'>
                            <div className='divider-left'>
                                <div className='inner-left-part'>
                                    <div className='content-label-field'>Event</div>
                                    <div className='content-label-field'>Date</div>
                                </div>
                                <div className='inner-right-part'>
                                    <div className='content-data-field'>{selectedMeeting[cons.meetingCollectionName].data.event}</div>
                                    <div className='content-data-field'>{selectedMeeting[cons.meetingCollectionName].data.date}</div>
                                </div>
                            </div>
                            <div className='divider-right'>
                                <div className='inner-left-part'>
                                    <div className='content-label-field'>Status</div>
                                    <div className='content-label-field'>Location</div>
                                </div>
                                <div className='inner-right-part'>
                                    <div className='content-data-field'>{util.getStatusName(collectionsData[cons.meeting_statusCollectionName], selectedMeeting[cons.meetingCollectionName].data.status)}</div>
                                    <div className='content-data-field'>{util.getLocationName(collectionsData[cons.meeting_locationCollectionName], selectedMeeting[cons.meetingCollectionName].data.location)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className='content-label-field'>
                            Description
                        </div>
                        <div className='content-frame'>
                        {selectedMeeting[cons.meetingCollectionName].data.description}
                        </div>
                    </div>

                    <div>
                        <div className='content-label-field'>
                            Related Documents
                        </div>
                        <div className='content-frame'>
                            {collectionsData['meeting_document']?.map((item) => (
                                <li key={item.id} onClick={() => openURL(item.data.url)}>{item.data.document_name}</li>
                            ))}
                        </div>
                    </div>
                                     
                </Modal>

                {displayWithCaseStatus()}

                {acceptConfirmation && (
                    <div className='client-modal'>
                        <div className='client-modal-content'>
                            <div className='client-modal-header'>
                                <span className='client-close' onClick={() => setAcceptConfirmation(false)}>&times;</span>
                            </div>
                            <div className='client-modal-body'>
                                <p>
                                    {util.getLawyerName(collectionsData[cons.lawyerCollectionName], collectionsData[cons.caseCollectionName].data.lawyer)} will be the lawyer in charge of your case.
                                    </p>
                            </div>
                            <div className='client-modal-footer'>
                                <button className='client-ok-button' onClick={updateLawyerForCase}>OK</button>
                            </div>
                        </div>
                    </div>
                )}

                {rejectConfirmation && (
                    <div className='client-modal'>
                        <div className='client-modal-content'>
                            <div className='client-modal-header'>
                                <span className='client-close' onClick={() => setRejectConfirmation(false)}>&times;</span>
                            </div>
                            <div className='client-modal-body'>
                                <p>Are you sure you want to reject this case with the lawyer?</p>
                            </div>
                            <div className='client-modal-footer'>
                                <button className='client-confirm-button' onClick={confirmRejection}>Confirm</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default ViewSpecificCase;
