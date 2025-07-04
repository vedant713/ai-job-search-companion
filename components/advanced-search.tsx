"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Filter, X, CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface SearchFilters {
  query: string
  status: string
  dateFrom: Date | undefined
  dateTo: Date | undefined
  company: string
  role: string
  location: string
  salaryMin: string
  salaryMax: string
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  onClear: () => void
  placeholder?: string
  showFilters?: boolean
}

export function AdvancedSearch({
  onSearch,
  onClear,
  placeholder = "Search applications...",
  showFilters = true,
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    status: "all",
    dateFrom: undefined,
    dateTo: undefined,
    company: "",
    role: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleClear = () => {
    const clearedFilters: SearchFilters = {
      query: "",
      status: "all",
      dateFrom: undefined,
      dateTo: undefined,
      company: "",
      role: "",
      location: "",
      salaryMin: "",
      salaryMax: "",
    }
    setFilters(clearedFilters)
    onClear()
  }

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.query) count++
    if (filters.status !== "all") count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    if (filters.company) count++
    if (filters.role) count++
    if (filters.location) count++
    if (filters.salaryMin) count++
    if (filters.salaryMax) count++
    return count
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Advanced Search
            </CardTitle>
            <CardDescription>Find applications with powerful filters</CardDescription>
          </div>
          {showFilters && (
            <Button variant="outline" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={filters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
          {getActiveFiltersCount() > 0 && (
            <Button variant="outline" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && showFilters && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Interviewing">Interviewing</SelectItem>
                    <SelectItem value="Offer">Offer</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Company Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Input
                  placeholder="Filter by company"
                  value={filters.company}
                  onChange={(e) => updateFilter("company", e.target.value)}
                />
              </div>

              {/* Role Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Input
                  placeholder="Filter by role"
                  value={filters.role}
                  onChange={(e) => updateFilter("role", e.target.value)}
                />
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Filter by location"
                  value={filters.location}
                  onChange={(e) => updateFilter("location", e.target.value)}
                />
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date From</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => updateFilter("dateFrom", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date To</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => updateFilter("dateTo", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Salary Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Salary Range</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Min salary"
                  value={filters.salaryMin}
                  onChange={(e) => updateFilter("salaryMin", e.target.value)}
                />
                <span className="flex items-center px-2">to</span>
                <Input
                  placeholder="Max salary"
                  value={filters.salaryMax}
                  onChange={(e) => updateFilter("salaryMax", e.target.value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSearch} className="flex-1">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Clear All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
