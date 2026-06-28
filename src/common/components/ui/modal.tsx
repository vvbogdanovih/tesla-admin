'use client'

import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ModalProps {
	open: boolean
	onClose: () => void
	title: string
	children: ReactNode
}

export const Modal = ({ open, onClose, title, children }: ModalProps) => {
	if (!open) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
			<div className='absolute inset-0 bg-black/50' onClick={onClose} />
			<div className='bg-card border-border relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-6 shadow-xl'>
				<div className='mb-5 flex items-center justify-between'>
					<h2 className='text-lg font-bold'>{title}</h2>
					<button
						type='button'
						onClick={onClose}
						className='hover:bg-muted rounded-md p-1 transition-colors'
						aria-label='Закрити'
					>
						<X className='h-5 w-5' />
					</button>
				</div>
				{children}
			</div>
		</div>
	)
}
