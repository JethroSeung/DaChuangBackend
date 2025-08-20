'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AnimatedPage,
  AnimatedCard,
  StaggerContainer,
  StaggerItem,
  AnimatedModal,
  AnimatedSpinner,
  ScaleOnHover,
  Pulse,
  Bounce,
  Shake,
  Float,
  Glow,
  Magnetic
} from '@/components/custom/animated-components'
import {
  AnimatedButton,
  FloatingActionButton,
  AnimatedIconButton,
  ProgressButton
} from '@/components/custom/animated-button'
import {
  AnimatedAlert,
  Toast,
  ToastContainer,
  RealtimeAlerts
} from '@/components/custom/animated-alert'
import toast from 'react-hot-toast'
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Heart,
  Star,
  Rocket,
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-react'

export function AnimationShowcase() {
  const [showModal, setShowModal] = useState(false)
  const [bounceDemo, setBounceDemo] = useState(false)
  const [shakeDemo, setShakeDemo] = useState(false)
  const [progress, setProgress] = useState(0)
  const success = (message: string) => toast.success(message)
  const error = (message: string) => toast.error(message)
  const warning = (message: string) => toast(message, { icon: '⚠️' })
  const info = (message: string) => toast(message, { icon: 'ℹ️' })

  const mockAlerts = [
    {
      id: '1',
      type: 'error' as const,
      title: 'System Alert',
      description: 'UAV-001 has lost GPS signal',
      timestamp: new Date(),
      priority: 'critical' as const,
    },
    {
      id: '2',
      type: 'warning' as const,
      title: 'Battery Warning',
      description: 'UAV-003 battery level below 20%',
      timestamp: new Date(),
      priority: 'high' as const,
    },
    {
      id: '3',
      type: 'info' as const,
      title: 'Mission Update',
      description: 'UAV-005 has completed waypoint 3 of 8',
      timestamp: new Date(),
      priority: 'medium' as const,
    },
  ]

  const handleProgressDemo = () => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <AnimatedPage className="space-y-8 p-6">
      <div className="text-center space-y-4">
        <motion.h1
          className="text-4xl font-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          🎬 UAV Control System Animation Showcase
        </motion.h1>
        <motion.p
          className="text-lg text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Demonstrating all the enhanced animations and interactions
        </motion.p>
      </div>

      {/* Page Transitions Demo */}
      <Card>
        <CardHeader>
          <CardTitle>🔄 Page Transitions</CardTitle>
          <CardDescription>
            Smooth fade and scale transitions between pages (implemented on Dashboard, UAVs, Map)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            ✅ Navigate between pages to see smooth transitions with fade and scale effects
          </div>
        </CardContent>
      </Card>

      {/* Stagger Animations */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Stagger Animations</CardTitle>
          <CardDescription>
            Cards and list items animate in sequence with staggered timing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <StaggerItem key={item}>
                <AnimatedCard className="p-4 text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="font-semibold">Metric {item}</div>
                  <div className="text-sm text-muted-foreground">Animated Card</div>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </CardContent>
      </Card>

      {/* Interactive Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Interactive Buttons</CardTitle>
          <CardDescription>
            Enhanced buttons with hover, tap, ripple, and glow effects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <AnimatedButton ripple glow>
              Ripple & Glow
            </AnimatedButton>

            <AnimatedIconButton
              icon={<Heart className="h-4 w-4" />}
              label="Favorite"
            />

            <ProgressButton
              progress={progress}
              showProgress={progress > 0}
              onClick={handleProgressDemo}
            >
              Progress Demo
            </ProgressButton>

            <Magnetic>
              <Button>Magnetic Effect</Button>
            </Magnetic>
          </div>
        </CardContent>
      </Card>

      {/* Special Effects */}
      <Card>
        <CardHeader>
          <CardTitle>✨ Special Effects</CardTitle>
          <CardDescription>
            Various animation effects for different use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ScaleOnHover className="p-4 bg-blue-100 rounded-lg text-center">
              <div>Hover to Scale</div>
            </ScaleOnHover>

            <Pulse className="p-4 bg-green-100 rounded-lg text-center">
              <div>Pulsing Effect</div>
            </Pulse>

            <Float className="p-4 bg-purple-100 rounded-lg text-center">
              <div>Floating Animation</div>
            </Float>

            <Glow className="p-4 bg-yellow-100 rounded-lg text-center">
              <div>Glow on Hover</div>
            </Glow>
          </div>

          <div className="mt-4 space-x-4">
            <Bounce trigger={bounceDemo}>
              <Button onClick={() => setBounceDemo(!bounceDemo)}>
                Bounce Demo
              </Button>
            </Bounce>

            <Shake trigger={shakeDemo}>
              <Button
                variant="destructive"
                onClick={() => setShakeDemo(!shakeDemo)}
              >
                Shake Demo
              </Button>
            </Shake>
          </div>
        </CardContent>
      </Card>

      {/* Modal Animations */}
      <Card>
        <CardHeader>
          <CardTitle>🪟 Modal Animations</CardTitle>
          <CardDescription>
            Smooth modal transitions with scale and fade effects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowModal(true)}>
            Open Animated Modal
          </Button>

          <AnimatedModal isOpen={showModal}>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Animated Modal</h3>
                <p className="text-muted-foreground mb-4">
                  This modal animates in with smooth scale and fade effects.
                </p>
                <Button onClick={() => setShowModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </AnimatedModal>
        </CardContent>
      </Card>

      {/* Alert System */}
      <Card>
        <CardHeader>
          <CardTitle>🚨 Alert & Notification System</CardTitle>
          <CardDescription>
            Toast notifications and real-time alerts with smooth animations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => success('Operation completed successfully!')}
              className="bg-green-600 hover:bg-green-700"
            >
              Success Toast
            </Button>
            <Button
              onClick={() => error('Something went wrong!')}
              variant="destructive"
            >
              Error Toast
            </Button>
            <Button
              onClick={() => warning('Please check your settings')}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Warning Toast
            </Button>
            <Button
              onClick={() => info('New update available')}
              variant="outline"
            >
              Info Toast
            </Button>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-3">Real-time Alerts Demo:</h4>
            <RealtimeAlerts alerts={mockAlerts} />
          </div>
        </CardContent>
      </Card>

      {/* Loading States */}
      <Card>
        <CardHeader>
          <CardTitle>⏳ Loading Animations</CardTitle>
          <CardDescription>
            Smooth loading states and spinners
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <AnimatedSpinner size={24} />
          <AnimatedSpinner size={32} className="text-blue-500" />
          <AnimatedSpinner size={40} className="text-green-500" />
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <FloatingActionButton position="bottom-right">
        <Rocket className="h-6 w-6" />
      </FloatingActionButton>
    </AnimatedPage>
  )
}
