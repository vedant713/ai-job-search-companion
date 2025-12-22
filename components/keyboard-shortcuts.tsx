"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Keyboard, Command } from "lucide-react"
import { useRouter } from "next/navigation"

interface Shortcut {
  key: string
  description: string
  action: () => void
}

export function KeyboardShortcuts() {
  const [showDialog, setShowDialog] = useState(false)
  const router = useRouter()

  const shortcuts: Shortcut[] = [
    {
      key: "Ctrl+K",
      description: "Open command palette",
      action: () => setShowDialog(true),
    },
    {
      key: "Ctrl+1",
      description: "Go to Dashboard",
      action: () => router.push("/dashboard"),
    },
    {
      key: "Ctrl+2",
      description: "Go to Applications",
      action: () => router.push("/dashboard/applications"),
    },
    {
      key: "Ctrl+3",
      description: "Go to Skills",
      action: () => router.push("/dashboard/skills"),
    },
    {
      key: "Ctrl+4",
      description: "Go to Tasks",
      action: () => router.push("/dashboard/todos"),
    },
    {
      key: "Ctrl+5",
      description: "Go to AI Assistant",
      action: () => router.push("/dashboard/ai-assistant"),
    },
    {
      key: "Ctrl+N",
      description: "Add new application",
      action: () => {
        // This would trigger the add application dialog
        const event = new CustomEvent("openAddDialog", { detail: "application" })
        window.dispatchEvent(event)
      },
    },
    {
      key: "Ctrl+T",
      description: "Add new task",
      action: () => {
        const event = new CustomEvent("openAddDialog", { detail: "task" })
        window.dispatchEvent(event)
      },
    },
    {
      key: "Ctrl+S",
      description: "Add new skill",
      action: () => {
        const event = new CustomEvent("openAddDialog", { detail: "skill" })
        window.dispatchEvent(event)
      },
    },
    {
      key: "Escape",
      description: "Close dialogs/modals",
      action: () => {
        const event = new CustomEvent("closeDialogs")
        window.dispatchEvent(event)
      },
    },
    {
      key: "?",
      description: "Show keyboard shortcuts",
      action: () => setShowDialog(true),
    },
  ]

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }

      const shortcut = shortcuts.find((s) => {
        const keys = s.key.toLowerCase().split("+")
        const hasCtrl = keys.includes("ctrl") && (event.ctrlKey || event.metaKey)
        const hasShift = keys.includes("shift") && event.shiftKey
        const hasAlt = keys.includes("alt") && event.altKey
        const mainKey = keys[keys.length - 1]

        if (s.key === "?") {
          return event.key === "?" && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey
        }

        if (s.key === "Escape") {
          return event.key === "Escape"
        }

        if (keys.includes("ctrl")) {
          return hasCtrl && event.key.toLowerCase() === mainKey && !hasShift && !hasAlt
        }

        return event.key.toLowerCase() === mainKey && !hasCtrl && !hasShift && !hasAlt
      })

      if (shortcut) {
        event.preventDefault()
        shortcut.action()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, []) // Removed shortcuts from the dependency array

  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Keyboard className="mr-2 h-4 w-4" />
            Shortcuts
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>Use these shortcuts to navigate faster</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">{shortcut.description}</span>
                  <Badge variant="outline" className="font-mono">
                    {shortcut.key}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
