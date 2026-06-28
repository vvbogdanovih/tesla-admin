'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, InfoHint, Modal } from '@/common/components'
import { Input } from '@/common/components/ui/input'
import { categoriesApi, type CategoryPayload } from '@/common/services/categories.api'
import { categorySchema, type CategoryValues } from '@/common/schemas/category.schema'
import { slugify } from '@/common/utils/slugify'
import type { Category } from '@/common/types/category.type'

const EMPTY: CategoryValues = {
	name: '',
	sortOrder: 0,
	seoTitle: '',
	seoDescription: ''
}

const SLUG_HINT =
	'Slug — частина адреси сторінки (URL), напр. /category/kuzov. Формується автоматично з назви. Не змінюється при перейменуванні, щоб не ламати посилання та позиції в Google.'

export default function CategoriesPage() {
	const qc = useQueryClient()
	const { data: categories, isLoading } = useQuery({
		queryKey: ['categories'],
		queryFn: categoriesApi.list
	})

	const [open, setOpen] = useState(false)
	const [editing, setEditing] = useState<Category | null>(null)

	const form = useForm<CategoryValues>({
		resolver: zodResolver(categorySchema),
		defaultValues: EMPTY
	})

	const openCreate = () => {
		setEditing(null)
		form.reset(EMPTY)
		setOpen(true)
	}

	const openEdit = (c: Category) => {
		setEditing(c)
		form.reset({
			name: c.name,
			sortOrder: c.sortOrder,
			seoTitle: c.seo?.title ?? '',
			seoDescription: c.seo?.description ?? ''
		})
		setOpen(true)
	}

	// Превʼю slug: при створенні — з назви; при редагуванні — наявний (стабільний)
	const nameValue = form.watch('name')
	const slugPreview = editing ? editing.slug : slugify(nameValue || '')

	const save = useMutation({
		mutationFn: (v: CategoryValues) => {
			const payload: CategoryPayload = {
				name: v.name,
				sortOrder: v.sortOrder,
				seo: {
					title: v.seoTitle?.trim() || undefined,
					description: v.seoDescription?.trim() || undefined
				}
			}
			return editing ? categoriesApi.update(editing.id, payload) : categoriesApi.create(payload)
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['categories'] })
			toast.success(editing ? 'Категорію оновлено' : 'Категорію додано')
			setOpen(false)
		}
	})

	const remove = useMutation({
		mutationFn: (id: string) => categoriesApi.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['categories'] })
			toast.success('Категорію видалено')
		}
	})

	const onDelete = (c: Category) => {
		const products = c._count?.products ?? 0
		if (products > 0) return toast.error(`Є товарів: ${products}. Спершу перенесіть їх.`)
		if (confirm(`Видалити «${c.name}»?`)) remove.mutate(c.id)
	}

	const rows = categories ?? []

	return (
		<div>
			<div className='mb-6 flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Категорії</h1>
					<p className='text-muted-foreground text-sm'>
						Глобальна таксономія деталей. Сумісність з авто задається в товарі.
					</p>
				</div>
				<Button onClick={openCreate}>
					<Plus className='h-4 w-4' /> Додати категорію
				</Button>
			</div>

			{isLoading ? (
				<div className='text-muted-foreground flex items-center gap-2 py-16'>
					<Loader2 className='h-5 w-5 animate-spin' /> Завантаження…
				</div>
			) : !rows.length ? (
				<div className='border-border text-muted-foreground rounded-2xl border border-dashed py-16 text-center'>
					Ще немає жодної категорії
				</div>
			) : (
				<div className='border-border overflow-hidden rounded-2xl border'>
					<table className='w-full text-sm'>
						<thead className='bg-muted/50 text-muted-foreground text-left text-xs uppercase'>
							<tr>
								<th className='px-4 py-3 font-medium'>Назва</th>
								<th className='px-4 py-3 font-medium'>Slug</th>
								<th className='px-4 py-3 font-medium'>Порядок</th>
								<th className='px-4 py-3 font-medium'>Товарів</th>
								<th className='px-4 py-3' />
							</tr>
						</thead>
						<tbody>
							{rows.map(c => (
								<tr key={c.id} className='border-border border-t'>
									<td className='px-4 py-3 font-medium'>{c.name}</td>
									<td className='text-muted-foreground px-4 py-3 font-mono text-xs'>{c.slug}</td>
									<td className='text-muted-foreground px-4 py-3'>{c.sortOrder}</td>
									<td className='px-4 py-3'>{c._count?.products ?? 0}</td>
									<td className='px-4 py-3'>
										<div className='flex justify-end gap-1'>
											<button
												onClick={() => openEdit(c)}
												className='hover:bg-muted rounded-md p-2 transition-colors'
												aria-label='Редагувати'
											>
												<Pencil className='h-4 w-4' />
											</button>
											<button
												onClick={() => onDelete(c)}
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

			<Modal
				open={open}
				onClose={() => setOpen(false)}
				title={editing ? 'Редагувати категорію' : 'Нова категорія'}
			>
				<form onSubmit={form.handleSubmit(v => save.mutate(v))} className='flex flex-col gap-4'>
					<div>
						<Field label='Назва *' error={form.formState.errors.name?.message}>
							<Input placeholder='Зовнішні ліхтарі' {...form.register('name')} />
						</Field>
						{/* Живе превʼю slug (URL) — без ручного вводу */}
						<div className='text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs'>
							<span>URL:</span>
							<code className='text-foreground bg-muted rounded px-1.5 py-0.5'>
								/category/{slugPreview || '…'}
							</code>
							<InfoHint text={SLUG_HINT} />
						</div>
					</div>

					<Field label='Порядок' error={form.formState.errors.sortOrder?.message}>
						<Input type='number' min={0} className='max-w-32' {...form.register('sortOrder')} />
					</Field>

					<div className='border-border mt-1 border-t pt-4'>
						<p className='text-muted-foreground mb-3 text-xs font-medium uppercase'>SEO</p>
						<div className='flex flex-col gap-4'>
							<Field label='Meta title'>
								<Input
									placeholder='Зовнішні ліхтарі Tesla — купити у Львові'
									{...form.register('seoTitle')}
								/>
							</Field>
							<Field label='Meta description'>
								<Input
									placeholder='Короткий опис для пошукової видачі'
									{...form.register('seoDescription')}
								/>
							</Field>
						</div>
					</div>

					<div className='mt-2 flex justify-end gap-2'>
						<Button type='button' variant='ghost' onClick={() => setOpen(false)}>
							Скасувати
						</Button>
						<Button type='submit' disabled={save.isPending}>
							{save.isPending ? 'Збереження…' : 'Зберегти'}
						</Button>
					</div>
				</form>
			</Modal>
		</div>
	)
}

const Field = ({
	label,
	hint,
	error,
	children
}: {
	label: string
	hint?: string
	error?: string
	children: React.ReactNode
}) => (
	<div>
		<label className='mb-1.5 block text-sm font-medium'>{label}</label>
		{children}
		{hint && !error && <p className='text-muted-foreground mt-1 text-xs'>{hint}</p>}
		{error && <p className='text-destructive mt-1 text-xs'>{error}</p>}
	</div>
)
