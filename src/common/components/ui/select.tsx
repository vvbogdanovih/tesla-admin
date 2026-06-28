import * as React from 'react'
import { cn } from '@/common/utils/shad-cn.utils'

export const Select = React.forwardRef<
	HTMLSelectElement,
	React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
	<select
		ref={ref}
		className={cn(
			'border-border bg-background focus:border-primary h-11 w-full rounded-xl border px-3 text-sm outline-none transition-colors disabled:opacity-50',
			className
		)}
		{...props}
	/>
))
Select.displayName = 'Select'
