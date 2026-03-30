const { google } = require('googleapis');
const calendar = google.calendar('v3');

// Initialize Google Auth
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/calendar']
});

/**
 * Create a Google Meet session with Calendar event
 * Returns Meet link and event ID
 */
async function createMeetSession(topic, dateTime, duration, attendeeEmails = []) {
  try {
    // Validate inputs
    if (!topic || !dateTime || !duration) {
      throw new Error('Missing required parameters: topic, dateTime, duration');
    }

    const authClient = await auth.getClient();

    const startDateTime = new Date(dateTime);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000); // duration in minutes

    const event = {
      summary: topic,
      description: `GapZero Learning Session: ${topic}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: process.env.TIMEZONE || 'UTC'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: process.env.TIMEZONE || 'UTC'
      },
      conferenceData: {
        createRequest: {
          requestId: `gapzero-${Date.now()}`,
          conferenceSolutionKey: {
            key: 'hangoutsMeet'
          }
        }
      },
      attendees: attendeeEmails.map(email => ({
        email: email,
        displayName: email,
        responseStatus: 'tentativeAccepted'
      })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'email', minutes: 30 }       // 30 minutes before
        ]
      }
    };

    const response = await calendar.events.insert(
      {
        auth: authClient,
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all'
      }
    );

    const meetLink = response.data.conferenceData?.entryPoints?.find(
      ep => ep.entryPointType === 'video'
    )?.uri;

    return {
      success: true,
      eventId: response.data.id,
      meetLink: meetLink || response.data.htmlLink,
      startTime: response.data.start.dateTime,
      endTime: response.data.end.dateTime,
      message: 'Meet session created successfully'
    };
  } catch (error) {
    console.error('Error creating Meet session:', error);
    throw new Error(`Failed to create Meet session: ${error.message}`);
  }
}

/**
 * Cancel a Meet session (delete calendar event)
 */
async function cancelMeetSession(eventId) {
  try {
    if (!eventId) {
      throw new Error('Event ID is required');
    }

    const authClient = await auth.getClient();

    await calendar.events.delete(
      {
        auth: authClient,
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId: eventId,
        sendUpdates: 'all'
      }
    );

    return {
      success: true,
      message: 'Meet session cancelled successfully'
    };
  } catch (error) {
    console.error('Error cancelling Meet session:', error);
    throw new Error(`Failed to cancel Meet session: ${error.message}`);
  }
}

/**
 * Get Meet session details
 */
async function getMeetSessionDetails(eventId) {
  try {
    if (!eventId) {
      throw new Error('Event ID is required');
    }

    const authClient = await auth.getClient();

    const response = await calendar.events.get(
      {
        auth: authClient,
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId: eventId
      }
    );

    const meetLink = response.data.conferenceData?.entryPoints?.find(
      ep => ep.entryPointType === 'video'
    )?.uri;

    return {
      success: true,
      eventId: response.data.id,
      summary: response.data.summary,
      meetLink: meetLink || response.data.htmlLink,
      startTime: response.data.start.dateTime,
      endTime: response.data.end.dateTime,
      description: response.data.description,
      attendees: response.data.attendees || []
    };
  } catch (error) {
    console.error('Error fetching Meet session details:', error);
    throw new Error(`Failed to fetch Meet session details: ${error.message}`);
  }
}

/**
 * Update Meet session (time, attendees, etc.)
 */
async function updateMeetSession(eventId, updates) {
  try {
    if (!eventId) {
      throw new Error('Event ID is required');
    }

    const authClient = await auth.getClient();

    // Get current event
    const currentEvent = await calendar.events.get(
      {
        auth: authClient,
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId: eventId
      }
    );

    // Apply updates
    if (updates.topic) {
      currentEvent.data.summary = updates.topic;
    }

    if (updates.dateTime) {
      const startDateTime = new Date(updates.dateTime);
      const duration = updates.duration || 60; // minutes
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

      currentEvent.data.start.dateTime = startDateTime.toISOString();
      currentEvent.data.end.dateTime = endDateTime.toISOString();
    }

    if (updates.attendeeEmails && Array.isArray(updates.attendeeEmails)) {
      currentEvent.data.attendees = updates.attendeeEmails.map(email => ({
        email: email,
        displayName: email
      }));
    }

    const response = await calendar.events.update(
      {
        auth: authClient,
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId: eventId,
        resource: currentEvent.data,
        sendUpdates: 'all'
      }
    );

    return {
      success: true,
      eventId: response.data.id,
      meetLink: response.data.htmlLink,
      message: 'Meet session updated successfully'
    };
  } catch (error) {
    console.error('Error updating Meet session:', error);
    throw new Error(`Failed to update Meet session: ${error.message}`);
  }
}

module.exports = {
  createMeetSession,
  cancelMeetSession,
  getMeetSessionDetails,
  updateMeetSession
};
