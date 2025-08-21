'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

import { Badge } from '@/components/ui/badge'
import {
  Save,
  Loader2,
  AlertTriangle,
  Plane,
  User,
  Settings
} from 'lucide-react'
import { useUAVStore } from '@/stores/uav-store'
import { UAV, UAVStatus, UAVFormData } from '@/types/uav'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { toast } from 'react-hot-toast'


// Enhanced validation schema with better error messages
const enhancedUAVFormSchema = z.object({
  rfidTag: z.string()
    .min(3, 'RFID tag must be at least 3 characters')
    .max(50, 'RFID tag must be less than 50 characters')
    .regex(/^[A-Z0-9-]+$/, 'RFID tag must contain only uppercase letters, numbers, and hyphens'),
  status: z.enum(['AUTHORIZED', 'UNAUTHORIZED', 'ACTIVE', 'HIBERNATING', 'CHARGING', 'MAINTENANCE', 'ERROR', 'EMERGENCY', 'OFFLINE'], {
    message: 'Please select a valid status'
  }),
  inHibernatePod: z.boolean().optional(),
  batteryLevel: z.number()
    .min(0, 'Battery level cannot be negative')
    .max(100, 'Battery level cannot exceed 100%')
    .optional(),
  region: z.string().optional(),
})


interface EnhancedUAVFormProps {
  uav?: UAV
  onSuccess: () => void
  onCancel?: () => void
}

export function EnhancedUAVForm({ uav, onSuccess, onCancel }: EnhancedUAVFormProps) {
  const { createUAV, updateUAVById, loading, error } = useUAVStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [formProgress, setFormProgress] = useState(0)
  const [isDirty, setIsDirty] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting, isValid, dirtyFields },
    trigger,
    reset,
  } = useForm<UAVFormData>({
    resolver: zodResolver(enhancedUAVFormSchema),
    defaultValues: {
      rfidTag: uav?.rfidTag || '',
      status: uav?.status || 'UNAUTHORIZED',
      inHibernatePod: uav?.inHibernatePod || false,
      batteryLevel: uav?.batteryLevel || 0,
      region: uav?.region || '',
    },
    mode: 'onChange',
  })

  const watchedFields = watch()

  // Calculate form progress
  useEffect(() => {
    const totalFields = Object.keys(enhancedUAVFormSchema.shape).length
    const filledFields = Object.values(watchedFields).filter(value => 
      value !== '' && value !== undefined && value !== null
    ).length
    setFormProgress((filledFields / totalFields) * 100)
  }, [watchedFields])

  // Track if form is dirty
  useEffect(() => {
    setIsDirty(Object.keys(dirtyFields).length > 0)
  }, [dirtyFields])

  const onSubmit = useCallback(async (data: UAVFormData) => {
    try {
      const formData: UAVFormData = {
        rfidTag: data.rfidTag,
        status: data.status as UAVStatus,
        inHibernatePod: data.inHibernatePod || false,
        batteryLevel: data.batteryLevel || 0,
        region: data.region || undefined,
      }

      let result = null
      if (uav) {
        result = await updateUAVById(uav.id, formData)
        if (result) {
          toast.success('UAV updated successfully')
        }
      } else {
        result = await createUAV(formData)
        if (result) {
          toast.success('UAV created successfully')
        }
      }

      if (result) {
        reset()
        onSuccess()
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Failed to save UAV. Please try again.')
    }
  }, [uav, createUAV, updateUAVById, reset, onSuccess])

  const handleCancel = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel?')
      if (!confirmed) return
    }
    reset()
    onCancel?.()
  }, [isDirty, reset, onCancel])

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ['rfidTag', 'ownerName', 'model', 'status'] 
      : []
    
    const isStepValid = await trigger(fieldsToValidate as any)
    if (isStepValid) {
      setCurrentStep(2)
    }
  }

  const prevStep = () => {
    setCurrentStep(1)
  }

  return (
    <ErrorBoundary>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Progress indicator */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  {uav ? 'Edit UAV' : 'Register New UAV'}
                </CardTitle>
                <CardDescription>
                  {uav ? 'Update UAV information' : 'Add a new UAV to the fleet'}
                </CardDescription>
              </div>
              <Badge variant={currentStep === 1 ? "default" : "secondary"}>
                Step {currentStep} of 2
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Form Progress</span>
                <span>{Math.round(formProgress)}%</span>
              </div>
              <Progress value={formProgress} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential UAV identification and status details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rfidTag">RFID Tag *</Label>
                <Input
                  id="rfidTag"
                  placeholder="UAV-001"
                  {...register('rfidTag')}
                />
                {errors.rfidTag?.message && (
                  <p className="text-sm text-destructive">{errors.rfidTag.message}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Unique identifier for the UAV (uppercase letters, numbers, and hyphens only)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className={errors.status ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AUTHORIZED">Authorized</SelectItem>
                        <SelectItem value="UNAUTHORIZED">Unauthorized</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="HIBERNATING">Hibernating</SelectItem>
                        <SelectItem value="CHARGING">Charging</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        <SelectItem value="ERROR">Error</SelectItem>
                        <SelectItem value="EMERGENCY">Emergency</SelectItem>
                        <SelectItem value="OFFLINE">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="inHibernatePod"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="hibernatePod"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="hibernatePod">Currently in hibernate pod</Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Additional Details */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Additional Details
              </CardTitle>
              <CardDescription>
                Optional battery and location information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batteryLevel">Battery Level (%)</Label>
                <Input
                  id="batteryLevel"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="85"
                  {...register('batteryLevel', { valueAsNumber: true })}
                />
                {errors.batteryLevel?.message && (
                  <p className="text-sm text-destructive">{errors.batteryLevel.message}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Current battery charge level (0-100%)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  placeholder="North Zone"
                  {...register('region')}
                />
                {errors.region?.message && (
                  <p className="text-sm text-destructive">{errors.region.message}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Assigned operational region
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <div className="flex gap-2">
            {currentStep === 2 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}
            
            {currentStep === 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isValid}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {uav ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {uav ? 'Update UAV' : 'Create UAV'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </ErrorBoundary>
  )
}
