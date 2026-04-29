/**
 * Google Calendar Integration Service
 * 
 * Uses the Google Identity Services (GSI) library for OAuth2 token management.
 * 
 * SCALE TIP: For production, move token management to a backend (Node/Express)
 * to securely handle Refresh Tokens. Currently uses implicit-style token client for demo simplicity.
 */
declare const google: any;


const CLIENT_ID = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let accessTokenCache: string | null = null;
let tokenExpiry: number | null = null;

export const getAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!CLIENT_ID) {
      reject(new Error("Please configure VITE_GOOGLE_CLIENT_ID in your environment variables."));
      return;
    }

    if (accessTokenCache && tokenExpiry && Date.now() < tokenExpiry) {
      resolve(accessTokenCache);
      return;
    }

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
          if (response.access_token) {
            accessTokenCache = response.access_token;
            // Token usually expires in 1 hour (3600 seconds), set buffer to 55 mins
            tokenExpiry = Date.now() + 55 * 60 * 1000; 
            resolve(response.access_token);
          } else {
            reject(new Error('Failed to get access token: ' + (response.error || 'Unknown error')));
          }
        },
      });
      client.requestAccessToken();
    } catch (error) {
      reject(error);
    }
  });
};

export const addAppointmentToCalendar = async (
  title: string,
  startTime: Date,
  endTime: Date,
  description: string
) => {
  const token = await getAccessToken();

  const event = {
    summary: title,
    description: description,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error('Failed to create calendar event: ' + (errorData.error?.message || response.statusText));
  }

  return await response.json();
};
