import { cloneElement, isValidElement } from 'react'

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  onClickFunction: () => void
  isActive?: boolean
  isExpanded?: boolean
}
const SideBarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  onClickFunction,
  isActive,
  isExpanded,
}) => {
  const iconWithStyle = isValidElement<{ className?: string }>(icon)
    ? cloneElement(icon, {
        className: `${icon.props.className ?? ''} hover:cursor-pointer transition-all size-4 flex-shrink-0`,
      })
    : icon

  return (
    <button
      className={`flex shrink-0 items-center transition-all duration-300 hover:bg-black hover:text-white ${isActive ? 'bg-black text-white' : ''} rounded-xl p-2 hover:cursor-pointer w-45 lg:w-auto`}
      onClick={onClickFunction}
    >
      {iconWithStyle}
      <span className={`text-sm px-2 rounded ${isExpanded ? 'lg:block' : 'lg:hidden'}`}>
        {label}
      </span>
    </button>
  )
}

export default SideBarItem
