import { useEffect, useMemo, useRef, useState } from 'react'

type EmployeeOption = {
  re: number
  name: string
  shift?: string | null
}

type EmployeeComboboxProps = {
  name: string
  listId: string
  employees: EmployeeOption[]
  onSelect: (value: string) => void
  required?: boolean
  placeholder?: string
}

const EmployeeCombobox = ({
  name,
  listId,
  employees,
  onSelect,
  required = false,
  placeholder = 'Digite ou selecione o RE',
}: EmployeeComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filteredEmployees = useMemo(() => {
    const normalizedValue = value.trim().toLowerCase()

    if (!normalizedValue) {
      return employees
    }

    return employees.filter((employee) => {
      const re = String(employee.re)
      const name = employee.name.toLowerCase()
      const shift = (employee.shift || '').toLowerCase()

      return (
        re.includes(normalizedValue) ||
        name.includes(normalizedValue) ||
        shift.includes(normalizedValue)
      )
    })
  }, [employees, value])

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

  const handleInputChange = (nextValue: string) => {
    setValue(nextValue)
    setIsOpen(true)
    onSelect(nextValue)
  }

  const handleSelect = (employee: EmployeeOption) => {
    const selectedValue = String(employee.re)
    setValue(selectedValue)
    onSelect(selectedValue)
    setIsOpen(false)
  }

  return (
    <div className="w-4/5">
      <div ref={wrapperRef} className="relative">
        <input
          type="text"
          name={name}
          placeholder={placeholder}
          value={value}
          required={required}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full p-2.5 pr-9 my-1.5 rounded-[5px] border border-[#ccc] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          ▾
        </span>

        {isOpen && (
          <ul
            id={listId}
            className="absolute z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-[5px] border border-[#ccc] bg-white shadow-sm"
          >
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <li
                  key={employee.re}
                  onMouseDown={() => handleSelect(employee)}
                  className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
                >
                  {employee.re} - {employee.name} ({employee.shift || '-'})
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-gray-500">Nenhum funcionário encontrado</li>
            )}
          </ul>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-0.5">Digite o RE ou selecione da lista</p>
    </div>
  )
}

export default EmployeeCombobox
