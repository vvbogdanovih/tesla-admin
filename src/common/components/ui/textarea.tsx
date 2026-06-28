import * as React from 'react'
import { cn } from '@/common/utils/shad-cn.utils'

export const Textarea = React.forwardRef<
	HTMLTextAreaElement,
	React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
	<textarea
		ref={ref}
		className={cn(
			'border-border bg-background focus:border-primary min-h-20 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors disabled:opacity-50',
			className
		)}
		{...props}
	/>
))
Textarea.displayName = 'Textarea'
