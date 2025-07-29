'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUAVStore } from '@/stores/uav-store'
import { UAV, UAVStatus, CreateUAVRequest } from '@/types/uav'
import { Loader2 } from 'lucide-react'

const uavFormSchema = z.object({
  rfidTag: z.string().min(3, 'RFID tag must be at least 3 characters').max(50, 'RFID tag must be less than 50 characters'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters').max(100, 'Owner name must be less than 100 characters'),
  model: z.string().min(2, 'Model must be at least 2 characters').max(100, 'Model must be less than 100 characters'),
  status: z.enum(['AUTHORIZED', 'UNAUTHORIZED']),
  inHibernatePod: z.boolean().optional(),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  weightKg: z.number().positive().optional(),
  maxFlightTimeMinutes: z.number().positive().optional(),
  maxAltitudeMeters: z.number().positive().optional(),
  maxSpeedKmh: z.number().positive().optional(),
})

type UAVFormData = z.infer<typeof uavFormSchema>

interface UAVFormProps {
  uav?: UAV
  onSuccess: () => void
  onCancel: () => void
}

export function UAVForm({ uav, onSuccess, onCancel }: UAVFormProps) {
  const { createUAV, updateUAV, loading, regions, fetchRegions } = useUAVStore()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UAVFormData>({
    resolver: zodResolver(uavFormSchema),
    defaultValues: {
      rfidTag: uav?.rfidTag || '',
      ownerName: uav?.ownerName || '',
      model: uav?.model || '',
      status: uav?.status || 'UNAUTHORIZED',
      inHibernatePod: uav?.inHibernatePod || false,
      serialNumber: uav?.serialNumber || '',
      manufacturer: uav?.manufacturer || '',
      weightKg: uav?.weightKg || undefined,
      maxFlightTimeMinutes: uav?.maxFlightTimeMinutes || undefined,
      maxAltitudeMeters: uav?.maxAltitudeMeters || undefined,
      maxSpeedKmh: uav?.maxSpeedKmh || undefined,
    },
  })

  useEffect(() => {
    fetchRegions()
  }, [fetchRegions])

  const onSubmit = async (data: UAVFormData) => {
    try {
      const formData: CreateUAVRequest = {
        rfidTag: data.rfidTag,
        ownerName: data.ownerName,
        model: data.model,
        status: data.status as UAVStatus,
        inHibernatePod: data.inHibernatePod,
        serialNumber: data.serialNumber || undefined,
        manufacturer: data.manufacturer || undefined,
        weightKg: data.weightKg,
        maxFlightTimeMinutes: data.maxFlightTimeMinutes,
        maxAltitudeMeters: data.maxAltitudeMeters,
        maxSpeedKmh: data.maxSpeedKmh,
      }

      let success = false
      if (uav) {
        success = await updateUAV(uav.id, formData)
      } else {
        success = await createUAV(formData)
      }

      if (success) {
        onSuccess()
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Essential UAV identification and ownership details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rfidTag">RFID Tag *</Label>
              <Input
                id="rfidTag"
                {...register('rfidTag')}
                placeholder="UAV-001"
                className={errors.rfidTag ? 'border-red-500' : ''}
              />
              {errors.rfidTag && (
                <p className="text-sm text-red-500">{errors.rfidTag.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name *</Label>
              <Input
                id="ownerName"
                {...register('ownerName')}
                placeholder="John Doe"
                className={errors.ownerName ? 'border-red-500' : ''}
              />
              {errors.ownerName && (
                <p className="text-sm text-red-500">{errors.ownerName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                {...register('model')}
                placeholder="DJI Phantom 4"
                className={errors.model ? 'border-red-500' : ''}
              />
              {errors.model && (
                <p className="text-sm text-red-500">{errors.model.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Authorization Status *</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as UAVStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTHORIZED">Authorized</SelectItem>
                  <SelectItem value="UNAUTHORIZED">Unauthorized</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="inHibernatePod"
                checked={watch('inHibernatePod')}
                onCheckedChange={(checked) => setValue('inHibernatePod', !!checked)}
              />
              <Label htmlFor="inHibernatePod">Currently in Hibernate Pod</Label>
            </div>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Specifications</CardTitle>
            <CardDescription>
              Optional technical details and performance specifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                {...register('serialNumber')}
                placeholder="SN123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                {...register('manufacturer')}
                placeholder="DJI"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weightKg">Weight (kg)</Label>
              <Input
                id="weightKg"
                type="number"
                step="0.1"
                {...register('weightKg', { valueAsNumber: true })}
                placeholder="1.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxFlightTimeMinutes">Max Flight Time (minutes)</Label>
              <Input
                id="maxFlightTimeMinutes"
                type="number"
                {...register('maxFlightTimeMinutes', { valueAsNumber: true })}
                placeholder="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAltitudeMeters">Max Altitude (meters)</Label>
              <Input
                id="maxAltitudeMeters"
                type="number"
                {...register('maxAltitudeMeters', { valueAsNumber: true })}
                placeholder="500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxSpeedKmh">Max Speed (km/h)</Label>
              <Input
                id="maxSpeedKmh"
                type="number"
                {...register('maxSpeedKmh', { valueAsNumber: true })}
                placeholder="60"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center space-x-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{uav ? 'Update UAV' : 'Create UAV'}</span>
        </Button>
      </div>
    </form>
  )
}
