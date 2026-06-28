'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ImageIcon, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/common/components'
import { productsApi } from '@/common/services/products.api'
import { UI_ROUTES } from '@/common/constants'
import type { ProductListItem } from '@/common/types/product.type'

const money = (v: string) => `${Number(v).toLocaleString('uk-UA')} ₴`

export default function ProductsPage() {
	const qc = useQueryClient()
	const { data: products, isLoading } = useQuery({
		queryKey: ['products'],
		queryFn: productsApi.list
	})

	const remove = useMutation({
		mutationFn: (id: string) => productsApi.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['products'] })
			toast.success('Товар видалено')
		}
	})

	const onDelete = (p: ProductListItem) => {
		if (confirm(`Видалити «${p.name}»?`)) remove.mutate(p.id)
	}

	return (
		<div>
			<div className='mb-6 flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Товари</h1>
					<p className='text-muted-foreground text-sm'>Каталог запчастин</p>
				</div>
				<Link href={UI_ROUTES.PRODUCT_NEW}>
					<Button>
						<Plus className='h-4 w-4' /> Додати товар
					</Button>
				</Link>
			</div>

			{isLoading ? (
				<div className='text-muted-foreground flex items-center gap-2 py-16'>
					<Loader2 className='h-5 w-5 animate-spin' /> Завантаження…
				</div>
			) : !products?.length ? (
				<div className='border-border text-muted-foreground rounded-2xl border border-dashed py-16 text-center'>
					Ще немає жодного товару
				</div>
			) : (
				<div className='border-border overflow-hidden rounded-2xl border'>
					<table className='w-full text-sm'>
						<thead className='bg-muted/50 text-muted-foreground text-left text-xs uppercase'>
							<tr>
								<th className='px-4 py-3 font-medium'>Товар</th>
								<th className='px-4 py-3 font-medium'>Артикул</th>
								<th className='px-4 py-3 font-medium'>Категорія</th>
								<th className='px-4 py-3 font-medium'>Ціна</th>
								<th className='px-4 py-3 font-medium'>Залишок</th>
								<th className='px-4 py-3 font-medium'>Статус</th>
								<th className='px-4 py-3' />
							</tr>
						</thead>
						<tbody>
							{products.map(p => (
								<tr key={p.id} className='border-border border-t'>
									<td className='px-4 py-3'>
										<div className='flex items-center gap-3'>
											<div className='bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-md'>
												{p.images[0] ? (
													<Image
														src={p.images[0].url}
														alt={p.name}
														fill
														sizes='40px'
														className='object-cover'
													/>
												) : (
													<ImageIcon className='text-muted-foreground absolute inset-0 m-auto h-4 w-4' />
												)}
											</div>
											<Link
												href={UI_ROUTES.PRODUCT_EDIT(p.id)}
												className='hover:text-primary font-medium'
											>
												{p.name}
											</Link>
										</div>
									</td>
									<td className='text-muted-foreground px-4 py-3 font-mono text-xs'>{p.sku}</td>
									<td className='text-muted-foreground px-4 py-3'>{p.category?.name ?? '—'}</td>
									<td className='px-4 py-3'>
										<span className='font-medium'>{money(p.price)}</span>
										{p.oldPrice && (
											<span className='text-muted-foreground ml-1 text-xs line-through'>
												{money(p.oldPrice)}
											</span>
										)}
									</td>
									<td className='px-4 py-3'>
										{p.inStock ? (
											<span className='text-green-600'>{p.stockQty} шт</span>
										) : (
											<span className='text-muted-foreground'>під замовлення</span>
										)}
									</td>
									<td className='px-4 py-3'>
										{p.isActive ? (
											<span className='rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700'>
												Активний
											</span>
										) : (
											<span className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs'>
												Прихований
											</span>
										)}
									</td>
									<td className='px-4 py-3'>
										<div className='flex justify-end gap-1'>
											<Link
												href={UI_ROUTES.PRODUCT_EDIT(p.id)}
												className='hover:bg-muted rounded-md p-2 transition-colors'
												aria-label='Редагувати'
											>
												<Pencil className='h-4 w-4' />
											</Link>
											<button
												onClick={() => onDelete(p)}
												className='hover:bg-destructive/10 text-destructive rounded-md p-2 transition-colors'
												aria-label='Видалити'
											>
												<Trash2 className='h-4 w-4' />
											</button>
										</div>
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
