'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUAVStore } from '@/stores/uav-store'
import { UAV, UAVStatus, UAVFormData } from '@/types/uav'
import { Loader2 } from 'lucide-react'



interface UAVFormProps {
  uav?: UAV
  onSuccess: () => void
  onCancel: () => void
}

export function UAVForm({ uav, onSuccess, onCancel }: UAVFormProps) {
  const { createUAV, updateUAVById, loading } = useUAVStore()
  const { t } = useTranslation(['uav', 'forms', 'common'])

  // Create validation schema with translations
  const uavFormSchema = z.object({
    rfidTag: z.string().min(3, t('forms:validation.minLength', { min: 3 })).max(50, t('forms:validation.maxLength', { max: 50 })),
    status: z.enum(['AUTHORIZED', 'UNAUTHORIZED', 'ACTIVE', 'HIBERNATING', 'CHARGING', 'MAINTENANCE', 'ERROR', 'EMERGENCY', 'OFFLINE']),
    inHibernatePod: z.boolean().optional(),
    batteryLevel: z.number().min(0).max(100).optional(),
    region: z.string().optional(),
  })

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
      status: uav?.status || 'UNAUTHORIZED',
      inHibernatePod: uav?.inHibernatePod || false,
      batteryLevel: uav?.batteryLevel || 0,
      region: uav?.region || '',
    },
  })

  const onSubmit = async (data: UAVFormData) => {
    try {
      const formData: UAVFormData = {
        rfidTag: data.rfidTag,
        status: data.status as UAVStatus,
        inHibernatePod: data.inHibernatePod,
        batteryLevel: data.batteryLevel,
        region: data.region || undefined,
      }

      let result = null
      if (uav) {
        result = await updateUAVById(uav.id, formData)
      } else {
        result = await createUAV(formData)
      }

      if (result) {
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
            <CardTitle>{t('uav:basicInformation')}</CardTitle>
            <CardDescription>
              {t('uav:basicInfoDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rfidTag">{t('uav:rfidTag')} *</Label>
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
              <Label htmlFor="batteryLevel">Battery Level (%)</Label>
              <Input
                id="batteryLevel"
                type="number"
                min="0"
                max="100"
                {...register('batteryLevel', { valueAsNumber: true })}
                placeholder="85"
              />
              {errors.batteryLevel && (
                <p className="text-sm text-red-500">{errors.batteryLevel.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                {...register('region')}
                placeholder="North Zone"
              />
              {errors.region && (
                <p className="text-sm text-red-500">{errors.region.message}</p>
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


      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('common:cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center space-x-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{uav ? t('uav:editUAV') : t('uav:createUAV')}</span>
        </Button>
      </div>
    </form>
  )
}
