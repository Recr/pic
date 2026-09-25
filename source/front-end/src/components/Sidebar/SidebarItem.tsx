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
      className={`flex h-8 w-full shrink-0 items-center rounded-xl p-2 transition-all  hover:cursor-pointer duration-300 hover:bg-black hover:text-white ${isActive && 'bg-black text-white'} lg:w-auto`}
      onClick={onClickFunction}
    >
      {iconWithStyle}
      <span
        className={`shrink-0 rounded px-2 text-sm leading-none ${isExpanded ? 'w-fit lg:block' : 'lg:hidden'} overflow-hidden whitespace-nowrap transition-[width]`}
      >
        {label}
      </span>
    </button>
  )
}

export default SideBarItem
