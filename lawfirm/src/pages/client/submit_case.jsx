import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import '../../cssFolder/client/submit_case.css';
import { storage, db } from '../../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, collection, getDocs, serverTimestamp, getDoc, query, where  } from 'firebase/firestore';
import * as cons from "../constant"
import * as util from "../utility"

const SubmitCase = ({ userId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [collectionsData, setCollectionsData] = useState({});
    const [uploadedFiles, setUploadedFiles] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            const data = {};
            data[cons.usersCollectionName] = await util.getOneUserClient(cons.usersCollectionName, userId);
            data[cons.lawyerCollectionName] = await util.getLawyerFromUsers();
            data[cons.case_typeCollectionName] = await util.getCaseTypeStatus(cons.case_typeCollectionName);
            data[cons.case_statusCollectionName] = await util.getCaseTypeStatus(cons.case_statusCollectionName);

            setIsLoading(false);
            setCollectionsData(data);
        }
        
        fetchOptions();

    }, []);
    console.log(collectionsData)

    const initialFormData = {
        name: '',
        gender: '',
        contact: '',
        dob: '',
        email: '',
        ic: '',
        case_type: '',
        case_title: '',
        lawyer: '',
        event_date: '',
        case_description: '',
        case_created_date: '',
        case_finished_date: ''
    };

    const [formData, setFormData] = useState(initialFormData);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const caseDocRef = collection(db, 'case');
            const newCaseRef = doc(caseDocRef);
            await setDoc(newCaseRef, {
                case_status: "case_status_01",
                lawyer: formData.lawyer,
                client: userId,
                case_type: formData.case_type,
                case_title: formData.case_title,
                case_description: formData.case_description,
                case_created_date: serverTimestamp(),
                case_finished_date: null
            });

            for (const uploadedFile of uploadedFiles) {
                const temp_case_id =  newCaseRef.split('/').pop();
                const documentRef = storageRef(storage, `case_document/${temp_case_id}/${uploadedFile.name}`);
                const docRef = collection(db, 'document');
                const newDocRef = doc(docRef);
                try {
                    await uploadBytes(documentRef, uploadedFile);
                    const documentUrl = await getDownloadURL(documentRef);
                    await setDoc(newDocRef, {
                        case_id: temp_case_id,
                        url: documentUrl,
                        document_name: uploadedFile.name
                    });
                } catch (error) {
                    console.error('Error uploading document: ', error);
                }
            }

            const clientDocRef = collection(db, 'client');
            const newClientRef = doc(clientDocRef, userId);
            await setDoc(newClientRef, {
                client_ic: formData.ic,
                dob: formData.dob,
                gender: formData.gender,
                // contact: formData.contact,
                // email: formData.email
            });
            alert("Case Submitted Successfully");
            console.log("Case Submitted Successfully");
            navigate("/home")
        } catch (error) {
            console.error('Error submitting data:', error);
        }
    };

    if (isLoading){
        return (
            <div></div>
        )
    }
    
    return (
        <form onSubmit={handleSubmit}>
            <div className='client-page'>
            <div className="header-section-1">
                <div className="header-title-1">
                    <div>SUBMIT YOUR CASE</div>
                </div>
            </div>
            <div>
                <div className='section-container'>
                    <div className='form-header'>
                        Case Application Form
                    </div>
                    <div className='form-person-container'>
                        <div className='form-person-container-left'>
                            <div className='form-inner-left'>
                                <div className='label-field'>Applicant's Name</div>
                                <div className='label-field'>Contact Number</div>
                                <div className='label-field'>Email Address</div>
                            </div>
                            <div className='form-inner-right'>
                                <input 
                                    className='input-field' 
                                    type="text"
                                    name="name" 
                                    onChange={handleChange}
                                    value={collectionsData['users'].data.fullname}
                                    required
                                    readOnly
                                />
                                <input 
                                    className='input-field' 
                                    type="text"
                                    name="contact" 
                                    onChange={handleChange}
                                    value={collectionsData['users'].data.phoneNumber}
                                    required
                                    readOnly
                                />
                                <input 
                                    className='input-field' 
                                    type="text"
                                    name="email" 
                                    onChange={handleChange}
                                    value={collectionsData['users'].data.email}
                                    required
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className='form-person-container-middle'></div>
                        <div className='form-person-container-right'>
                            <div className='form-inner-left'>
                                <div className='label-field'>Gender</div>
                                <div className='label-field'>Date of Birth</div>
                                <div className='label-field'>IC Number</div>
                            </div>
                            <div className='form-inner-right'>
                                <select className='input-field' name="gender" onChange={handleChange} required>
                                    <option value="Select an option..." disabled selected>Select an option...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                <input 
                                    className='input-field' 
                                    type="date" 
                                    name="dob" 
                                    onChange={handleChange}
                                    required
                                />
                                <input 
                                    className='input-field' 
                                    type="text" 
                                    name="ic" 
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <hr className='line' color='black'/>
                    <div className='form-case-container'>
                        <div className='form-person-container'>
                            <div className='form-person-container-left'>
                                <div className='form-inner-left'>
                                    <div className='label-field'>Case Type</div>
                                    <div className='label-field'>Case Title</div>
                                </div>
                                <div className='form-inner-right'>
                                    <select className='input-field' name="case_type" onChange={handleChange} req>
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
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className='form-person-container-middle'></div>
                            <div className='form-person-container-right'>
                                <div className='form-inner-left'>
                                    <div className='label-field'>Lawyer Preferred</div>
                                    {/* <div className='label-field'>Event Date</div> */}
                                </div>
                                <div className='form-inner-right'>
                                    <select className='input-field'  name="lawyer" onChange={handleChange} required>
                                        <option value="Select an option..." disabled selected>Select an option...</option>
                                        {collectionsData['lawyer']?.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.data.fullname}
                                            </option>
                                        ))}
                                    </select>
                                    <div className='blank'></div>
                                    {/* <input 
                                        className='input-field' 
                                        type="date"
                                        name="event_date" 
                                        onChange={handleChange}
                                        required
                                    /> */}
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
                        {/* <button className='button' type='button' onClick={clearData}>Clear</button> */}
                        <button className='button' type='submit'>Submit</button>
                    </div>
                </div>
            </div>
            </div>
        </form>
  );
};

export default SubmitCase;