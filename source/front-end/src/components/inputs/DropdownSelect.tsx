import { useEffect, useRef, useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'

type DropdownOption = {
  label: string
  value: string
}

type DropdownSelectProps = {
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  placeholder: string
  error?: string | null
  label?: string
  name?: string
  id?: string
  required?: boolean
  disabled?: boolean
  showEmptyOption?: boolean
  className?: string
  buttonClassName?: string
  menuClassName?: string
}

const DropdownSelect = ({
  value,
  options,
  onChange,
  placeholder,
  error,
  label,
  name,
  id,
  required = false,
  disabled = false,
  showEmptyOption = true,
  className = '',
  buttonClassName = '',
  menuClassName = '',
}: DropdownSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (nextValue: string) => {
    onChange(nextValue)
    setIsOpen(false)
  }

  return (
    <div className={className} ref={wrapperRef}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((currentValue) => !currentValue)}
          className={`flex w-full items-center justify-between rounded border bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${error ? 'border-red-400 focus:ring-red-500/20' : 'border-gray-300'} ${buttonClassName}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className={selectedOption ? '' : 'text-gray-400'}>
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDownIcon
            size={16}
            className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {name && <input type="hidden" name={name} value={value} required={required} readOnly />}
        {isOpen && !disabled && (
          <ul
            role="listbox"
            className={`absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded border border-gray-200 bg-white shadow-lg ${menuClassName}`}
          >
            {showEmptyOption && (
              <li>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect('')}
                  className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
                >
                  {placeholder}
                </button>
              </li>
            )}
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(option.value)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default DropdownSelect
