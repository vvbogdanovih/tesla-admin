'use client'

import { useAuthStore } from '@/common/store/useAuthStore'

export const Topbar = () => {
	const user = useAuthStore(s => s.user)
	const initial = (user?.firstName || user?.email || 'A').charAt(0).toUpperCase()

	return (
		<header className='border-border bg-card sticky top-0 z-10 flex items-center gap-4 border-b px-6 py-3'>
			<div className='bg-muted text-muted-foreground flex-1 rounded-lg px-3 py-2 text-sm'>
				🔍 Пошук по адмінці…
			</div>
			<span className='text-accent-text bg-primary/10 rounded-full px-3 py-1 text-xs font-bold'>
				{user?.role ?? 'Admin'}
			</span>
			<div className='bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-full font-extrabold'>
				{initial}
			</div>
		</header>
	)
}
