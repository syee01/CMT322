import ApiCalendar from 'react-google-calendar-api';
  
const config = {
    "clientId": '1066631153230-6bajraku2jr8eu5ankrab26td36shqi1.apps.googleusercontent.com',
    "apiKey": 'AIzaSyDMyzez8LTmAPDAMCN4-j1p3nL0HLGidrU',
    "scope": "https://www.googleapis.com/auth/calendar",
    "discoveryDocs": [
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
    ]
}

export const timeZone = "GMT+8"
export const apiCalendar = new ApiCalendar(config);
