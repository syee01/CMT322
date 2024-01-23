import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import '../../cssFolder/lawyer/lawyer_view_specific_case.css';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { storage, db } from '../../firebase';
import { ref as storageRef, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc, setDoc, deleteDoc, collection } from 'firebase/firestore';
import * as cons from "../constant"
import * as util from "../utility"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import { apiCalendar, timeZone } from '../../googleapi'
import { Timestamp } from 'firebase/firestore';

const LawyerViewSpecificCase = ({ userId }) => {
    const { case_id } = useParams();  // Assuming case_id is from URL params
    const [collectionsData, setCollectionsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [meetingID, setMeetingID] = useState(null);
    const [eventID, setEventID] = useState(null)
    const [selectedItems, setSelectedItems] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const navigate = useNavigate();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState({
            data:{
                event: '',
                date: Timestamp.fromDate(new Date(2023, 0, 1)),
                case: '',
                description: '',
                location: '',
                status: ''
            }
    });


    const [formData, setFormData] = useState({
        event: '',
        date: new Date(2023, 0, 1),
        case: '',
        description: '',
        location: '',
        status: ''
    });

    const onDrop = (acceptedFiles) => {
        setUploadedFiles(acceptedFiles);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const displayDroppedFiles = () => {
        return (
            <div>
                <ul>
                    {uploadedFiles.map((uploadedFile, index) => (
                    <li key={index}>{uploadedFile.name}</li>
                    ))}
                </ul>
            </div>
        );
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const specificCaseRef = doc(db, 'case', case_id);
                const specificCaseDoc = await getDoc(specificCaseRef);
                const data = {};
                data[cons.caseCollectionName] = await util.getOneCase(case_id);
                console.log(specificCaseDoc.data().client)
                data[cons.usersCollectionName] = await util.getOneUserClient(cons.usersCollectionName, specificCaseDoc.data().client);
                data[cons.clientCollectionName] = await util.getOneUserClient(cons.clientCollectionName, specificCaseDoc.data().client);
                data[cons.documentCollectionName] = await util.getDocumentFromOneCase(case_id);
                data[cons.lawyerCollectionName] = await util.getLawyerFromUsers();
                data[cons.meetingCollectionName] = await util.getAllMeetingsUnderOneCase(case_id);
                data[cons.case_typeCollectionName] = await util.getCaseTypeStatus(cons.case_typeCollectionName);
                data[cons.case_statusCollectionName] = await util.getCaseTypeStatus(cons.case_statusCollectionName);
                data[cons.meeting_locationCollectionName] = await util.getCaseTypeStatus(cons.meeting_locationCollectionName);
                data[cons.meeting_statusCollectionName] = await util.getCaseTypeStatus(cons.meeting_statusCollectionName);

                setCollectionsData(data);
                console.log(selectedMeeting);
            } catch (error) {
                setError(error);
                console.error("Error fetching data: ", error);
            }
            setIsLoading(false);
        };

        fetchData();

    }, [case_id], [isInfoModalOpen]); // Dependency array ensures useEffect runs when case_id changes

    if (isLoading) {
        return <div></div>;
    }

    if (error) {
        return <div>Error loading data: {error.message}</div>;
    }

    if (!collectionsData) {
        return <div>No case data available.</div>;
    }

    const openAddModal = async(meeting_id) => {
        try {
            setIsAddModalOpen(true);
        } catch (error) {
            console.error('Error retrieving specific meeting:', error);
        }
    };

    const closeAddModal = () => {
        clearData();
        setIsAddModalOpen(false);
    };

    const openInfoModal = async(meeting_id) => {
        try {
            console.log("HI", meeting_id)
            const data = await util.getOneMeeting(meeting_id);
            collectionsData['meeting_document'] = await util.getDocumentFromOneMeeting(meeting_id);

            setSelectedMeeting(data);
            setMeetingID(meeting_id);
            setIsInfoModalOpen(true);
            console.log("", selectedMeeting);

        } catch (error) {
            console.error('Error retrieving specific meeting:', error);
        }
    };

    const closeInfoModal = () => {
        collectionsData['meeting_document'] = [];
        setIsInfoModalOpen(false);
        navigate(`/LawyerViewSpecificCase/${case_id}`)
    };

    const openEditModal = async(meeting_id) => {
        try {
            closeInfoModal();
            setIsEditModalOpen(true);
            collectionsData['meeting_document'] = await util.getDocumentFromOneMeeting(meeting_id);
            const itemRef = doc(db, 'meeting', meeting_id);
            const itemDoc = await getDoc(itemRef);
            console.log(meeting_id);

            if (itemDoc.exists()) {
                // Document exists, set the form data based on the retrieved data
                setFormData(itemDoc.data());
            }
            setMeetingID(meeting_id);
            console.log("tt", meetingID)

        } catch (error) {
            console.error('Error retrieving specific meeting:', error);
        }
    };
    
    const closeEditModal = () => {
        clearData();
        setIsEditModalOpen(false);
    };

    function openURL(url){
        window.open(url, '_blank');
    };

    const handleChange = (e) => {
        setFormData(prevFormData => {
            const updatedFormData = {
            ...prevFormData,
            [e.target.name]: e.target.value,
            };       
            console.log('Form data updated:', updatedFormData);
        
            return updatedFormData;
        });
    };

    const clearData = async () => {
        setFormData(formData);
        setUploadedFiles([]);
        console.log("clear")
    }

    const handleAddSubmit = async (e) => {
        e.preventDefault();

        try {
            const eventLocation = await util.getLocationName(collectionsData[cons.meeting_locationCollectionName], formData.location);

            await apiCalendar.handleAuthClick();
            const eventStartTime = new Date(formData.date);
            const eventEndTime = new Date(eventStartTime);
            eventEndTime.setHours(eventEndTime.getHours() + 2);
            const event = {
                summary: formData.event,
                location: eventLocation,
                description: formData.description,
                start: {
                    dateTime: eventStartTime.toISOString(),
                    timeZone: timeZone
                },
                end: {
                    dateTime:eventEndTime.toISOString(),
                    timeZone: timeZone
                },
                attendees: [
                    { 
                        email: collectionsData[cons.usersCollectionName].data.email, 
                        displayName: collectionsData[cons.usersCollectionName].data.fullname,
                    },
                ],
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 40320 },
                        { method: 'email', minutes: 1440 }
                    ]
                }
            }
            
            
            const result = await apiCalendar.createEvent(event, 'primary');  
            console.log( "result: ",result);
            console.log( "event id 1: ", result.result.id);

            const meetingDocRef = collection(db, 'meeting');
            const newMeetingRef = doc(meetingDocRef);
            await setDoc(newMeetingRef, {
                case: case_id,
                event: formData.event,
                date: Timestamp.fromDate(new Date(formData.date)),
                location: formData.location,
                status: formData.status,
                description: formData.description,
                event_id: result.result.id
            });
            
            for (const uploadedFile of uploadedFiles) {
                const temp_case_id = case_id;
                const documentRef = storageRef(storage, `case_document/${temp_case_id}/${uploadedFile.name}`);
                const docRef = collection(db, 'document');
                const newDocRef = doc(docRef);
                try {
                    await uploadBytes(documentRef, uploadedFile);
                    const documentUrl = await getDownloadURL(documentRef);
                    await setDoc(newDocRef, {
                        case_id: temp_case_id,
                        url: documentUrl,
                        document_name: uploadedFile.name,
                        meeting_id: newMeetingRef.id
                    });
                } catch (error) {
                    console.error('Error uploading document: ', error);
                }
            }

            const newMeetingId = newMeetingRef.id;
            console.log('Newly added meeting ID:', newMeetingId);

            console.log('Item data updated successfully!');
            clearData();
            setIsAddModalOpen(false);
            navigate(`/LawyerViewSpecificCase/${case_id}`);
            openInfoModal(newMeetingId);

        } catch (error) {
            console.error('Error updating item data:', error);
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        try {
            // setIsSubmitting(true);
            const eventLocation = await util.getLocationName(collectionsData[cons.meeting_locationCollectionName], formData.location);

            const itemRef = doc(db, 'meeting', meetingID);
            const getItemValue = await getDoc(itemRef);
            await apiCalendar.handleAuthClick();
            const existingEventId = getItemValue.data().event_id;
            if (existingEventId) {
                apiCalendar.deleteEvent(existingEventId, 'primary').then((result) => {
                  console.log('Previous event deleted:', result);
                }).catch((error) => {
                  console.log('Error deleting previous event:', error);
                });
            }
 
            const eventStartTime = new Date(formData.date);
            const eventEndTime = new Date(eventStartTime);
            eventEndTime.setHours(eventEndTime.getHours() + 2);
            const event = {
                summary: formData.event,
                location: eventLocation,
                description: formData.description,
                start: {
                    dateTime: eventStartTime.toISOString(),
                    timeZone: timeZone
                },
                end: {
                    dateTime:eventEndTime.toISOString(),
                    timeZone: timeZone
                },
                attendees: [
                    { 
                        email: collectionsData[cons.usersCollectionName].data.email, 
                        displayName: collectionsData[cons.usersCollectionName].data.fullname 
                    },
                ],
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 40320 },
                        { method: 'email', minutes: 1440 }
                    ]
                }
            }
            const result = await apiCalendar.createEvent(event, 'primary');  //.events.insert
            console.log( "result: ",result);
            console.log( "event id 1: ", result.result.id);

            await updateDoc(itemRef, {
                event: formData.event,
                date: Timestamp.fromDate(new Date(formData.date)),
                location: formData.location,
                status: formData.status,
                description: formData.description,
                event_id: result.result.id
            });

            console.log('Item data updated successfully!');
            clearData();
            setIsEditModalOpen(false);
            openInfoModal(meetingID);
        } catch (error) {
            console.error('Error updating item data:', error);
        }
    };

    const handleCaseFileUpload = async (e) => {
        e.preventDefault();

        for (const uploadedFile of uploadedFiles) {
            const temp_case_id = case_id;
            const documentRef = storageRef(storage, `case_document/${temp_case_id}/${uploadedFile.name}`);
            const docRef = collection(db, 'document');
            const newDocRef = doc(docRef);
            console.log("testing");
            try {
                console.log("testing");
                await uploadBytes(documentRef, uploadedFile);
                const documentUrl = await getDownloadURL(documentRef);
                console.log("url: ", documentUrl);
                await setDoc(newDocRef, {
                    case_id: temp_case_id,
                    url: documentUrl,
                    document_name: uploadedFile.name,
                    meeting_id: '-'
                });

            } catch (error) {
                console.error('Error uploading document: ', error);
            }
        }
        collectionsData[cons.documentCollectionName] = await util.getDocumentFromOneCase(case_id);
        clearData();
        navigate(`/LawyerViewSpecificCase/${case_id}`)
    };

    const handleMeetingFileUpload = async (e) => {
        e.preventDefault();
        for (const uploadedFile of uploadedFiles) {
            const temp_case_id = case_id;
            const documentRef = storageRef(storage, `case_document/${temp_case_id}/${uploadedFile.name}`);
            const docRef = collection(db, 'document');
            const newDocRef = doc(docRef);
            try {
                await uploadBytes(documentRef, uploadedFile);
                const documentUrl = await getDownloadURL(documentRef);
                console.log("url: ", documentUrl);
                await setDoc(newDocRef, {
                    case_id: temp_case_id,
                    url: documentUrl,
                    document_name: uploadedFile.name,
                    meeting_id: meetingID
                });

            } catch (error) {
                console.error('Error uploading document: ', error);
            }
        }
        collectionsData['meeting_document'] = await util.getDocumentFromOneMeeting(meetingID);
        clearData();
        openInfoModal(meetingID);
    };

    function directToCase(case_id) {
        navigate(`/LawyerUpdateCase/${case_id}`)
    }
    
    const CheckboxItem = ({ id, label, isSelected, onSelect }) => {
        return (
          <div>
            <input
              type="checkbox"
              id={id}
              checked={isSelected}
              onChange={() => onSelect(id)}
            />
            <label htmlFor={id}>{label}</label>
          </div>
        );
    };

    // Handle select function
    const handleSelect = (itemId) => {
        // Toggle the selected state of the item
        setSelectedItems((prevSelected) => {
            if (prevSelected.includes(itemId)) {
                // Item is already selected, remove it;
                return prevSelected.filter((id) => id !== itemId);
            } else {
                // Item is not selected, add it
                return [...prevSelected, itemId];
            }
        });
    };
    
    const handleDelete = async () => {
        // Perform the delete operation for selected items
        // Iterate through selectedItems and delete each item from the database
        
        selectedItems.forEach(async (itemId, collectionName) => {
            console.log("Delete again: ", itemId);
            console.log("List: ", selectedItems);
            const itemRef = doc(db, cons.documentCollectionName, itemId);
            const itemDataRef = await getDoc(itemRef);
            console.log("delete item: ", itemDataRef.data().case_id);
            const documentRef = storageRef(storage, `case_document/${itemDataRef.data().case_id}/${itemDataRef.data().document_name}`);
            deleteObject(documentRef);
            await deleteDoc(itemRef);
        });  
        // Clear the selectedItems after deletion
        setSelectedItems([]);
    };

    // Main component rendering
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
                    <div className='section-Small-Header'>
                        Case Information
                        <button onClick={() => directToCase(collectionsData['case'].id)} className="update-btn"
                        style={{ 
                            display: 
                                ((util.getCaseStatusName(collectionsData[cons.case_statusCollectionName], collectionsData[cons.caseCollectionName].data.case_status)) === 'Finished' ||
                                (util.getCaseStatusName(collectionsData[cons.case_statusCollectionName], collectionsData[cons.caseCollectionName].data.case_status)) === 'Rejected' ||
                                (util.getCaseStatusName(collectionsData[cons.case_statusCollectionName], collectionsData[cons.caseCollectionName].data.case_status)) === 'Pending' ||
                                (util.getCaseStatusName(collectionsData[cons.case_statusCollectionName], collectionsData[cons.caseCollectionName].data.case_status)) === 'Pending Accept') 
                                ? 'none' 
                                : 'inline-block'
                          }}
                        >
                            <FontAwesomeIcon icon={faEdit} className="fa-icon" /> Edit
                        </button>
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
                                <div className='content-data-field'>{collectionsData[cons.caseCollectionName].data.case_created_date.toDate().toLocaleTimeString([], { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()}</div>
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
                            <li key={item.id} onClick={() => openURL(item.data.url)}>{item.data.document_name}</li>
                        ))}
                    </div>
                </div>
                <div
                style={{ 
                    display: 
                        ((util.getCaseStatusName(collectionsData[cons.case_statusCollectionName], collectionsData[cons.caseCollectionName].data.case_status)) === 'Finished' ||
                        (util.getCaseStatusName(collectionsData[cons.case_statusCollectionName], collectionsData[cons.caseCollectionName].data.case_status)) === 'Rejected' ||
                        (util.getCaseStatusName(collectionsData[cons.case_statusCollectionName], collectionsData[cons.caseCollectionName].data.case_status)) === 'Pending' ||
                        (util.getCaseStatusName(collectionsData[cons.case_statusCollectionName], collectionsData[cons.caseCollectionName].data.case_status)) === 'Pending Accept') 
                        ? 'none' 
                        : 'block'
                  }}
                >
                    <form onSubmit={handleCaseFileUpload}>
                        <div>
                            <div className='labelfield'>Documents</div>
                            <div {...getRootProps()} className='dropzoneStyles'>
                                <input {...getInputProps()} />
                                <label>Drag and Drop Some Files Here</label>
                                {uploadedFiles.length > 0 && displayDroppedFiles()}
                            </div>
                        </div>
                        <div class="button-section">
                            <button type="button" onClick={clearData}>Clear</button>
                            <button type="submit">Save</button>
                        </div>
                    </form>
                </div>
                <div>
                    <div className='content-Label-Field'>
                        Important Dates
                        <button onClick={openAddModal}  className="update-btn"
                        style={{ 
                            display: 
                                ((util.getCaseStatusName(collectionsData[cons.case_statusCollectionName], collectionsData[cons.caseCollectionName].data.case_status)) === 'Finished' ||
                                (util.getCaseStatusName(collectionsData[cons.case_statusCollectionName], collectionsData[cons.caseCollectionName].data.case_status)) === 'Rejected' ||
                                (util.getCaseStatusName(collectionsData[cons.case_statusCollectionName], collectionsData[cons.caseCollectionName].data.case_status)) === 'Pending' ||
                                (util.getCaseStatusName(collectionsData[cons.case_statusCollectionName], collectionsData[cons.caseCollectionName].data.case_status)) === 'Pending Accept') 
                                ? 'none' 
                                : 'inline-block'
                        }}
                        >
                            <FontAwesomeIcon icon={faEdit} className="fa-icon" /> Add
                        </button>
                    </div>
                    <div className='content-frame'>
                        <div className='date-section-column'>
                            <div className='date-section-row'>
                                <div className='date-header'>Date and Time</div>
                                <div className='date-header'>Event</div>
                                <div className='date-header'>Location</div>
                                <div className='date-header'>Status</div>
                            </div>
                            {collectionsData[cons.meetingCollectionName]?.sort((a, b) => b.data.date.toMillis() - a.data.date.toMillis()).map((item) => (
                                <React.Fragment key={item.id}>
                                    <div className='date-section-row'>
                                        <div className='lawyer-meetings-row-content-small'>
                                            {item.data.date.toDate().toLocaleTimeString([], { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()}
                                        </div>
                                        <div className='lawyer-meetings-row-content-title' type="button" onClick={() => openInfoModal(item.id)}>
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
            </div>
            <div>
                {/* Add Appointment Modal */}
                <Modal
                    isOpen={isAddModalOpen}
                    onRequestClose={closeAddModal}
                    contentLabel="Edit Modal"
                >
                <button class="move-right" onClick={closeAddModal}>Close</button>
                <form onSubmit={handleAddSubmit}>
                <div className='section-container1'>
                    <div className='section-Small-Header'>
                        Add New Meeting
                    </div>
                    <div className='form-case-container'>
                            <div className='form-person-container'>
                                <div className='form-person-container-left'>
                                    <div className='form-inner-left'>
                                        <div className='label-field'>Event</div>
                                        <div className='label-field'>Date</div>
                                    </div>
                                    <div className='form-inner-right'>
                                        <input 
                                            className='input-field' 
                                            type="text" 
                                            name='event'
                                            onChange={handleChange}
                                            required
                                        />
                                        <input 
                                            className='input-field' 
                                            type="datetime-local"
                                            name="date" 
                                            onChange={handleChange} 
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='form-person-container-middle'></div>
                                <div className='form-person-container-right'>
                                    <div className='form-inner-left'>
                                        <div className='label-field'>Status</div>
                                        <div className='label-field'>Location</div>
                                    </div>
                                    <div className='form-inner-right'>
                                        <select className='input-field' name="status"
                                        onChange={handleChange} req>
                                            <option value="Select an option..." disabled selected>Select an option...</option>
                                            {collectionsData[cons.meeting_statusCollectionName]?.map((item) => (
                                                item.data.name !== "Finished" && (
                                                <option key={item.id} value={item.id}>
                                                    {item.data.name}
                                                </option>
                                                )
                                            ))}
                                        </select>
                                        <select className='input-field' name="location"
                                        onChange={handleChange} req>
                                            <option value="Select an option..." disabled selected>Select an option...</option>
                                            {collectionsData[cons.meeting_locationCollectionName]?.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.data.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <div className='label-field'>Description</div>
                                    <textarea 
                                        cols="30" 
                                        rows="10"
                                        name="description"  
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <div className='label-field'>Documents</div>
                                    <div {...getRootProps()} className='dropzoneStyles'>
                                        <input {...getInputProps()} />
                                        <label>Drag and Drop Some Files Here</label>
                                        {uploadedFiles.length > 0 && displayDroppedFiles()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    <div className='button-section'>
                        <button className='button' type='submit'>Submit</button>
                    </div>
                </div>
                </form>
                </Modal>

                {/* Info Modal */}
                <Modal
                    isOpen={isInfoModalOpen}
                    onRequestClose={closeInfoModal}
                    contentLabel="Info Modal"
                >
                <button class="move-right" onClick={closeInfoModal}>Close</button>
                <div className='section-container1'>
                        <div className='section-Small-Header'>
                            Meeting Details
                            <button onClick={() => openEditModal(selectedMeeting.id)} className="update-btn"
                            style={{ 
                                display: 
                                    ((util.getStatusName(collectionsData[cons.meeting_statusCollectionName], selectedMeeting.data.status)) === 'Finished') 
                                    ? 'none' 
                                    : 'inline-block'
                            }}
                            >
                                <FontAwesomeIcon icon={faEdit} className="fa-icon" /> Edit
                            </button>
                        </div>
                        <div className='section-divider'>
                            <div className='divider-left'>
                                <div className='inner-left-part'>
                                    <div className='content-label-field'>Event</div>
                                    <div className='content-label-field'>Date</div>
                                </div>
                                <div className='inner-right-part'>
                                    <div className='content-data-field'>{selectedMeeting.data.event}</div>
                                    <div className='content-data-field'>{selectedMeeting.data.date.toDate().toLocaleTimeString([], { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()}</div>
                                </div>
                            </div>
                            <div className='divider-right'>
                                <div className='inner-left-part'>
                                    <div className='content-label-field'>Status</div>
                                    <div className='content-label-field'>Location</div>
                                </div>
                                <div className='inner-right-part'>
                                    <div className='content-data-field'>{util.getStatusName(collectionsData[cons.meeting_statusCollectionName], selectedMeeting.data.status)}</div>
                                    <div className='content-data-field'>{util.getLocationName(collectionsData[cons.meeting_locationCollectionName], selectedMeeting.data.location)}</div>
                                </div>
                            </div>
                        </div>
        
                    <div className='content-label-field'>
                        Description
                    </div>
                    <div className='content-frame'>
                    {selectedMeeting.data.description}
                    </div>
                    <div className='content-label-field'>
                        Related Documents
                    </div>
                    <div className='content-frame'>
                        {collectionsData['meeting_document']?.map((item) => (
                            <li key={item.id} onClick={() => openURL(item.data.url)}>{item.data.document_name}</li>
                        ))}
                    </div>


                    <div
                    style={{ 
                        display: 
                            ((util.getStatusName(collectionsData[cons.meeting_statusCollectionName], selectedMeeting.data.status)) === 'Finished') 
                            ? 'none' 
                            : 'block'
                    }}
                    >
                        <form onSubmit={handleMeetingFileUpload}>
                            <div>
                                <div className='label-field'>Documents</div>
                                <div {...getRootProps()} className='dropzoneStyles'>
                                    <input {...getInputProps()} />
                                    <label>Drag and Drop Some Files Here</label>
                                    {uploadedFiles.length > 0 && displayDroppedFiles()}
                                </div>
                            </div>
                            <div class="button-section">
                                <button type="button" onClick={clearData}>Clear</button>
                                <button type="submit">Save</button>
                            </div>
                        </form>
                    </div> 
                </div>                  
                </Modal>

                {/* Edit Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onRequestClose={closeEditModal}
                    contentLabel="Edit Modal"
                >
                <button class="move-right" onClick={closeEditModal}>Close</button>
                <form onSubmit={handleUpdateSubmit}>
                <div className='section-container1'>
                    <div className='section-Small-Header'>
                        Update Meeting Details
                    </div>
                        <div className='form-case-container'>
                            <div className='form-person-container'>
                                <div className='form-person-container-left'>
                                    <div className='form-inner-left'>
                                        <div className='label-field'>Event</div>
                                        <div className='label-field'>Date</div>
                                    </div>
                                    <div className='form-inner-right'>
                                        <input 
                                            className='input-field' 
                                            type="text" 
                                            name='event'
                                            value={formData.event}
                                            onChange={handleChange}
                                            required
                                        />
                                        <input 
                                            className='input-field' 
                                            type="datetime-local"
                                            name="date" 
                                            value={formData.date}
                                            onChange={handleChange}
                                            // required
                                        />
                                    </div>
                                </div>
                                <div className='form-person-container-middle'></div>
                                <div className='form-person-container-right'>
                                    <div className='form-inner-left'>
                                        <div className='label-field'>Status</div>
                                        <div className='label-field'>Location</div>
                                    </div>
                                    <div className='form-inner-right'>                                 
                                        <select className='input-field' name="status" value={formData.status}
                                        onChange={handleChange} req>
                                            <option value="Select an option..." disabled selected>Select an option...</option>
                                            {collectionsData[cons.meeting_statusCollectionName]?.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.data.name}
                                                </option>
                                            ))}
                                        </select>
                                        <select className='input-field' name="location" value={formData.location}
                                        onChange={handleChange} req>
                                            <option value="Select an option..." disabled selected>Select an option...</option>
                                            {collectionsData[cons.meeting_locationCollectionName]?.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.data.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <div className='label-field'>Description</div>
                                    <textarea 
                                        cols="30" 
                                        rows="10"
                                        name="description" 
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <div className='content-Label-Field'>
                                        Related Documents
                                        <button className="update-btn" onClick={handleDelete}>Delete</button>
                                    </div>                              

                                    <div className='content-frame'>
                                        <div className='date-section-column'>                            
                                            <div>
                                                {collectionsData['meeting_document']?.map((item) => (
                                                    <React.Fragment key={item.id}>
                                                        <div className='date-section-row'  key={item.id}>
                                                            <div className='lawyer-document-row-content-small'>
                                                            {item.data.document_name}
                                                            </div>                                                         
                                                            <CheckboxItem
                                                            key={item.id}
                                                            id={item.id}
                                                            label={item.label} // Replace with the actual property you want to display
                                                            onSelect={handleSelect}
                                                            isSelected={selectedItems.includes(item.id, 'document')}
                                                            />
                                                        </div>
                                                        <hr></hr>
                                                    </React.Fragment>
                                                    
                                                ))}
                                            
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <div className='button-section'>
                        <button className='button' type='submit'>Save</button>
                    </div>
                </div>
                </form>
                </Modal>
            </div>
        </div>
        
    );
}

export default LawyerViewSpecificCase;