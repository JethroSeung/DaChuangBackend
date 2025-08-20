'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  Filter,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MobileTableColumn {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'badge' | 'actions'
  sortable?: boolean
  searchable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

interface MobileTableProps {
  data: any[]
  columns: MobileTableColumn[]
  title?: string
  searchable?: boolean
  filterable?: boolean
  onRowClick?: (row: any) => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  onView?: (row: any) => void
  loading?: boolean
  emptyMessage?: string
  className?: string
}

// Mobile-optimized table component
export function MobileTable({
  data,
  columns,
  title,
  searchable = true,
  filterable = false,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  loading = false,
  emptyMessage = 'No data available',
  className
}: MobileTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Filter and sort data
  const filteredData = React.useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchTerm) {
      const searchableColumns = columns.filter(col => col.searchable !== false)
      filtered = filtered.filter(row =>
        searchableColumns.some(col =>
          String(row[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [data, searchTerm, sortColumn, sortDirection, columns])

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId)
    } else {
      newExpanded.add(rowId)
    }
    setExpandedRows(newExpanded)
  }

  const primaryColumn = columns[0]
  const secondaryColumns = columns.slice(1)

  if (loading) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {(title || searchable) && (
        <CardHeader className="pb-3">
          {title && <CardTitle className="text-lg">{title}</CardTitle>}

          {searchable && (
            <div className="flex items-center space-x-2 mt-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {filterable && (
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className="p-0">
        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1 p-4">
              {filteredData.map((row, index) => {
                const rowId = row.id || index.toString()
                const isExpanded = expandedRows.has(rowId)

                return (
                  <MobileTableRow
                    key={rowId}
                    row={row}
                    primaryColumn={primaryColumn}
                    secondaryColumns={secondaryColumns}
                    isExpanded={isExpanded}
                    onToggleExpansion={() => toggleRowExpansion(rowId)}
                    onRowClick={onRowClick}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                  />
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

// Individual mobile table row component
function MobileTableRow({
  row,
  primaryColumn,
  secondaryColumns,
  isExpanded,
  onToggleExpansion,
  onRowClick,
  onEdit,
  onDelete,
  onView
}: {
  row: any
  primaryColumn: MobileTableColumn
  secondaryColumns: MobileTableColumn[]
  isExpanded: boolean
  onToggleExpansion: () => void
  onRowClick?: (row: any) => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  onView?: (row: any) => void
}) {
  const hasActions = onEdit || onDelete || onView
  const visibleColumns = secondaryColumns.filter(col => col.type !== 'actions')
  const showExpandButton = visibleColumns.length > 2

  return (
    <div className="border rounded-lg bg-card">
      {/* Main row content */}
      <div
        className={cn(
          'p-3 cursor-pointer transition-colors',
          onRowClick && 'hover:bg-accent/50'
        )}
        onClick={() => onRowClick?.(row)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {/* Primary column (always visible) */}
            <div className="flex items-center space-x-2">
              <div className="font-medium text-sm truncate">
                {renderCellValue(row[primaryColumn.key], primaryColumn, row)}
              </div>
            </div>

            {/* First 2 secondary columns (always visible on mobile) */}
            <div className="mt-1 space-y-1">
              {visibleColumns.slice(0, 2).map((column) => (
                <div key={column.key} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{column.label}:</span>
                  <span className="font-medium">
                    {renderCellValue(row[column.key], column, row)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-3">
            {/* Expand button */}
            {showExpandButton && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleExpansion()
                }}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Actions menu */}
            {hasActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem onClick={() => onView(row)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(row)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(row)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
      {/* Expanded content */}
      {isExpanded && visibleColumns.length > 2 && (
        <div className="border-t bg-muted/30 p-3 space-y-2">
          {visibleColumns.slice(2).map((column) => (
            <div key={column.key} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{column.label}:</span>
              <span className="font-medium">
                {renderCellValue(row[column.key], column, row)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper function to render cell values
function renderCellValue(value: any, column: MobileTableColumn, row: any) {
  if (column.render) {
    return column.render(value, row)
  }

  switch (column.type) {
    case 'badge':
      return (
        <Badge variant={getBadgeVariant(value)} className="text-xs">
          {value}
        </Badge>
      )
    case 'date':
      return new Date(value).toLocaleDateString()
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : value
    default:
      return value || '-'
  }
}

// Helper function to get badge variant based on value
function getBadgeVariant(value: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const lowerValue = String(value).toLowerCase()

  if (lowerValue.includes('authorized') || lowerValue.includes('active') || lowerValue.includes('healthy')) {
    return 'default'
  }
  if (lowerValue.includes('unauthorized') || lowerValue.includes('error') || lowerValue.includes('critical')) {
    return 'destructive'
  }
  if (lowerValue.includes('warning') || lowerValue.includes('low')) {
    return 'secondary'
  }

  return 'outline'
}

// Mobile-optimized data list component (alternative to table)
export function MobileDataList({
  data,
  renderItem,
  title,
  searchable = true,
  loading = false,
  emptyMessage = 'No items found',
  className
}: {
  data: any[]
  renderItem: (item: any, index: number) => React.ReactNode
  title?: string
  searchable?: boolean
  loading?: boolean
  emptyMessage?: string
  className?: string
}) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data

    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [data, searchTerm])

  if (loading) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {(title || searchable) && (
        <CardHeader className="pb-3">
          {title && <CardTitle className="text-lg">{title}</CardTitle>}

          {searchable && (
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className="p-0">
        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-4">
              {filteredData.map((item, index) => (
                <div key={index}>
                  {renderItem(item, index)}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
