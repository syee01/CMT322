import * as cons from "./constant"
import { db } from "../firebase"
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

// return the name of the case type to be displayed using case_type_id
export const getCaseTypeName = (caseTypeList, case_type_id) => {
    for (let i=0; i<caseTypeList.length; i++){
        if (caseTypeList[i].id === case_type_id){
            return caseTypeList[i].data.case_type_name
        }
    }
}
// return the name of the lawyer to be displayed using lawyer_id
export const getLawyerName = (lawyerList, lawyer_id) => {
    for (let i=0; i<lawyerList.length; i++){
        if (lawyerList[i].id === lawyer_id){
            return lawyerList[i].data.fullname
        }
    }
}
// return the name of the case status to be displayed using case_status_id
export const getCaseStatusName = (caseStatusList, case_status_id) => {
    for (let i=0; i<caseStatusList.length; i++){
        if (caseStatusList[i].id === case_status_id){
            return caseStatusList[i].data.case_status_name
        }
    }
}
// return the name of location to be displayed using location_id
export const getLocationName = (locationTypeList, location_id) => {
    for (let i=0; i<locationTypeList.length; i++){
        if (locationTypeList[i].id === location_id){
            console.log("Location", locationTypeList[i].data.name)
            return locationTypeList[i].data.name
        }
    }
}
// return the name of meeting status to be displayed using status_id
export const getStatusName = (statusTypeList, status_id) => {
    for (let i=0; i<statusTypeList.length; i++){
        if (statusTypeList[i].id === status_id){
            return statusTypeList[i].data.name
        }
    }
}
// filter "lawyer" role from users in the database
export const getLawyerFromUsers = async () => {
    const lawyerRef = collection(db, cons.usersCollectionName);
    try {
        const initialQuery = query(lawyerRef, where(cons.role, '==', 'lawyer'));
        const querySnapshot = await getDocs(initialQuery);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
        }));
    } catch (error) {
        console.log("Error: ", error);
    };
}
// filter "client" role from users in the database
export const getClientFromUsers = async () => {
    const clientRef = collection(db, cons.usersCollectionName);
    try {
        const initialQuery = query(clientRef, where(cons.role, '==', 'client'));
        const querySnapshot = await getDocs(initialQuery);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
        }));
    } catch (error) {
        console.log("Error: ", error);
    };
}
// return all the data of case type and case status
export const getCaseTypeStatus = async (collectionName) => {
    const collectionRef = collection(db, collectionName);
    try {
        const query = await getDocs(collectionRef);
        return query.docs.map((doc) => ({
            id: doc.id,
            data: doc.data()
        }))
    } catch (error) {
        console.log('Error: ', error);
    }
}
// get all the cases under one client
export const getAllCasesUnderOneClient = async (userId) => {
    const collectionRef = collection(db, cons.caseCollectionName);
    try {
        const initialQuery = query(collectionRef, where(cons.clientCollectionName, '==', userId));
        const querySnapshot = await getDocs(initialQuery);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
        }));
    } catch (error) {
        console.log("Error: ", error);
    };
}
// get all the cases under one lawyer
export const getAllCasesUnderOneLawyer = async (userId) => {
    const collectionRef = collection(db, cons.caseCollectionName);
    try {
        const initialQuery = query(collectionRef, where(cons.lawyerCollectionName, '==', userId));
        const querySnapshot = await getDocs(initialQuery);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
        }));
    } catch (error) {
        console.log("Error: ", error);
    };
}
// get all meeting details under one case
export const getAllMeetingsUnderOneCase = async (caseId) => {
    const collectionRef = collection(db, cons.meetingCollectionName);
    try {
        const initialQuery = query(collectionRef, where(cons.caseCollectionName, '==', caseId));
        const querySnapshot = await getDocs(initialQuery);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
        }));
    } catch (error) {
        console.log("Error: ", error);
    };
}
// get all documents under one case
export const getDocumentFromOneCase = async (case_id) => {
    const collectionRef = collection(db, cons.documentCollectionName);
    try {
        const initialQuery = query(collectionRef, where('case_id', '==', case_id));
        const querySnapshot = await getDocs(initialQuery);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
        }));
    } catch (error) {
        console.log("Error: ", error);
    }
}
// get all documents under one meeting of a case
export const getDocumentFromOneMeeting = async (meeting_id) => {
    const collectionRef = collection(db, cons.documentCollectionName);
    try {
        const initialQuery = query(collectionRef, where('meeting_id', '==', meeting_id));
        const querySnapshot = await getDocs(initialQuery);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
        }));
    } catch (error) {
        console.log("Error: ", error);
    }
}

export const getOneUserClient = async (name ,userId) => {
    try {
        const dataRef = doc(db, name, userId);
        const querySnapshot = await getDoc(dataRef);
        return {
            id: querySnapshot.id, 
            data: querySnapshot.data(),
        };
    } catch (error) {
        console.log('Error: ', error);
    }
}

export const getOneUserLawyer = async (name ,userId) => {
    try {
        const dataRef = doc(db, name, userId);
        const querySnapshot = await getDoc(dataRef);
        return {
            id: querySnapshot.id, 
            data: querySnapshot.data(),
        };
    } catch (error) {
        console.log('Error: ', error);
    }
}

export const getOneCase = async (case_id) => {
    try {
        const caseRef = doc(db, cons.caseCollectionName, case_id)
        const querySnapshot = await getDoc(caseRef)
        return {
            id: querySnapshot.id,
            data: querySnapshot.data(),
        };
    } catch (error) {
        console.log("Error: ", error);
    }
}

export const getOneMeeting = async (meeting_id) => {
    try {
        const meetingRef = doc(db, cons.meetingCollectionName, meeting_id)
        const querySnapshot = await getDoc(meetingRef)
        return {
            id: querySnapshot.id,
            data: querySnapshot.data(),
        };
    } catch (error) {
        console.log("Error: ", error);
    }
}

export const getAllCases = async () => {
    const collectionRef = collection(db, cons.caseCollectionName);
    try {
        const initialQuery = query(collectionRef);
        const querySnapshot = await getDocs(initialQuery);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
        }));
    } catch (error) {
        console.log("Error: ", error);
    };
}


