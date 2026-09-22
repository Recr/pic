type FilterItemProps = {
  children: React.ReactNode
  filterName: string
  filterId: string
}

const FilterItem: React.FC<FilterItemProps> = ({ children, filterName, filterId }) => {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={filterId} className="flex flex-col gap-1 text-xs font-medium text-gray-600">
        {filterName}
      </label>
      {children}
    </div>
  )
}

export default FilterItem
