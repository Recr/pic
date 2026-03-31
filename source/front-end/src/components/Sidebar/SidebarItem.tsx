import { cloneElement, isValidElement } from 'react'

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  onClickFunction: () => void
}
const SideBarItem: React.FC<SidebarItemProps> = ({ icon, label, onClickFunction }) => {
  const iconWithStyle = isValidElement<{ className?: string }>(icon)
    ? cloneElement(icon, {
        className: `${icon.props.className ?? ''} hover:cursor-pointer hover:text-blue-500 transition-all size-4 flex-shrink-0`,
      })
    : icon

  return (
    <div
      className="group flex shrink-0 items-center transition-all duration-300 hover:bg-blue-200 rounded-full p-2 hover:cursor-pointer ease-in-out"
      onClick={onClickFunction}
    >
      {iconWithStyle}
      <span className="hover:cursor-pointer text-sm px-2 rounded whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden max-w-xs opacity-100 md:max-w-0 md:opacity-0 md:pointer-events-none md:group-hover:max-w-xs md:group-hover:opacity-100">
        {label}
      </span>
    </div>
  )
}

export default SideBarItem
