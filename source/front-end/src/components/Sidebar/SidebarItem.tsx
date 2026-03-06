import { cloneElement, isValidElement } from 'react'

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  onClickFunction: () => void
  isSidebarOpen?: boolean
}
const SideBarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  onClickFunction,
  isSidebarOpen,
}) => {
  const iconWithStyle = isValidElement<{ className?: string }>(icon)
    ? cloneElement(icon, {
        className: `${icon.props.className ?? ''} hover:cursor-pointer hover:text-blue-500 transition-all hover:size-7 flex-shrink-0`,
      })
    : icon

  return (
    <div
      className="flex items-center gap-2 transition-all duration-300 hover:bg-blue-200 rouded-xl p-2 hover:cursor-pointer"
      onClick={onClickFunction}
    >
      {iconWithStyle}
      {isSidebarOpen && (
        <span className="hover:cursor-pointer hover:text-blue-500 hover:font-semibold px-2 rounded whitespace-nowrap transition-all">
          {label}
        </span>
      )}
    </div>
  )
}

export default SideBarItem
