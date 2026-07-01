'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Check, Loader2, Phone, Trash2 } from 'lucide-react'
import { Button } from '@/common/components'
import { leadsApi } from '@/common/services/leads.api'
import type { Lead, LeadStatus, LeadType } from '@/common/types/lead.type'

const TYPE_LABEL: Record<LeadType, string> = {
	fitment: 'Підбір деталі',
	price_match: 'Знайшли дешевше',
	price_subscribe: 'Підписка на ціну',
	contact: 'Заявка / 1 клік'
}

type Filter = '' | LeadStatus

export default function LeadsPage() {
	const qc = useQueryClient()
	const [filter, setFilter] = useState<Filter>('')

	const { data: leads, isLoading } = useQuery({
		queryKey: ['leads', filter],
		queryFn: () => leadsApi.list(filter || undefined)
	})

	const setStatus = useMutation({
		mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
			leadsApi.setStatus(id, status),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['leads'] })
			toast.success('Оновлено')
		}
	})

	const remove = useMutation({
		mutationFn: (id: string) => leadsApi.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['leads'] })
			toast.success('Видалено')
		}
	})

	const tabs: { v: Filter; l: string }[] = [
		{ v: '', l: 'Усі' },
		{ v: 'new', l: 'Нові' },
		{ v: 'handled', l: 'Опрацьовані' }
	]

	return (
		<div>
			<div className='mb-6'>
				<h1 className='text-2xl font-bold'>Ліди</h1>
				<p className='text-muted-foreground text-sm'>Заявки зі сторфронту (підбір, 1 клік тощо)</p>
			</div>

			<div className='mb-5 flex gap-2'>
				{tabs.map(t => (
					<button
						key={t.v}
						onClick={() => setFilter(t.v)}
						className={
							'rounded-full px-4 py-1.5 text-sm font-medium transition-colors ' +
							(filter === t.v
								? 'bg-primary text-primary-foreground'
								: 'border-border hover:bg-muted border')
						}
					>
						{t.l}
					</button>
				))}
			</div>

			{isLoading ? (
				<div className='text-muted-foreground flex items-center gap-2 py-16'>
					<Loader2 className='h-5 w-5 animate-spin' /> Завантаження…
				</div>
			) : !leads?.length ? (
				<div className='border-border text-muted-foreground rounded-2xl border border-dashed py-16 text-center'>
					Немає заявок
				</div>
			) : (
				<div className='flex flex-col gap-3'>
					{leads.map(l => (
						<LeadCard
							key={l.id}
							lead={l}
							onHandled={() => setStatus.mutate({ id: l.id, status: 'handled' })}
							onReopen={() => setStatus.mutate({ id: l.id, status: 'new' })}
							onDelete={() => confirm('Видалити заявку?') && remove.mutate(l.id)}
						/>
					))}
				</div>
			)}
		</div>
	)
}

const LeadCard = ({
	lead: l,
	onHandled,
	onReopen,
	onDelete
}: {
	lead: Lead
	onHandled: () => void
	onReopen: () => void
	onDelete: () => void
}) => {
	const date = new Date(l.createdAt).toLocaleString('uk-UA', {
		day: '2-digit',
		month: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	})
	return (
		<div
			className={
				'border-border bg-card rounded-2xl border p-5 ' +
				(l.status === 'new' ? 'border-l-primary border-l-4' : '')
			}
		>
			<div className='flex items-start justify-between gap-4'>
				<div className='min-w-0'>
					<div className='flex flex-wrap items-center gap-2'>
						<span className='bg-primary/10 text-accent-text rounded-full px-2 py-0.5 text-xs font-bold'>
							{TYPE_LABEL[l.type]}
						</span>
						{l.status === 'new' ? (
							<span className='rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700'>
								Нова
							</span>
						) : (
							<span className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs'>
								Опрацьована
							</span>
						)}
						<span className='text-muted-foreground text-xs'>{date}</span>
					</div>
					<div className='mt-2 font-semibold'>{l.name}</div>
					<a href={`tel:${l.phone}`} className='text-accent-text flex items-center gap-1 text-sm'>
						<Phone className='h-3.5 w-3.5' /> {l.phone}
					</a>
					<div className='text-muted-foreground mt-1 space-y-0.5 text-sm'>
						{l.email && <div>Email: {l.email}</div>}
						{l.vin && <div>VIN/код: {l.vin}</div>}
						{l.link && (
							<div>
								Лінк:{' '}
								<a href={l.link} target='_blank' rel='noreferrer' className='text-accent-text underline'>
									{l.link}
								</a>
							</div>
						)}
						{l.targetPrice && <div>Бажана ціна: {Number(l.targetPrice).toLocaleString('uk-UA')} ₴</div>}
						{l.product && <div>Товар: {l.product.name}</div>}
						{l.message && <div className='text-foreground'>«{l.message}»</div>}
					</div>
				</div>
				<div className='flex shrink-0 items-center gap-1'>
					{l.status === 'new' ? (
						<Button size='sm' variant='ghost' onClick={onHandled}>
							<Check className='h-4 w-4' /> Опрацьовано
						</Button>
					) : (
						<Button size='sm' variant='ghost' onClick={onReopen}>
							Повернути
						</Button>
					)}
					<button
						onClick={onDelete}
						className='hover:bg-destructive/10 text-destructive rounded-md p-2 transition-colors'
						aria-label='Видалити'
					>
						<Trash2 className='h-4 w-4' />
					</button>
				</div>
			</div>
		</div>
	)
}
