'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Car as CarIcon, ImageIcon, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, Modal } from '@/common/components'
import { Input } from '@/common/components/ui/input'
import { carsApi } from '@/common/services/cars.api'
import { uploadImage } from '@/common/services/upload.service'
import { carSchema, stripEmpty, type CarValues } from '@/common/schemas/car.schema'
import type { Car } from '@/common/types/car.type'

const EMPTY: CarValues = {
	brand: 'Tesla',
	model: '',
	generation: '',
	slug: '',
	imageUrl: '',
	productionStart: '',
	productionEnd: ''
}

const carTitle = (c: Pick<Car, 'model' | 'generation'>) =>
	c.generation ? `${c.model} · ${c.generation}` : c.model

export default function CarsPage() {
	const qc = useQueryClient()
	const { data: cars, isLoading } = useQuery({ queryKey: ['cars'], queryFn: carsApi.list })

	const [open, setOpen] = useState(false)
	const [editing, setEditing] = useState<Car | null>(null)
	const [uploading, setUploading] = useState(false)

	const form = useForm<CarValues>({ resolver: zodResolver(carSchema), defaultValues: EMPTY })
	const imageUrl = form.watch('imageUrl')

	const openCreate = () => {
		setEditing(null)
		form.reset(EMPTY)
		setOpen(true)
	}

	const openEdit = (car: Car) => {
		setEditing(car)
		form.reset({
			brand: car.brand,
			model: car.model,
			generation: car.generation ?? '',
			slug: car.slug,
			imageUrl: car.imageUrl ?? '',
			productionStart: car.productionStart?.slice(0, 10) ?? '',
			productionEnd: car.productionEnd?.slice(0, 10) ?? ''
		})
		setOpen(true)
	}

	const save = useMutation({
		mutationFn: (values: CarValues) => {
			const payload = stripEmpty(values)
			return editing ? carsApi.update(editing.id, payload) : carsApi.create(payload)
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['cars'] })
			toast.success(editing ? 'Авто оновлено' : 'Авто додано')
			setOpen(false)
		}
	})

	const remove = useMutation({
		mutationFn: (id: string) => carsApi.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['cars'] })
			toast.success('Авто видалено')
		}
	})

	const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		setUploading(true)
		try {
			const url = await uploadImage(file, 'cars')
			form.setValue('imageUrl', url)
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Помилка завантаження')
		} finally {
			setUploading(false)
			e.target.value = ''
		}
	}

	const onDelete = (car: Car) => {
		const linked = car._count?.fitment ?? 0
		if (linked > 0) {
			toast.error(`До авто прив'язано товарів: ${linked}. Спершу відвʼяжіть їх.`)
			return
		}
		if (confirm(`Видалити «${carTitle(car)}»?`)) remove.mutate(car.id)
	}

	return (
		<div>
			<div className='mb-6 flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Довідник авто</h1>
					<p className='text-muted-foreground text-sm'>
						Покоління Tesla для фільтра сумісності товарів
					</p>
				</div>
				<Button onClick={openCreate}>
					<Plus className='h-4 w-4' /> Додати авто
				</Button>
			</div>

			{isLoading ? (
				<div className='text-muted-foreground flex items-center gap-2 py-16'>
					<Loader2 className='h-5 w-5 animate-spin' /> Завантаження…
				</div>
			) : !cars?.length ? (
				<div className='border-border text-muted-foreground rounded-2xl border border-dashed py-16 text-center'>
					Ще немає жодного авто
				</div>
			) : (
				<div className='border-border overflow-hidden rounded-2xl border'>
					<table className='w-full text-sm'>
						<thead className='bg-muted/50 text-muted-foreground text-left text-xs uppercase'>
							<tr>
								<th className='px-4 py-3 font-medium'>Авто</th>
								<th className='px-4 py-3 font-medium'>Slug</th>
								<th className='px-4 py-3 font-medium'>Роки</th>
								<th className='px-4 py-3 font-medium'>Товарів</th>
								<th className='px-4 py-3' />
							</tr>
						</thead>
						<tbody>
							{cars.map(car => (
								<tr key={car.id} className='border-border border-t'>
									<td className='px-4 py-3'>
										<div className='flex items-center gap-3'>
											<div className='bg-muted relative h-10 w-14 shrink-0 overflow-hidden rounded-md'>
												{car.imageUrl ? (
													<Image
														src={car.imageUrl}
														alt={carTitle(car)}
														fill
														sizes='56px'
														className='object-cover'
													/>
												) : (
													<CarIcon className='text-muted-foreground absolute inset-0 m-auto h-4 w-4' />
												)}
											</div>
											<div>
												<div className='font-medium'>{carTitle(car)}</div>
												<div className='text-muted-foreground text-xs'>{car.brand}</div>
											</div>
										</div>
									</td>
									<td className='text-muted-foreground px-4 py-3 font-mono text-xs'>{car.slug}</td>
									<td className='text-muted-foreground px-4 py-3'>
										{car.productionStart?.slice(0, 4) ?? '—'}
										{' – '}
										{car.productionEnd?.slice(0, 4) ?? 'дотепер'}
									</td>
									<td className='px-4 py-3'>{car._count?.fitment ?? 0}</td>
									<td className='px-4 py-3'>
										<div className='flex justify-end gap-1'>
											<button
												onClick={() => openEdit(car)}
												className='hover:bg-muted rounded-md p-2 transition-colors'
												aria-label='Редагувати'
											>
												<Pencil className='h-4 w-4' />
											</button>
											<button
												onClick={() => onDelete(car)}
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
				title={editing ? 'Редагувати авто' : 'Нове авто'}
			>
				<form onSubmit={form.handleSubmit(v => save.mutate(v))} className='flex flex-col gap-4'>
					{/* Фото */}
					<div>
						<span className='mb-1.5 block text-sm font-medium'>Фото</span>
						<div className='flex items-center gap-4'>
							<div className='bg-muted relative h-16 w-24 shrink-0 overflow-hidden rounded-lg'>
								{imageUrl ? (
									<Image src={imageUrl} alt='' fill sizes='96px' className='object-cover' />
								) : (
									<ImageIcon className='text-muted-foreground absolute inset-0 m-auto h-5 w-5' />
								)}
							</div>
							<label className='border-border hover:bg-muted inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors'>
								{uploading ? (
									<Loader2 className='h-4 w-4 animate-spin' />
								) : (
									<ImageIcon className='h-4 w-4' />
								)}
								{uploading ? 'Завантаження…' : 'Обрати файл'}
								<input
									type='file'
									accept='image/jpeg,image/png,image/webp'
									className='hidden'
									onChange={onUpload}
									disabled={uploading}
								/>
							</label>
						</div>
					</div>

					<Field label='Бренд'>
						<Input placeholder='Tesla' {...form.register('brand')} />
					</Field>

					<Field label='Модель *' error={form.formState.errors.model?.message}>
						<Input placeholder='Model 3' {...form.register('model')} />
					</Field>

					<Field label='Покоління'>
						<Input placeholder='Highland' {...form.register('generation')} />
					</Field>

					<Field label='Slug' hint='Лишіть порожнім — згенерується автоматично'>
						<Input placeholder='model-3-highland' {...form.register('slug')} />
					</Field>

					<div className='grid grid-cols-2 gap-4'>
						<Field label='Початок випуску *' error={form.formState.errors.productionStart?.message}>
							<Input type='date' {...form.register('productionStart')} />
						</Field>
						<Field label='Кінець випуску' error={form.formState.errors.productionEnd?.message}>
							<Input type='date' {...form.register('productionEnd')} />
						</Field>
					</div>

					<div className='mt-2 flex justify-end gap-2'>
						<Button type='button' variant='ghost' onClick={() => setOpen(false)}>
							Скасувати
						</Button>
						<Button type='submit' disabled={save.isPending || uploading}>
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
