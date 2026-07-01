'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { JSONContent } from '@tiptap/core'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { GripVertical, ImageIcon, Loader2, Plus, Trash2, X } from 'lucide-react'
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent
} from '@dnd-kit/core'
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	rectSortingStrategy,
	useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button, InfoHint, Input, RichTextEditor, Select, Textarea } from '@/common/components'
import { carsApi } from '@/common/services/cars.api'
import { categoriesApi } from '@/common/services/categories.api'
import { productsApi, type ProductPayload } from '@/common/services/products.api'
import { uploadImage } from '@/common/services/upload.service'
import { productSchema, type ProductValues } from '@/common/schemas/product.schema'
import { slugify } from '@/common/utils/slugify'
import { UI_ROUTES } from '@/common/constants'
import type { ProductDetail } from '@/common/types/product.type'

interface AttrRow {
	key: string
	value: string
}

// Фото в галереї з клієнтським uid (стабільний ключ для drag-and-drop)
interface GalleryImage {
	uid: string
	url: string
	alt: string
}

const newUid = () =>
	typeof crypto !== 'undefined' && crypto.randomUUID
		? crypto.randomUUID()
		: `${Date.now()}-${Math.round(Math.random() * 1e9)}`

export const ProductForm = ({ product }: { product?: ProductDetail }) => {
	const router = useRouter()
	const qc = useQueryClient()
	const isEdit = !!product

	const { data: categories, isLoading: catLoading } = useQuery({
		queryKey: ['categories'],
		queryFn: categoriesApi.list
	})
	const { data: cars, isLoading: carsLoading } = useQuery({
		queryKey: ['cars'],
		queryFn: carsApi.list
	})

	const form = useForm<ProductValues>({
		resolver: zodResolver(productSchema),
		defaultValues: {
			name: product?.name ?? '',
			sku: product?.sku ?? '',
			categoryId: product?.category?.id ?? '',
			price: product ? Number(product.price) : 0,
			oldPrice: product?.oldPrice ? Number(product.oldPrice) : undefined,
			onSale: product?.onSale ?? false,
			type: product?.type ?? 'original',
			condition: product?.condition ?? 'new',
			isActive: product?.isActive ?? true,
			stockQty: product?.stockQty ?? 0,
			seoTitle: product?.seo?.title ?? '',
			seoDescription: product?.seo?.description ?? ''
		}
	})

	const toGallery = (im: { id?: string; url: string; alt?: string | null }): GalleryImage => ({
		uid: im.id ?? newUid(),
		url: im.url,
		alt: im.alt ?? ''
	})
	const [images, setImages] = useState<GalleryImage[]>(
		product?.images.filter(im => !im.isLive).map(toGallery) ?? []
	)
	// «Живі фото» — окремий набір (isLive:true), реальні знімки екземпляра
	const [livePhotos, setLivePhotos] = useState<GalleryImage[]>(
		product?.images.filter(im => im.isLive).map(toGallery) ?? []
	)
	const [carIds, setCarIds] = useState<string[]>(product?.fitment.map(f => f.carId) ?? [])
	const [descJson, setDescJson] = useState<JSONContent | null>(product?.descriptionJson ?? null)
	const [attrs, setAttrs] = useState<AttrRow[]>(
		product ? Object.entries(product.attributes).map(([key, value]) => ({ key, value })) : []
	)
	const [uploading, setUploading] = useState(false)
	const [fitmentError, setFitmentError] = useState(false)

	const nameValue = form.watch('name')
	const slugPreview = isEdit ? product!.slug : slugify(nameValue || '')

	const save = useMutation({
		mutationFn: (v: ProductValues) => {
			const attributes: Record<string, string> = {}
			for (const { key, value } of attrs) {
				const k = key.trim()
				if (k) attributes[k] = value.trim()
			}
			const payload: ProductPayload = {
				name: v.name,
				sku: v.sku,
				categoryId: v.categoryId,
				price: v.price,
				oldPrice: v.oldPrice && v.oldPrice > 0 ? v.oldPrice : undefined,
				onSale: v.onSale,
				type: v.type,
				condition: v.condition,
				stockQty: v.stockQty,
				descriptionJson: descJson,
				attributes,
				seo: {
					title: v.seoTitle?.trim() || undefined,
					description: v.seoDescription?.trim() || undefined
				},
				images: images.map(i => ({ url: i.url, alt: i.alt.trim() || undefined })),
				livePhotos: livePhotos.map(i => ({ url: i.url, alt: i.alt.trim() || undefined })),
				carIds,
				isActive: v.isActive
			}
			return isEdit ? productsApi.update(product!.id, payload) : productsApi.create(payload)
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['products'] })
			toast.success(isEdit ? 'Товар оновлено' : 'Товар створено')
			router.push(UI_ROUTES.PRODUCTS)
		}
	})

	// Фабрика аплоаду: завантажує файли в потрібний набір (галерея / живі фото)
	const makeUpload =
		(setList: React.Dispatch<React.SetStateAction<GalleryImage[]>>, prefix: string) =>
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(e.target.files ?? [])
			if (!files.length) return
			setUploading(true)
			try {
				for (const file of files) {
					const url = await uploadImage(file, prefix)
					setList(prev => [...prev, { uid: newUid(), url, alt: '' }])
				}
			} catch (err) {
				toast.error(err instanceof Error ? err.message : 'Помилка завантаження')
			} finally {
				setUploading(false)
				e.target.value = ''
			}
		}

	const toggleCar = (id: string) => {
		setFitmentError(false)
		setCarIds(prev => (prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]))
	}

	const onSubmit = form.handleSubmit(
		v => {
			if (carIds.length === 0) {
				setFitmentError(true)
				toast.error('Оберіть хоча б одну модель сумісності')
				return
			}
			save.mutate(v)
		},
		// onInvalid — показуємо тост лише з ПЕРШИМ незаповненим полем (за порядком у формі)
		errors => {
			const order = [
				'name',
				'sku',
				'categoryId',
				'price',
				'oldPrice',
				'stockQty',
				'seoTitle',
				'seoDescription'
			] as const
			for (const key of order) {
				const msg = errors[key]?.message
				if (msg) {
					toast.error(String(msg))
					return
				}
			}
			const first = Object.values(errors)[0]
			if (first?.message) toast.error(String(first.message))
		}
	)

	// Чекаємо довідники, щоб select категорії мав потрібний option (інакше вибір скидається)
	if (catLoading || carsLoading) {
		return (
			<div className='text-muted-foreground flex items-center gap-2 py-16'>
				<Loader2 className='h-5 w-5 animate-spin' /> Завантаження…
			</div>
		)
	}

	return (
		<form onSubmit={onSubmit} className='max-w-5xl pb-16'>
			<div className='mb-6 flex items-center justify-between'>
				<h1 className='text-2xl font-bold'>{isEdit ? 'Редагувати товар' : 'Новий товар'}</h1>
				<div className='flex gap-2'>
					<Button type='button' variant='ghost' onClick={() => router.push(UI_ROUTES.PRODUCTS)}>
						Скасувати
					</Button>
					<Button type='submit' disabled={save.isPending || uploading}>
						{save.isPending ? 'Збереження…' : 'Зберегти'}
					</Button>
				</div>
			</div>

			<div className='bg-card border-border rounded-2xl border p-6 sm:p-8'>
			{/* Основне */}
			<Section title='Основне'>
				<div>
					<Field label='Назва *' error={form.formState.errors.name?.message}>
						<Input placeholder='Фара ліва Model 3 Highland' {...form.register('name')} />
					</Field>
					<div className='text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs'>
						<span>URL:</span>
						<code className='text-foreground bg-muted rounded px-1.5 py-0.5'>
							/product/{slugPreview || '…'}
						</code>
						<InfoHint text='Адреса сторінки товару. Формується з назви автоматично, не змінюється при перейменуванні (SEO).' />
					</div>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<Field label='Артикул (SKU) *' error={form.formState.errors.sku?.message}>
						<Input placeholder='TSL-1095-L' {...form.register('sku')} />
					</Field>
					<Field label='Категорія *' error={form.formState.errors.categoryId?.message}>
						<Select {...form.register('categoryId')}>
							<option value=''>— Оберіть —</option>
							{categories?.map(c => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</Select>
					</Field>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<Field label='Тип'>
						<Select {...form.register('type')}>
							<option value='original'>Оригінал</option>
							<option value='analog'>Аналог</option>
						</Select>
					</Field>
					<Field label='Стан'>
						<Select {...form.register('condition')}>
							<option value='new'>Новий</option>
							<option value='used'>Б/у</option>
							<option value='clearance'>Уцінка</option>
						</Select>
					</Field>
				</div>
			</Section>

			{/* Ціна та залишок */}
			<Section title='Ціна та залишок'>
				<div className='grid grid-cols-3 gap-4'>
					<Field label='Ціна, ₴ *' error={form.formState.errors.price?.message}>
						<Input type='number' step='0.01' min={0} {...form.register('price')} />
					</Field>
					<Field label='Стара ціна, ₴'>
						<Input type='number' step='0.01' min={0} {...form.register('oldPrice')} />
					</Field>
					<Field label='Залишок, шт' error={form.formState.errors.stockQty?.message}>
						<Input type='number' min={0} {...form.register('stockQty')} />
					</Field>
				</div>
				<label className='flex cursor-pointer items-center gap-2 text-sm'>
					<input type='checkbox' className='h-4 w-4' {...form.register('onSale')} />
					Зараз на знижці{' '}
					<span className='text-muted-foreground'>(показувати стару ціну закресленою)</span>
				</label>
			</Section>

			{/* Галерея */}
			<Section title='Галерея'>
				<ImageGrid
					items={images}
					setItems={setImages}
					uploading={uploading}
					onUpload={makeUpload(setImages, 'products')}
					showMain
					hint='Перетягни фото, щоб змінити порядок. Перше — головне. Конвертуються в AVIF.'
				/>
			</Section>

			{/* Живі фото — реальні знімки екземпляра (окремий блок на сторінці товару) */}
			<Section title='Живі фото'>
				<ImageGrid
					items={livePhotos}
					setItems={setLivePhotos}
					uploading={uploading}
					onUpload={makeUpload(setLivePhotos, 'products/live')}
					hint='Реальні знімки саме цього товару («як на складі»). Показуються окремим блоком під галереєю — лише якщо є хоча б одне фото. Конвертуються в AVIF.'
				/>
			</Section>

			{/* Сумісність */}
			<Section title='Сумісність (підходить до) *'>
				<div className='flex flex-wrap gap-2'>
					{cars?.map(car => {
						const active = carIds.includes(car.id)
						const label = car.generation ? `${car.model} · ${car.generation}` : car.model
						return (
							<button
								key={car.id}
								type='button'
								onClick={() => toggleCar(car.id)}
								className={
									active
										? 'bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-sm font-medium'
										: 'border-border hover:bg-muted rounded-full border px-3 py-1.5 text-sm'
								}
							>
								{label}
							</button>
						)
					})}
				</div>
				{fitmentError ? (
					<p className='text-destructive text-xs'>Оберіть хоча б одну модель сумісності.</p>
				) : (
					!carIds.length && (
						<p className='text-muted-foreground text-xs'>
							Оберіть моделі, до яких підходить деталь.
						</p>
					)
				)}
			</Section>

			{/* Опис */}
			<Section title='Опис'>
				<RichTextEditor value={descJson} onChange={setDescJson} />
			</Section>

			{/* Характеристики */}
			<Section title='Характеристики'>
				<div className='flex flex-col gap-2'>
					{attrs.map((row, i) => (
						<div key={i} className='flex gap-2'>
							<Input
								placeholder='Назва (Сторона)'
								value={row.key}
								onChange={e =>
									setAttrs(prev => prev.map((r, idx) => (idx === i ? { ...r, key: e.target.value } : r)))
								}
							/>
							<Input
								placeholder='Значення (ліва)'
								value={row.value}
								onChange={e =>
									setAttrs(prev =>
										prev.map((r, idx) => (idx === i ? { ...r, value: e.target.value } : r))
									)
								}
							/>
							<button
								type='button'
								onClick={() => setAttrs(prev => prev.filter((_, idx) => idx !== i))}
								className='hover:bg-destructive/10 text-destructive shrink-0 rounded-md px-2'
								aria-label='Видалити'
							>
								<Trash2 className='h-4 w-4' />
							</button>
						</div>
					))}
					<button
						type='button'
						onClick={() => setAttrs(prev => [...prev, { key: '', value: '' }])}
						className='text-primary flex items-center gap-1 self-start text-sm font-medium'
					>
						<Plus className='h-4 w-4' /> Додати характеристику
					</button>
				</div>
			</Section>

			{/* SEO */}
			<Section title='SEO'>
				<Field label='Meta title'>
					<Input placeholder='Фара Model 3 Highland — купити у Львові' {...form.register('seoTitle')} />
				</Field>
				<Field label='Meta description'>
					<Textarea placeholder='Короткий опис для пошукової видачі' {...form.register('seoDescription')} />
				</Field>
			</Section>

			<Section title='Видимість'>
				<label className='flex cursor-pointer items-center gap-2 text-sm'>
					<input type='checkbox' className='h-4 w-4' {...form.register('isActive')} />
					Активний (показувати на сайті)
				</label>
			</Section>
			</div>
		</form>
	)
}

// Сітка зображень із drag-and-drop сортуванням + аплоадом (спільна для галереї та живих фото)
const ImageGrid = ({
	items,
	setItems,
	uploading,
	onUpload,
	hint,
	showMain = false
}: {
	items: GalleryImage[]
	setItems: React.Dispatch<React.SetStateAction<GalleryImage[]>>
	uploading: boolean
	onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
	hint: string
	showMain?: boolean
}) => {
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	)
	const onDragEnd = (e: DragEndEvent) => {
		const { active, over } = e
		if (!over || active.id === over.id) return
		setItems(prev => {
			const from = prev.findIndex(i => i.uid === active.id)
			const to = prev.findIndex(i => i.uid === over.id)
			return from === -1 || to === -1 ? prev : arrayMove(prev, from, to)
		})
	}
	return (
		<>
			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
				<SortableContext items={items.map(i => i.uid)} strategy={rectSortingStrategy}>
					<div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
						{items.map((img, i) => (
							<SortableImageCard
								key={img.uid}
								img={img}
								isMain={showMain && i === 0}
								onRemove={() => setItems(prev => prev.filter(p => p.uid !== img.uid))}
								onAlt={alt =>
									setItems(prev => prev.map(p => (p.uid === img.uid ? { ...p, alt } : p)))
								}
							/>
						))}
						<label className='border-border hover:bg-muted flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-xs'>
							{uploading ? (
								<Loader2 className='h-5 w-5 animate-spin' />
							) : (
								<ImageIcon className='h-5 w-5' />
							)}
							{uploading ? 'Завантаження…' : 'Додати фото'}
							<input
								type='file'
								accept='image/jpeg,image/png,image/webp'
								multiple
								className='hidden'
								onChange={onUpload}
								disabled={uploading}
							/>
						</label>
					</div>
				</SortableContext>
			</DndContext>
			<p className='text-muted-foreground text-xs'>{hint}</p>
		</>
	)
}

const SortableImageCard = ({
	img,
	isMain,
	onRemove,
	onAlt
}: {
	img: GalleryImage
	isMain: boolean
	onRemove: () => void
	onAlt: (alt: string) => void
}) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: img.uid
	})
	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.6 : 1,
		zIndex: isDragging ? 20 : undefined
	}
	return (
		<div
			ref={setNodeRef}
			style={style}
			className='border-border bg-card overflow-hidden rounded-xl border'
		>
			<div
				{...attributes}
				{...listeners}
				className='bg-muted relative aspect-square w-full cursor-grab touch-none active:cursor-grabbing'
			>
				<Image
					src={img.url}
					alt={img.alt}
					fill
					sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px'
					className='object-cover'
				/>
				<span className='pointer-events-none absolute left-1 top-1 rounded-md bg-black/50 p-1 text-white'>
					<GripVertical className='h-3.5 w-3.5' />
				</span>
				{isMain && (
					<span className='bg-primary text-primary-foreground pointer-events-none absolute bottom-1 left-1 rounded px-1 text-[10px] font-medium'>
						Головне
					</span>
				)}
				<button
					type='button'
					onClick={onRemove}
					onPointerDown={e => e.stopPropagation()}
					className='absolute right-1 top-1 rounded-md bg-black/60 p-1 text-white hover:bg-black/80'
					aria-label='Видалити'
				>
					<X className='h-3.5 w-3.5' />
				</button>
			</div>
			<Input
				placeholder='alt'
				value={img.alt}
				onChange={e => onAlt(e.target.value)}
				className='h-8 rounded-none border-0 border-t text-xs'
			/>
		</div>
	)
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
	<section className='border-border border-t py-6 first:border-t-0 first:pt-0 last:pb-0'>
		<h2 className='text-muted-foreground mb-4 text-sm font-bold uppercase tracking-wide'>{title}</h2>
		<div className='flex flex-col gap-4'>{children}</div>
	</section>
)

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
