'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const languages = [
  {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'zh-CN',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
  },
]

interface LanguageSwitcherProps {
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
}

export function LanguageSwitcher({ 
  className, 
  variant = 'ghost', 
  size = 'default',
  showText = true 
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode)
      setIsOpen(false)
      
      // Store the selected language in localStorage for persistence
      localStorage.setItem('i18nextLng', languageCode)
      
      // Update the HTML lang attribute
      document.documentElement.lang = languageCode
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            'flex items-center gap-2',
            size === 'icon' && 'w-9 h-9',
            className
          )}
          aria-label="Change language"
        >
          <Globe className="h-4 w-4" />
          {showText && size !== 'icon' && (
            <span className="hidden sm:inline-block">
              {currentLanguage.nativeName}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={cn(
              'flex items-center justify-between cursor-pointer',
              language.code === i18n.language && 'bg-accent'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{language.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{language.nativeName}</span>
                <span className="text-xs text-muted-foreground">
                  {language.name}
                </span>
              </div>
            </div>
            {language.code === i18n.language && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSwitcher
