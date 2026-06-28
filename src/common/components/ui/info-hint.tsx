'use client'

import { Info } from 'lucide-react'

// Іконка ⓘ з підказкою при наведенні — пояснює призначення поля.
export const InfoHint = ({ text }: { text: string }) => (
	<span className='group relative inline-flex items-center'>
		<Info className='text-muted-foreground hover:text-foreground h-4 w-4 cursor-help transition-colors' />
		<span className='bg-foreground text-background pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-60 -translate-x-1/2 rounded-lg px-3 py-2 text-xs leading-relaxed shadow-lg group-hover:block'>
			{text}
		</span>
	</span>
)
