import React, { useEffect, useState } from 'react';
import '../../cssFolder/admin/admin_view_specific_case.css';
import { useParams } from 'react-router-dom';
import * as cons from "../constant";
import * as util from "../utility";

const AdminViewSpecificCase  = () => {
    const { case_id } = useParams();  
    const [collectionsData, setCollectionsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
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
                data[cons.meetingCollectionName] = await util.getAllMeetingsUnderOneCase(case_id);
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

    function openURL(url){
        window.open(url, '_blank');
    };
    
    return (
        <div className='admin_view_specific_rejected_case-page'>
            <div className='page-header'>CASE DETAILS</div>
            <div className='pending-section-container'>
                <div className='form-header'>
                    {collectionsData[cons.caseCollectionName].data.case_title}
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
                            {collectionsData[cons.meetingCollectionName]?.sort((a, b) => b.data.date.toMillis() - a.data.date.toMillis()).map((item) => (
                                <React.Fragment key={item.id}>
                                    <div className='date-section-row'>
                                        <div className='lawyer-meetings-row-content-small'>
                                            {item.data.date.toDate().toLocaleTimeString([], { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()}
                                        </div>
                                        <div className='lawyer-meetings-row-content-title'>
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
        </div>
    );
}

export default AdminViewSpecificCase ;
