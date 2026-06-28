'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '@/common/store/useAuthStore'
import { UI_ROUTES } from '@/common/constants/ui-routes.constants'

export const Topbar = () => {
	const router = useRouter()
	const user = useAuthStore(s => s.user)
	const logOut = useAuthStore(s => s.logOut)
	const initial = (user?.firstName || user?.email || 'A').charAt(0).toUpperCase()

	const handleLogout = async () => {
		await logOut()
		router.replace(UI_ROUTES.LOGIN)
	}

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
			<button
				onClick={handleLogout}
				title='Вийти'
				className='border-border text-muted-foreground hover:text-accent-text flex h-9 w-9 items-center justify-center rounded-lg border transition-colors'
			>
				<LogOut className='h-[18px] w-[18px]' />
			</button>
		</header>
	)
}
