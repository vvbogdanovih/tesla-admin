'use client'

import { useQuery } from '@tanstack/react-query'
import { statsApi, type DashboardStats } from '@/common/services/stats.api'

const nf = new Intl.NumberFormat('uk-UA')

const CARDS: { label: string; value: (s: DashboardStats) => string }[] = [
	{ label: 'Замовлення (міс.)', value: s => nf.format(s.ordersThisMonth) },
	{ label: 'Дохід (міс.)', value: s => `${nf.format(Math.round(s.revenueThisMonth))} ₴` },
	{ label: 'Нові ліди', value: s => nf.format(s.newLeads) },
	{ label: 'Товарів у каталозі', value: s => nf.format(s.productsCount) }
]

export default function DashboardPage() {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['dashboard-stats'],
		queryFn: () => statsApi.dashboard()
	})

	return (
		<div>
			<h1 className='mb-5 text-2xl font-bold'>Дашборд</h1>
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{CARDS.map(c => (
					<div key={c.label} className='border-border bg-card rounded-2xl border p-5'>
						<p className='text-muted-foreground mb-1.5 text-sm'>{c.label}</p>
						{isLoading ? (
							<div className='bg-muted h-8 w-24 animate-pulse rounded-md' />
						) : (
							<p className='text-2xl font-extrabold'>{data ? c.value(data) : '—'}</p>
						)}
					</div>
				))}
			</div>
			{isError && (
				<p className='mt-4 text-sm text-red-500'>Не вдалося завантажити статистику.</p>
			)}
		</div>
	)
}
