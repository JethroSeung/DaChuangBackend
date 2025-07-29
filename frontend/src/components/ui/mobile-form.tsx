'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  X, 
  Check,
  AlertCircle,
  Info
} from 'lucide-react'
import { EnhancedInput, EnhancedTextarea } from './enhanced-input'

interface MobileFormStep {
  id: string
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  fields: string[]
  validation?: (data: any) => string[]
}

interface MobileFormProps {
  steps: MobileFormStep[]
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
  initialData?: any
  isLoading?: boolean
  className?: string
}

// Mobile-optimized multi-step form
export function MobileForm({ 
  steps, 
  onSubmit, 
  onCancel, 
  initialData = {}, 
  isLoading = false,
  className 
}: MobileFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const currentStepData = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const progress = ((currentStep + 1) / steps.length) * 100

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateCurrentStep = () => {
    if (!currentStepData.validation) return true

    const stepErrors = currentStepData.validation(formData)
    const newErrors: Record<string, string> = {}
    
    stepErrors.forEach(error => {
      const [field, message] = error.split(':')
      newErrors[field] = message
    })

    setErrors(newErrors)
    return stepErrors.length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep() && !isLastStep) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (validateCurrentStep()) {
      try {
        await onSubmit(formData)
      } catch (error) {
        console.error('Form submission error:', error)
      }
    }
  }

  return (
    <div className={cn('max-w-md mx-auto', className)}>
      {/* Progress Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
              {currentStepData.description && (
                <CardDescription className="text-sm mt-1">
                  {currentStepData.description}
                </CardDescription>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Form Content */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                  index < currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : index === currentStep 
                    ? 'bg-primary/20 text-primary border-2 border-primary' 
                    : 'bg-muted text-muted-foreground'
                )}>
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    'w-8 h-0.5 mx-1',
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {currentStepData.fields.map((field) => (
              <MobileFormField
                key={field}
                field={field}
                value={formData[field]}
                error={errors[field]}
                touched={touched[field]}
                onChange={(value) => updateField(field, value)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4 space-x-3">
        <Button
          variant="outline"
          onClick={onCancel || handlePrevious}
          disabled={isLoading}
          className="flex-1"
        >
          {isFirstStep ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </>
          )}
        </Button>

        <Button
          onClick={isLastStep ? handleSubmit : handleNext}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving...
            </>
          ) : isLastStep ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Submit
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Mobile-optimized form field component
function MobileFormField({ 
  field, 
  value, 
  error, 
  touched, 
  onChange 
}: {
  field: string
  value: any
  error?: string
  touched?: boolean
  onChange: (value: any) => void
}) {
  // Field configuration - in a real app, this would come from props or config
  const fieldConfig = getFieldConfig(field)

  if (fieldConfig.type === 'textarea') {
    return (
      <EnhancedTextarea
        label={fieldConfig.label}
        placeholder={fieldConfig.placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        error={touched && error ? error : undefined}
        helperText={fieldConfig.helperText}
        required={fieldConfig.required}
        rows={3}
      />
    )
  }

  if (fieldConfig.type === 'select') {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {fieldConfig.label}
          {fieldConfig.required && <span className="text-destructive ml-1">*</span>}
        </label>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full h-10 px-3 py-2 text-sm border rounded-md bg-background',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            touched && error && 'border-destructive'
          )}
        >
          <option value="">{fieldConfig.placeholder}</option>
          {fieldConfig.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {touched && error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        {fieldConfig.helperText && !error && (
          <p className="text-sm text-muted-foreground">
            {fieldConfig.helperText}
          </p>
        )}
      </div>
    )
  }

  return (
    <EnhancedInput
      type={fieldConfig.type}
      label={fieldConfig.label}
      placeholder={fieldConfig.placeholder}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      error={touched && error ? error : undefined}
      helperText={fieldConfig.helperText}
      required={fieldConfig.required}
      showPasswordToggle={fieldConfig.type === 'password'}
    />
  )
}

// Field configuration helper
function getFieldConfig(field: string) {
  const configs: Record<string, any> = {
    rfidTag: {
      type: 'text',
      label: 'RFID Tag',
      placeholder: 'UAV-001',
      required: true,
      helperText: 'Unique identifier for the UAV'
    },
    ownerName: {
      type: 'text',
      label: 'Owner Name',
      placeholder: 'John Doe',
      required: true,
      helperText: 'Full name of the UAV owner'
    },
    model: {
      type: 'text',
      label: 'Model',
      placeholder: 'DJI Phantom 4',
      required: true,
      helperText: 'UAV model and variant'
    },
    status: {
      type: 'select',
      label: 'Authorization Status',
      placeholder: 'Select status',
      required: true,
      options: [
        { value: 'AUTHORIZED', label: 'Authorized' },
        { value: 'UNAUTHORIZED', label: 'Unauthorized' }
      ]
    },
    serialNumber: {
      type: 'text',
      label: 'Serial Number',
      placeholder: 'SN123456789',
      required: false,
      helperText: 'Manufacturer serial number'
    },
    manufacturer: {
      type: 'text',
      label: 'Manufacturer',
      placeholder: 'DJI',
      required: false
    },
    weightKg: {
      type: 'number',
      label: 'Weight (kg)',
      placeholder: '2.5',
      required: false,
      helperText: 'Total weight including battery'
    },
    description: {
      type: 'textarea',
      label: 'Description',
      placeholder: 'Additional notes about the UAV...',
      required: false,
      helperText: 'Optional description or notes'
    }
  }

  return configs[field] || {
    type: 'text',
    label: field.charAt(0).toUpperCase() + field.slice(1),
    placeholder: `Enter ${field}`,
    required: false
  }
}

// Mobile-optimized form container
export function MobileFormContainer({ 
  children, 
  title, 
  description,
  className 
}: {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn('min-h-screen bg-background p-4', className)}>
      {title && (
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold font-orbitron">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
