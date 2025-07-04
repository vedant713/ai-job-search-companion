// Real-time Notification System
interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionText?: string
}

interface NotificationRule {
  id: string
  type: "interview_reminder" | "follow_up_due" | "application_deadline" | "skill_recommendation"
  enabled: boolean
  timing: number // minutes before event
}

export class NotificationService {
  private notifications: Notification[] = []
  private rules: NotificationRule[] = [
    { id: "1", type: "interview_reminder", enabled: true, timing: 60 },
    { id: "2", type: "follow_up_due", enabled: true, timing: 1440 }, // 24 hours
    { id: "3", type: "application_deadline", enabled: true, timing: 2880 }, // 48 hours
    { id: "4", type: "skill_recommendation", enabled: true, timing: 10080 }, // 1 week
  ]

  async checkAndSendNotifications(): Promise<void> {
    const now = new Date()

    // Check for interview reminders
    await this.checkInterviewReminders(now)

    // Check for follow-up reminders
    await this.checkFollowUpReminders(now)

    // Check for application deadlines
    await this.checkApplicationDeadlines(now)

    // Check for skill recommendations
    await this.checkSkillRecommendations(now)
  }

  private async checkInterviewReminders(now: Date): Promise<void> {
    const rule = this.rules.find((r) => r.type === "interview_reminder" && r.enabled)
    if (!rule) return

    // Get upcoming interviews from calendar
    const interviews = await calendarService.getUpcomingInterviews()

    interviews.forEach((interview) => {
      const timeDiff = interview.startTime.getTime() - now.getTime()
      const minutesUntil = Math.floor(timeDiff / (1000 * 60))

      if (minutesUntil <= rule.timing && minutesUntil > 0) {
        this.createNotification({
          title: "Interview Reminder",
          message: `Your interview "${interview.title}" starts in ${minutesUntil} minutes`,
          type: "info",
          actionUrl: "/dashboard/todos",
          actionText: "View Details",
        })
      }
    })
  }

  private async checkFollowUpReminders(now: Date): Promise<void> {
    // Check applications that need follow-up
    const applications = await this.getApplicationsNeedingFollowUp()

    applications.forEach((app) => {
      this.createNotification({
        title: "Follow-up Reminder",
        message: `Time to follow up on your application to ${app.company}`,
        type: "warning",
        actionUrl: "/dashboard/applications",
        actionText: "Send Follow-up",
      })
    })
  }

  private async checkApplicationDeadlines(now: Date): Promise<void> {
    // Check for approaching deadlines
    const deadlines = await this.getUpcomingDeadlines()

    deadlines.forEach((deadline) => {
      this.createNotification({
        title: "Application Deadline",
        message: `Application deadline for ${deadline.company} is approaching`,
        type: "warning",
        actionUrl: "/dashboard/applications",
        actionText: "Apply Now",
      })
    })
  }

  private async checkSkillRecommendations(now: Date): Promise<void> {
    // Weekly skill recommendations
    this.createNotification({
      title: "Skill Recommendation",
      message: "Based on job market trends, consider learning Docker and Kubernetes",
      type: "info",
      actionUrl: "/dashboard/skills",
      actionText: "View Skills",
    })
  }

  private createNotification(data: Omit<Notification, "id" | "timestamp" | "read">): void {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      ...data,
    }

    this.notifications.unshift(notification)

    // Send browser notification if permission granted
    this.sendBrowserNotification(notification)

    // In production, also send to database and real-time updates
    this.saveNotificationToDatabase(notification)
  }

  private sendBrowserNotification(notification: Notification): void {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: notification.id,
      })
    }
  }

  private async saveNotificationToDatabase(notification: Notification): Promise<void> {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification),
      })
    } catch (error) {
      console.error("Failed to save notification:", error)
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }
    return false
  }

  getNotifications(): Notification[] {
    return this.notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  private async getApplicationsNeedingFollowUp(): Promise<any[]> {
    // Mock data - in production, query database
    return [{ company: "Google", lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }]
  }

  private async getUpcomingDeadlines(): Promise<any[]> {
    // Mock data - in production, query database
    return [{ company: "Microsoft", deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) }]
  }
}

export const notificationService = new NotificationService()

// Import calendar service
import { calendarService } from "./calendar"
