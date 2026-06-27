const STATS = [
	{ label: 'Замовлення (міс.)', value: '128' },
	{ label: 'Дохід (міс.)', value: '412 600 ₴' },
	{ label: 'Нові ліди', value: '24' },
	{ label: 'Товарів у каталозі', value: '1 044' }
]

export default function DashboardPage() {
	return (
		<div>
			<h1 className='mb-5 text-2xl font-bold'>Дашборд</h1>
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{STATS.map(s => (
					<div key={s.label} className='border-border bg-card rounded-2xl border p-5'>
						<p className='text-muted-foreground mb-1.5 text-sm'>{s.label}</p>
						<p className='text-2xl font-extrabold'>{s.value}</p>
					</div>
				))}
			</div>
			<p className='text-muted-foreground mt-8 text-sm'>
				tesla-admin — базова конфігурація та лейаути готові.
			</p>
		</div>
	)
}
