'use client'

import { useQuery } from '@tanstack/react-query'
import { Heart, Loader2, Phone } from 'lucide-react'
import { wishlistApi } from '@/common/services/wishlist.api'
import type { WishlistUser } from '@/common/types/wishlist.type'

const fullName = (u: WishlistUser) =>
	[u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || 'Користувач'

const fmtDate = (s: string) =>
	new Date(s).toLocaleString('uk-UA', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})

// Адмін-огляд «Обране (лайки)» — хто додав товар в обране; телефонуємо зацікавленим (ADR-0012)
export default function WishlistPage() {
	const { data, isLoading } = useQuery({
		queryKey: ['wishlist-admin'],
		queryFn: () => wishlistApi.adminList()
	})

	return (
		<div>
			<div className='mb-6'>
				<h1 className='text-2xl font-bold'>Обране (лайки)</h1>
				<p className='text-muted-foreground text-sm'>
					Хто додав товар в обране — сигнал інтересу; телефонуйте зацікавленим клієнтам.
				</p>
			</div>

			{data?.topProducts?.length ? (
				<div className='mb-6'>
					<h2 className='text-muted-foreground mb-2 text-sm font-semibold'>
						Найбажаніші товари
					</h2>
					<div className='flex flex-wrap gap-2'>
						{data.topProducts.map((t, i) => (
							<span
								key={t.product?.id ?? i}
								className='border-border bg-card flex items-center gap-2 rounded-full border px-3 py-1 text-sm'
							>
								<Heart className='text-accent-text h-3.5 w-3.5' />
								{t.product?.name ?? '—'}
								<span className='bg-primary/10 text-accent-text rounded-full px-1.5 text-xs font-bold'>
									{t.count}
								</span>
							</span>
						))}
					</div>
				</div>
			) : null}

			{isLoading ? (
				<div className='text-muted-foreground flex items-center gap-2 py-16'>
					<Loader2 className='h-5 w-5 animate-spin' /> Завантаження…
				</div>
			) : !data?.items?.length ? (
				<div className='border-border text-muted-foreground rounded-2xl border border-dashed py-16 text-center'>
					Поки ніхто не додав товарів в обране
				</div>
			) : (
				<div className='border-border overflow-hidden rounded-2xl border'>
					<table className='w-full text-sm'>
						<thead className='bg-muted text-muted-foreground text-left text-xs uppercase'>
							<tr>
								<th className='px-4 py-3 font-semibold'>Клієнт</th>
								<th className='px-4 py-3 font-semibold'>Контакт</th>
								<th className='px-4 py-3 font-semibold'>Товар</th>
								<th className='px-4 py-3 font-semibold'>Дата</th>
							</tr>
						</thead>
						<tbody>
							{data.items.map((it, i) => (
								<tr
									key={`${it.user.id}-${it.product.id}-${i}`}
									className='border-border border-t'
								>
									<td className='px-4 py-3 font-medium'>{fullName(it.user)}</td>
									<td className='px-4 py-3'>
										{it.user.phone ? (
											<a
												href={`tel:${it.user.phone}`}
												className='text-accent-text flex items-center gap-1'
											>
												<Phone className='h-3.5 w-3.5' /> {it.user.phone}
											</a>
										) : it.user.email ? (
											<a
												href={`mailto:${it.user.email}`}
												className='text-accent-text'
											>
												{it.user.email}
											</a>
										) : (
											<span className='text-muted-foreground'>—</span>
										)}
									</td>
									<td className='px-4 py-3'>{it.product.name}</td>
									<td className='text-muted-foreground px-4 py-3'>
										{fmtDate(it.createdAt)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}
