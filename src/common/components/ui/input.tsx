import * as React from 'react'
import { cn } from '@/common/utils/shad-cn.utils'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
	({ className, ...props }, ref) => (
		<input
			ref={ref}
			className={cn(
				'border-border bg-background focus:border-primary h-11 w-full rounded-xl border px-4 text-sm outline-none transition-colors disabled:opacity-50',
				className
			)}
			{...props}
		/>
	)
)
Input.displayName = 'Input'
