export type CircleProgressProps = {
  percentage?: number
  className?: string
}

export const CircleProgress = ({
  percentage = 100,
  className,
}: CircleProgressProps) => {
  return (
    <svg height="20" width="20" viewBox="0 0 20 20" className={className}>
      <circle r="10" cx="10" cy="10" className="fill-muted" />
      <circle
        r="5"
        cx="10"
        cy="10"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="10"
        strokeDasharray={`calc(${percentage} * 31.4 / 100) 31.4`}
        transform="rotate(-90) translate(-20)"
      />
      <circle r="6" cx="10" cy="10" className="fill-background" />
    </svg>
  )
}
