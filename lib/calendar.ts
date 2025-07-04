// Calendar Integration
interface CalendarEvent {
  id: string
  title: string
  description: string
  startTime: Date
  endTime: Date
  location?: string
  attendees?: string[]
  type: "interview" | "follow-up" | "deadline"
}

interface InterviewEvent {
  companyName: string
  position: string
  interviewType: string
  date: Date
  duration: number
  location: string
  interviewerName?: string
  interviewerEmail?: string
}

export class CalendarService {
  async createInterviewEvent(interview: InterviewEvent): Promise<string> {
    const event: CalendarEvent = {
      id: `interview-${Date.now()}`,
      title: `${interview.interviewType} Interview - ${interview.position} at ${interview.companyName}`,
      description: `Interview for ${interview.position} position at ${interview.companyName}\nType: ${interview.interviewType}\nLocation: ${interview.location}`,
      startTime: interview.date,
      endTime: new Date(interview.date.getTime() + interview.duration * 60000),
      location: interview.location,
      attendees: interview.interviewerEmail ? [interview.interviewerEmail] : [],
      type: "interview",
    }

    // In production, integrate with Google Calendar API
    /*
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: event.title,
        description: event.description,
        start: { dateTime: event.startTime.toISOString() },
        end: { dateTime: event.endTime.toISOString() },
        location: event.location,
        attendees: event.attendees?.map(email => ({ email })),
      }),
    })
    */

    console.log("Calendar event created:", event)
    return event.id
  }

  generateCalendarLink(event: CalendarEvent): string {
    const startTime = event.startTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    const endTime = event.endTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      dates: `${startTime}/${endTime}`,
      details: event.description,
      location: event.location || "",
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  async getUpcomingInterviews(): Promise<CalendarEvent[]> {
    // Mock data - in production, fetch from Google Calendar API
    return [
      {
        id: "1",
        title: "Technical Interview - Senior Developer at Google",
        description: "System design and coding interview",
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
        location: "Google Meet",
        type: "interview",
      },
    ]
  }
}

export const calendarService = new CalendarService()
