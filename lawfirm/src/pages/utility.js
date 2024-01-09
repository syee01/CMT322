import * as cons from "./constant"
import { db } from "../firebase"
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

export const getCaseTypeName = (caseTypeList, case_type_id) => {
    for (let i=0; i<caseTypeList.length; i++){
        if (caseTypeList[i].id === case_type_id){
            return caseTypeList[i].data.case_type_name
        }
    }
}
export const getLawyerName = (lawyerList, lawyer_id) => {
    for (let i=0; i<lawyerList.length; i++){
        if (lawyerList[i].id === lawyer_id){
            return lawyerList[i].data.fullname
        }
    }
}
export const getCaseStatusName = (caseStatusList, case_status_id) => {
    for (let i=0; i<caseStatusList.length; i++){
        if (caseStatusList[i].id === case_status_id){
            return caseStatusList[i].data.case_status_name
        }
    }
}

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

