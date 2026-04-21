type SkeletonProps = {
  className?: string
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div aria-hidden="true" className={`animate-pulse rounded-xl bg-gray-200/80 ${className}`} />
  )
}
