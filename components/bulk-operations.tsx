"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Mail } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface BulkOperationsProps {
  selectedItems: string[]
  onSelectAll: (selected: boolean) => void
  onSelectItem: (id: string, selected: boolean) => void
  onBulkDelete: (ids: string[]) => Promise<void>
  onBulkStatusUpdate: (ids: string[], status: string) => Promise<void>
  onBulkEmailSend: (ids: string[]) => Promise<void>
  totalItems: number
  itemType: string
}

export function BulkOperations({
  selectedItems,
  onSelectAll,
  onSelectItem,
  onBulkDelete,
  onBulkStatusUpdate,
  onBulkEmailSend,
  totalItems,
  itemType,
}: BulkOperationsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    try {
      await onBulkDelete(selectedItems)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkStatusUpdate = async (status: string) => {
    setIsUpdating(true)
    try {
      await onBulkStatusUpdate(selectedItems, status)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBulkEmailSend = async () => {
    setIsSendingEmail(true)
    try {
      await onBulkEmailSend(selectedItems)
    } finally {
      setIsSendingEmail(false)
    }
  }

  if (selectedItems.length === 0) {
    return null
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedItems.length} of {totalItems} {itemType} selected
            </span>
            <Button variant="outline" size="sm" onClick={() => onSelectAll(false)}>
              Clear Selection
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {itemType === "applications" && (
              <>
                <Select onValueChange={handleBulkStatusUpdate}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Interviewing">Interviewing</SelectItem>
                    <SelectItem value="Offer">Offer</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={handleBulkEmailSend} disabled={isSendingEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </>
            )}

            {itemType === "tasks" && (
              <Select onValueChange={handleBulkStatusUpdate}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedItems.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {selectedItems.length} {itemType}. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
