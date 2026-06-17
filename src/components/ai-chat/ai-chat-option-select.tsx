import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

export type AiChatSelectOption = {
  value: string
  label: string
  description?: string
}

type AiChatOptionSelectProps = {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  ariaLabel: string
  label?: string
  description?: string
  variant?: 'default' | 'preferences'
  options: AiChatSelectOption[]
}

/** SelectContent 需高于 AiChat Popover / Dialog（z-100+） */
const SELECT_CONTENT_CLASS = 'z-120'

export function AiChatOptionSelect({
  value,
  onValueChange,
  placeholder,
  ariaLabel,
  label,
  description,
  variant = 'default',
  options,
}: AiChatOptionSelectProps) {
  const isPreferences = variant === 'preferences'
  const selectedOption = options.find((option) => option.value === value)

  const select = (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        size={isPreferences ? 'default' : 'sm'}
        className={cn(
          'w-full',
          isPreferences &&
            'h-auto min-h-10 rounded-full border-0 bg-muted/60 px-4 py-2 shadow-none hover:bg-muted/80'
        )}
        aria-label={ariaLabel}
      >
        <SelectValue placeholder={placeholder}>
          {selectedOption
            ? selectedOption.description
              ? `${selectedOption.label} — ${selectedOption.description}`
              : selectedOption.label
            : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        className={SELECT_CONTENT_CLASS}
        position='popper'
        side={isPreferences ? 'bottom' : 'top'}
        sideOffset={4}
      >
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className='flex flex-col gap-0.5 py-0.5 text-start'>
                <span>{option.label}</span>
                {option.description ? (
                  <span className='text-xs leading-snug text-muted-foreground'>
                    {option.description}
                  </span>
                ) : null}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )

  if (!label) return select

  return (
    <div className='space-y-2'>
      <div className='space-y-1'>
        <Label className='text-sm font-medium'>{label}</Label>
        {description ? (
          <p className='text-sm text-muted-foreground'>{description}</p>
        ) : null}
      </div>
      {select}
    </div>
  )
}
