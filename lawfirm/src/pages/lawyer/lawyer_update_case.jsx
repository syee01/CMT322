import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import '../../cssFolder/lawyer/lawyer_update_case.css';
import { storage, db } from '../../firebase';
import { getStorage, ref as storageRef, deleteObject, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import * as cons from "../constant"
import * as util from "../utility.js"
import { apiCalendar } from '../../googleapi'

const LawyerUpdateCase = ({ userId }) => {
    const { case_id } = useParams(); 
    const navigate = useNavigate();
    const [collectionsData, setCollectionsData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);

    const [data, setData] = useState({
        name: '',
        gender: '',
        contact: '',
        dob: '',
        email: '',
        ic: '',
        case_type: '',
        case_title: '',
        lawyer: '',
        // event_date: '',
        case_description: '',
    });
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        contact: '',
        dob: '',
        email: '',
        ic: '',
        case_type: '',
        case_title: '',
        lawyer: '',
        // event_date: '',
        case_description: '',
    });
    
    useEffect(() => {
        const fetchItemData = async () => {
            try {
            const itemRef = doc(db, 'case', case_id);
            const itemDoc = await getDoc(itemRef);
            console.log(case_id);

            if (itemDoc.exists()) {
                // Document exists, set the form data based on the retrieved data
                setData(itemDoc.data());
                setFormData(itemDoc.data());
            } else {
                console.log('Document does not exist');
            }
            } catch (error) {
            console.error('Error retrieving item:', error);
            }
        };
        fetchItemData();
        
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const specificCaseRef = doc(db, 'case', case_id);
                const specificCaseDoc = await getDoc(specificCaseRef);
                const data = {};
                data[cons.caseCollectionName] = await util.getOneCase(case_id);
                data[cons.usersCollectionName] = await util.getOneUserClient(cons.usersCollectionName, specificCaseDoc.data().client);
                data[cons.clientCollectionName] = await util.getOneUserClient(cons.clientCollectionName, specificCaseDoc.data().client);
                data[cons.documentCollectionName] = await util.getDocumentFromOneCase(case_id);
                data[cons.meetingCollectionName] = await util.getAllMeetingsUnderOneCase(case_id);
                data[cons.lawyerCollectionName] = await util.getLawyerFromUsers();
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
    }, [case_id]);

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
        console.log("clear")
    }
    
    // const handleBlur = (attribute) => {
    //     if (!isSubmitting) {
    //         const prevValue = formData[attribute]
    //         if (formData[attribute] !== data[attribute]) {
    //             setFormData((prevData) => ({
    //             ...prevData,
    //             [attribute]: data[attribute],
    //             }));
                
    //         }
    //     }
    // };

    const handleBack = async (e) => {
        navigate(`/LawyerViewSpecificCase/${case_id}`)      
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            const itemRef = doc(db, 'case', case_id);
            console.log(formData.case_description)
            await updateDoc(itemRef, {
                case_status: formData.case_status,
                case_type: formData.case_type,
                case_title: formData.case_title,
                case_description: formData.case_description
            });

            console.log('Item data updated successfully!');
            setIsSubmitting(false);
            navigate(`/LawyerViewSpecificCase/${case_id}`)
        } catch (error) {
            console.error('Error updating item data:', error);
        }
    };

    const CheckboxItem = ({ id, label, isSelected, onSelect, meetingStatus }) => {
        return (
          <div>
            <input
                style={{ 
                    display: 
                        ((util.getStatusName(collectionsData[cons.meeting_statusCollectionName], meetingStatus)) === 'Finished') 
                        ? 'none' 
                        : 'inline-block' 
                }}
                type="checkbox"
                id={id}
                checked={isSelected}
                onChange={() => onSelect(id)}
            />
            <label htmlFor={id}>{label}</label>
          </div>
        );
    };

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
    
    const handleDocumentsDelete = async () => {
        selectedItems.forEach(async (itemId, collectionName) => {
            console.log("Delete again: ", itemId);
            console.log("List: ", selectedItems);
            const itemRef = doc(db, cons.documentCollectionName, itemId);
            const itemDataRef = await getDoc(itemRef);
            console.log("delete item: ", itemDataRef.data().case_id);
            const documentRef = storageRef(storage, `case_document/${itemDataRef.data().case_id}/${itemDataRef.data().document_name}`);
            // Delete the file
            deleteObject(documentRef);
            await deleteDoc(itemRef);
        });    
        // Clear the selectedItems after deletion
        setSelectedItems([]);
    };

    const handleMeetingsDelete = async () => {
        selectedItems.forEach(async (itemId, collectionName) => {
            const meetingDocList = await util.getDocumentFromOneMeeting(itemId);

            await Promise.all(meetingDocList?.map(async (item) => {
                // const item = meetingDocList[key];
                // Now 'item' contains the value of the current property
                // console.log(key, item);
                const eventIdRef = doc(db, 'meeting', item.id);
                const getEvent = await getDoc(eventIdRef);
                await apiCalendar.handleAuthClick();
                const existingEventId = getEvent.data().event_id;
                if (existingEventId) {
                    apiCalendar.deleteEvent(existingEventId, 'primary').then((result) => {
                    console.log('Previous event deleted:', result);
                    }).catch((error) => {
                    console.log('Error deleting previous event:', error);
                    });
                }
                console.log("Testing Delete again: ", item.id);
                const itemRef = doc(db, cons.documentCollectionName, item.id);
                const itemDataRef = await getDoc(itemRef);
                console.log("delete item: ", itemDataRef.data().case_id);
                const documentRef = storageRef(storage, `case_document/${itemDataRef.data().case_id}/${itemDataRef.data().document_name}`);
                // Delete the file
                deleteObject(documentRef);
                await deleteDoc(itemRef);
                
                // Your logic for each item goes here
            }));
            
            // meetingDocList.forEach(async (itemId) => {
            //     console.log("Delete again: ", itemId);
            //     console.log("List: ", selectedItems);
            //     const itemRef = doc(db, cons.documentCollectionName, itemId);
            //     const itemDataRef = await getDoc(itemRef);
            //     console.log("delete item: ", itemDataRef.data().case_id);
            //     const documentRef = storageRef(storage, `case_document/${itemDataRef.data().case_id}/${itemDataRef.data().document_name}`);
            //     // Delete the file
            //     deleteObject(documentRef);
            //     await deleteDoc(itemRef);
            // });
            console.log("Delete again: ", itemId);
            console.log("List: ", selectedItems);
            const itemRef = doc(db, cons.meetingCollectionName, itemId);
            console.log("delete item: ", itemRef);
            await deleteDoc(itemRef);
        });    
        // Clear the selectedItems after deletion
        setSelectedItems([]);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className='client-page'>
            <div className="header-section-1">
                <div className="header-title-1">
                    <h1>SUBMIT YOUR CASE</h1>
                </div>
            </div>
            <div>
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

                    <div className='section-small-header'>
                        Case Information
                    </div>
                        <div className='form-case-container'>
                            <div className='form-person-container'>
                                <div className='form-person-container-left'>
                                    <div className='form-inner-left'>
                                        <div className='label-field'>Case Type</div>
                                        <div className='label-field'>Case Title</div>
                                        <div className='label-field'>Case Status</div>
                                    </div>
                                    <div className='form-inner-right'>
                                        <select className='input-field' name="case_type" value={formData.case_type}
                                        onChange={handleChange}  req>
                                            <option value="Select an option..." disabled selected>Select an option...</option>
                                            {collectionsData['case_type']?.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.data.case_type_name}
                                                </option>
                                            ))}
                                        </select>
                                        <input 
                                            className='input-field' 
                                            type="text" 
                                            name='case_title'
                                            value={formData.case_title}
                                            onChange={handleChange}
                                            required
                                        />
                                        <select className='input-field' name="case_status" value={formData.case_status}
                                        onChange={handleChange}
                                        req>
                                            <option value="Select an option..." disabled selected>Select an option...</option>
                                            {collectionsData['case_status']?.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.data.case_status_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className='form-person-container-middle'></div>
                                <div className='form-person-container-right'>
                                    <div className='form-inner-left'>
                                        <div className='label-field'>Lawyer</div>
                                        <div className='label-field'>Case Price</div>
                                        <div className='label-field'>Submitted Date</div>
                                    </div>
                                    <div className='form-inner-right'>
                                        <div className='display-field'>{util.getLawyerName(collectionsData[cons.lawyerCollectionName], collectionsData[cons.caseCollectionName].data.lawyer)}</div>
                                        <input 
                                            className='input-field' 
                                            type="text"
                                            name="case_price" 
                                            value={formData.case_price}
                                        />
                                        <div className='submit-date-display-field'>{collectionsData[cons.caseCollectionName].data.case_created_date.toDate().toLocaleTimeString([], { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()}</div>
                                        {/* <input
                                            className='input-field' 
                                            type="date"
                                            name="event_date" 
                                            value={formData.event_date}
                                            onChange={handleChange}
                                            required
                                        /> */}
                                        <div className='content-data-field'></div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <div className='label-field'>Case Description</div>
                                    <textarea 
                                        cols="30" 
                                        rows="10"
                                        name="case_description" 
                                        value={formData.case_description}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <div className='content-Label-Field'>
                                        Related Documents
                                        <button onClick={handleDocumentsDelete}>Delete</button>
                                    </div>                              

                                    <div className='content-frame'>
                                        <div className='date-section-column'>                            
                                            <div>
                                                {collectionsData[cons.documentCollectionName]?.map((item) => (
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
                                                            // onSelect={handleSelect}
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
                        <div>
                            <div className='content-Label-Field'>
                                Important Dates
                                <button className="update-btn" onClick={handleMeetingsDelete}>Delete</button>
                            </div>
                            <div className='content-frame'>
                                <div className='date-section-column'>
                                    <div className='date-section-row'>
                                        <div className='date-header'>Date and Time</div>
                                        <div className='date-header'>Event</div>
                                        <div className='date-header'>Location</div>
                                        <div className='date-header'
                                        style={{
                                            marginRight: '10.5px'  // Set your desired right margin value
                                        }}
                                        >
                                        Status</div>
                                    </div>
                                    <div>
                                        {collectionsData[cons.meetingCollectionName]?.map((item) => (
                                            <React.Fragment key={item.id}>
                                                <div className='date-section-row'>
                                                    <div className='lawyer-meetings-row-content-small'>
                                                    {item.data.date.toDate().toLocaleTimeString([], { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()}
                                                    </div>
                                                    <div className='lawyer-meetings-row-content-small'>
                                                        {item.data.event}
                                                    </div> 
                                                    <div className='lawyer-meetings-row-content-small'>
                                                        {util.getLocationName(collectionsData[cons.meeting_locationCollectionName], item.data.location)}
                                                    </div>
                                                    <div className='lawyer-meetings-row-content-small'
                                                    style={{
                                                        marginRight: 
                                                          ((util.getStatusName(collectionsData[cons.meeting_statusCollectionName], item.data.status)) === 'Finished') 
                                                            ? '15px'  // Set your desired right margin value
                                                            : '0'    // Set the default right margin value when display is 'inline-block'
                                                    }}
                                                    >
                                                        {util.getStatusName(collectionsData[cons.meeting_statusCollectionName], item.data.status)}
                                                    </div>
                                                    <CheckboxItem
                                                    style={{ 
                                                        display: 
                                                            ((util.getStatusName(collectionsData[cons.meeting_statusCollectionName], item.data.status)) === 'Finished') 
                                                            ? 'none' 
                                                            : 'inline-block'
                                                    }}
                                                    key={item.id}
                                                    id={item.id}
                                                    label={item.label} // Replace with the actual property you want to display
                                                    isSelected={selectedItems.includes(item.id, cons.meetingCollectionName)}
                                                    onSelect={handleSelect}
                                                    meetingStatus={item.data.status}
                                                    />
                                                </div>
                                            </React.Fragment>
                                            
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='button-section'>
                            <button className='btn' type='button' onClick={handleBack}>Back</button>
                            <button className='btn' type='submit'>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
  );
};

export default LawyerUpdateCase;