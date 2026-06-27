'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/common/constants/ui-routes.constants'
import { cn } from '@/common/utils/shad-cn.utils'

export const Sidebar = () => {
	const pathname = usePathname()

	return (
		<aside className='border-border bg-card sticky top-0 flex h-screen w-60 flex-col border-r p-3'>
			<div className='border-border mb-2 flex items-center gap-2 border-b px-2 pt-1 pb-4'>
				<span className='font-display text-lg font-bold tracking-wide'>TESLA LVIV</span>
				<span className='bg-primary text-primary-foreground rounded px-1.5 py-0.5 text-[10px] font-extrabold'>
					ADMIN
				</span>
			</div>
			<nav className='flex flex-1 flex-col gap-1 overflow-auto'>
				{NAV_ITEMS.map(({ label, href, icon: Icon }) => {
					const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
					return (
						<Link
							key={href}
							href={href}
							className={cn(
								'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
								active
									? 'bg-primary/10 text-accent-text'
									: 'text-foreground hover:bg-muted'
							)}
						>
							<Icon className='h-[18px] w-[18px]' />
							{label}
						</Link>
					)
				})}
			</nav>
		</aside>
	)
}
