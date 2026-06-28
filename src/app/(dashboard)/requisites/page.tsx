'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { CheckCircle2, Loader2, Lock, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, Modal } from '@/common/components'
import { Input } from '@/common/components/ui/input'
import {
	paymentRequisitesApi,
	type PaymentRequisitePayload
} from '@/common/services/payment-requisites.api'
import { requisiteSchema, type RequisiteValues } from '@/common/schemas/payment-requisite.schema'
import { useAuthStore } from '@/common/store/useAuthStore'
import { Role } from '@/common/constants/role.constants'
import type { PaymentRequisite } from '@/common/types/payment-requisite.type'

// Повнота каналу (умова активації) — дзеркало бекенду
const ibanComplete = (r: PaymentRequisite) => !!(r.label && r.taxId && r.iban && r.bankName)
const liqpayComplete = (r: PaymentRequisite) => !!(r.liqpayPublicKey && r.liqpayPrivateKeySet)

const EMPTY: RequisiteValues = {
	label: '',
	taxId: '',
	iban: '',
	bankName: '',
	liqpayPublicKey: '',
	liqpayPrivateKey: ''
}

export default function RequisitesPage() {
	const qc = useQueryClient()
	const isSuperadmin = useAuthStore(s => s.user?.role === Role.SUPERADMIN)

	const { data: items, isLoading } = useQuery({
		queryKey: ['payment-requisites'],
		queryFn: paymentRequisitesApi.list,
		enabled: isSuperadmin
	})

	const [open, setOpen] = useState(false)
	const [editing, setEditing] = useState<PaymentRequisite | null>(null)

	const form = useForm<RequisiteValues>({ resolver: zodResolver(requisiteSchema), defaultValues: EMPTY })

	const openCreate = () => {
		setEditing(null)
		form.reset(EMPTY)
		setOpen(true)
	}

	const openEdit = (r: PaymentRequisite) => {
		setEditing(r)
		form.reset({
			label: r.label,
			taxId: r.taxId ?? '',
			iban: r.iban ?? '',
			bankName: r.bankName ?? '',
			liqpayPublicKey: r.liqpayPublicKey ?? '',
			liqpayPrivateKey: ''
		})
		setOpen(true)
	}

	const save = useMutation({
		mutationFn: (v: RequisiteValues) => {
			const payload: PaymentRequisitePayload = {
				label: v.label,
				taxId: v.taxId?.trim() || undefined,
				iban: v.iban?.trim() || undefined,
				bankName: v.bankName?.trim() || undefined,
				liqpayPublicKey: v.liqpayPublicKey?.trim() || undefined
			}
			if (v.liqpayPrivateKey?.trim()) payload.liqpayPrivateKey = v.liqpayPrivateKey.trim()
			return editing
				? paymentRequisitesApi.update(editing.id, payload)
				: paymentRequisitesApi.create(payload)
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['payment-requisites'] })
			toast.success(editing ? 'Реквізити оновлено' : 'Реквізити додано')
			setOpen(false)
		}
	})

	const remove = useMutation({
		mutationFn: (id: string) => paymentRequisitesApi.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['payment-requisites'] })
			toast.success('Видалено')
		}
	})

	const setActive = useMutation({
		mutationFn: ({ id, patch }: { id: string; patch: Partial<PaymentRequisitePayload> }) =>
			paymentRequisitesApi.update(id, patch),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['payment-requisites'] })
			toast.success('Активовано')
		}
	})

	if (!isSuperadmin) {
		return (
			<div className='text-muted-foreground py-16 text-center'>
				Доступ до реквізитів — лише для superadmin.
			</div>
		)
	}

	return (
		<div>
			<div className='mb-6 flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Реквізити</h1>
					<p className='text-muted-foreground text-sm'>
						Канали прийому коштів: оплата за IBAN та LiqPay (активний — один на канал)
					</p>
				</div>
				<Button onClick={openCreate}>
					<Plus className='h-4 w-4' /> Додати
				</Button>
			</div>

			{isLoading ? (
				<div className='text-muted-foreground flex items-center gap-2 py-16'>
					<Loader2 className='h-5 w-5 animate-spin' /> Завантаження…
				</div>
			) : !items?.length ? (
				<div className='border-border text-muted-foreground rounded-2xl border border-dashed py-16 text-center'>
					Ще немає реквізитів
				</div>
			) : (
				<div className='flex flex-col gap-3'>
					{items.map(r => (
						<div
							key={r.id}
							className='border-border bg-card flex items-start justify-between gap-4 rounded-2xl border p-5'
						>
							<div className='min-w-0'>
								<span className='font-semibold'>{r.label}</span>
								<div className='text-muted-foreground mt-1 text-sm'>
									{r.iban || 'без IBAN'} · ІПН: {r.taxId || '—'} · {r.bankName || '—'}
								</div>
								<div className='text-muted-foreground mt-1 flex items-center gap-1 text-xs'>
									<Lock className='h-3 w-3' />
									LiqPay: public {r.liqpayPublicKey ? '✓' : '—'}, private{' '}
									{r.liqpayPrivateKeySet ? '✓' : '—'}
								</div>

								{/* Канали: статус або кнопка активації */}
								<div className='mt-3 flex flex-wrap gap-2'>
									<ChannelControl
										title='IBAN'
										active={r.ibanActive}
										complete={ibanComplete(r)}
										hint='Заповніть отримувача, ІПН, IBAN і банк'
										onActivate={() => setActive.mutate({ id: r.id, patch: { ibanActive: true } })}
										pending={setActive.isPending}
									/>
									<ChannelControl
										title='LiqPay'
										active={r.liqpayActive}
										complete={liqpayComplete(r)}
										hint='Вкажіть public та private ключі'
										onActivate={() => setActive.mutate({ id: r.id, patch: { liqpayActive: true } })}
										pending={setActive.isPending}
									/>
								</div>
							</div>
							<div className='flex shrink-0 items-center gap-1'>
								<button
									onClick={() => openEdit(r)}
									className='hover:bg-muted rounded-md p-2 transition-colors'
									aria-label='Редагувати'
								>
									<Pencil className='h-4 w-4' />
								</button>
								<button
									onClick={() => confirm(`Видалити «${r.label}»?`) && remove.mutate(r.id)}
									className='hover:bg-destructive/10 text-destructive rounded-md p-2 transition-colors'
									aria-label='Видалити'
								>
									<Trash2 className='h-4 w-4' />
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			<Modal
				open={open}
				onClose={() => setOpen(false)}
				title={editing ? 'Редагувати реквізити' : 'Нові реквізити'}
			>
				<form onSubmit={form.handleSubmit(v => save.mutate(v))} className='flex flex-col gap-4'>
					<Field label='ПІБ отримувача *' error={form.formState.errors.label?.message}>
						<Input placeholder='Іваненко Іван Іванович' {...form.register('label')} />
					</Field>
					<div className='grid grid-cols-2 gap-4'>
						<Field label='ІПН / ЄДРПОУ'>
							<Input placeholder='1234567890' {...form.register('taxId')} />
						</Field>
						<Field label='IBAN'>
							<Input placeholder='UA...' {...form.register('iban')} />
						</Field>
					</div>
					<Field label='Банк'>
						<Input placeholder='ПриватБанк' {...form.register('bankName')} />
					</Field>

					<div className='border-border mt-1 border-t pt-4'>
						<p className='text-muted-foreground mb-3 flex items-center gap-1 text-xs font-medium uppercase'>
							<Lock className='h-3 w-3' /> LiqPay
						</p>
						<div className='flex flex-col gap-4'>
							<Field label='Public key'>
								<Input placeholder='i00000000000' {...form.register('liqpayPublicKey')} />
							</Field>
							<Field
								label='Private key'
								hint={
									editing?.liqpayPrivateKeySet
										? 'Ключ збережено. Лишіть порожнім, щоб не змінювати.'
										: 'Зберігається зашифровано; у відповідях не показується.'
								}
							>
								<Input
									type='password'
									autoComplete='new-password'
									placeholder={editing?.liqpayPrivateKeySet ? '••••••••' : 'sandbox_…'}
									{...form.register('liqpayPrivateKey')}
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

// (галочки активності у формі прибрано — активація лише кнопками у списку)

// Статус каналу: однаковий розмір для активного й кнопки активації
const ChannelControl = ({
	title,
	active,
	complete,
	hint,
	onActivate,
	pending
}: {
	title: string
	active: boolean
	complete: boolean
	hint: string
	onActivate: () => void
	pending: boolean
}) => {
	if (active) {
		return (
			<span className='inline-flex h-11 items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 text-sm font-semibold text-green-700'>
				<CheckCircle2 className='h-4 w-4' /> {title} активний
			</span>
		)
	}
	return (
		<Button
			type='button'
			variant='ghost'
			disabled={!complete || pending}
			title={complete ? '' : hint}
			onClick={onActivate}
			className='h-11 rounded-lg'
		>
			Зробити активним: {title}
		</Button>
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
