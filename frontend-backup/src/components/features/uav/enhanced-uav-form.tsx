'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnhancedInput } from '@/components/ui/enhanced-input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Plane,
  User,
  Settings,
  Battery,
  Gauge,
  X
} from 'lucide-react'
import { useUAVStore } from '@/stores/uav-store'
import { UAV, UAVStatus, CreateUAVRequest } from '@/types/uav'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

// Enhanced validation schema with better error messages
const enhancedUAVFormSchema = z.object({
  rfidTag: z.string()
    .min(3, 'RFID tag must be at least 3 characters')
    .max(50, 'RFID tag must be less than 50 characters')
    .regex(/^[A-Z0-9-]+$/, 'RFID tag must contain only uppercase letters, numbers, and hyphens'),
  ownerName: z.string()
    .min(2, 'Owner name must be at least 2 characters')
    .max(100, 'Owner name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Owner name must contain only letters and spaces'),
  model: z.string()
    .min(2, 'Model must be at least 2 characters')
    .max(100, 'Model must be less than 100 characters'),
  status: z.enum(['AUTHORIZED', 'UNAUTHORIZED'], {
    errorMap: () => ({ message: 'Please select a valid status' })
  }),
  inHibernatePod: z.boolean().optional(),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  weightKg: z.number()
    .positive('Weight must be a positive number')
    .max(1000, 'Weight cannot exceed 1000kg')
    .optional(),
  maxFlightTimeMinutes: z.number()
    .positive('Flight time must be a positive number')
    .max(1440, 'Flight time cannot exceed 24 hours')
    .optional(),
  maxAltitudeMeters: z.number()
    .positive('Altitude must be a positive number')
    .max(10000, 'Altitude cannot exceed 10,000 meters')
    .optional(),
  maxSpeedKmh: z.number()
    .positive('Speed must be a positive number')
    .max(500, 'Speed cannot exceed 500 km/h')
    .optional(),
})

type UAVFormData = z.infer<typeof enhancedUAVFormSchema>

interface EnhancedUAVFormProps {
  uav?: UAV
  onSuccess: () => void
  onCancel?: () => void
}

export function EnhancedUAVForm({ uav, onSuccess, onCancel }: EnhancedUAVFormProps) {
  const { createUAV, updateUAV, isLoading, error } = useUAVStore()
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
        if (success) {
          toast.success('UAV updated successfully')
        }
      } else {
        success = await createUAV(formData)
        if (success) {
          toast.success('UAV created successfully')
        }
      }

      if (success) {
        reset()
        onSuccess()
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Failed to save UAV. Please try again.')
    }
  }, [uav, createUAV, updateUAV, reset, onSuccess])

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
                Essential UAV identification and ownership details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EnhancedInput
                label="RFID Tag"
                placeholder="UAV-001"
                error={errors.rfidTag?.message}
                helperText="Unique identifier for the UAV (uppercase letters, numbers, and hyphens only)"
                required
                {...register('rfidTag')}
              />

              <EnhancedInput
                label="Owner Name"
                placeholder="John Doe"
                error={errors.ownerName?.message}
                helperText="Full name of the UAV owner"
                required
                {...register('ownerName')}
              />

              <EnhancedInput
                label="Model"
                placeholder="DJI Phantom 4"
                error={errors.model?.message}
                helperText="UAV model and variant"
                required
                {...register('model')}
              />

              <div className="space-y-2">
                <Label htmlFor="status">Authorization Status *</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className={errors.status ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select authorization status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AUTHORIZED">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Authorized
                          </div>
                        </SelectItem>
                        <SelectItem value="UNAUTHORIZED">
                          <div className="flex items-center gap-2">
                            <X className="h-4 w-4 text-red-600" />
                            Unauthorized
                          </div>
                        </SelectItem>
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

        {/* Step 2: Technical Details */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Technical Details
              </CardTitle>
              <CardDescription>
                Optional technical specifications and performance data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EnhancedInput
                  label="Serial Number"
                  placeholder="SN123456789"
                  error={errors.serialNumber?.message}
                  helperText="Manufacturer serial number"
                  {...register('serialNumber')}
                />

                <EnhancedInput
                  label="Manufacturer"
                  placeholder="DJI"
                  error={errors.manufacturer?.message}
                  {...register('manufacturer')}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Performance Specifications
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EnhancedInput
                    type="number"
                    label="Weight (kg)"
                    placeholder="2.5"
                    error={errors.weightKg?.message}
                    helperText="Total weight including battery"
                    {...register('weightKg', { valueAsNumber: true })}
                  />

                  <EnhancedInput
                    type="number"
                    label="Max Flight Time (minutes)"
                    placeholder="30"
                    error={errors.maxFlightTimeMinutes?.message}
                    helperText="Maximum flight duration"
                    {...register('maxFlightTimeMinutes', { valueAsNumber: true })}
                  />

                  <EnhancedInput
                    type="number"
                    label="Max Altitude (meters)"
                    placeholder="500"
                    error={errors.maxAltitudeMeters?.message}
                    helperText="Maximum operating altitude"
                    {...register('maxAltitudeMeters', { valueAsNumber: true })}
                  />

                  <EnhancedInput
                    type="number"
                    label="Max Speed (km/h)"
                    placeholder="65"
                    error={errors.maxSpeedKmh?.message}
                    helperText="Maximum horizontal speed"
                    {...register('maxSpeedKmh', { valueAsNumber: true })}
                  />
                </div>
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
