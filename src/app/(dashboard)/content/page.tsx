'use client'

import { useState } from 'react'
import type { JSONContent } from '@tiptap/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Loader2, Pencil } from 'lucide-react'
import { Button, Modal, RichTextEditor } from '@/common/components'
import { contentBlocksApi } from '@/common/services/content-blocks.api'
import type { ContentBlock } from '@/common/types/content-block.type'

export default function ContentPage() {
	const qc = useQueryClient()
	const { data: blocks, isLoading } = useQuery({
		queryKey: ['content-blocks'],
		queryFn: contentBlocksApi.list
	})

	const [editing, setEditing] = useState<ContentBlock | null>(null)
	const [body, setBody] = useState<JSONContent | null>(null)

	const openEdit = (b: ContentBlock) => {
		setEditing(b)
		setBody(b.bodyJson)
	}

	const save = useMutation({
		mutationFn: () => contentBlocksApi.update(editing!.key, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['content-blocks'] })
			toast.success('Збережено')
			setEditing(null)
		}
	})

	return (
		<div>
			<div className='mb-6'>
				<h1 className='text-2xl font-bold'>Тексти сайту</h1>
				<p className='text-muted-foreground text-sm'>
					Наскрізні тексти (гарантія, доставка та оплата) — показуються на сторінках товарів
				</p>
			</div>

			{isLoading ? (
				<div className='text-muted-foreground flex items-center gap-2 py-16'>
					<Loader2 className='h-5 w-5 animate-spin' /> Завантаження…
				</div>
			) : (
				<div className='flex flex-col gap-3'>
					{blocks?.map(b => (
						<div
							key={b.id}
							className='border-border bg-card flex items-center justify-between rounded-2xl border p-5'
						>
							<div className='min-w-0'>
								<div className='font-medium'>{b.title}</div>
								<div className='text-muted-foreground mt-0.5 line-clamp-1 text-sm'>
									{b.bodyHtml ? stripHtml(b.bodyHtml) : 'Порожньо — натисніть «Редагувати»'}
								</div>
							</div>
							<Button variant='ghost' size='sm' onClick={() => openEdit(b)}>
								<Pencil className='h-4 w-4' /> Редагувати
							</Button>
						</div>
					))}
				</div>
			)}

			<Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.title ?? ''}>
				<div className='flex flex-col gap-4'>
					<RichTextEditor value={body} onChange={setBody} />
					<div className='flex justify-end gap-2'>
						<Button type='button' variant='ghost' onClick={() => setEditing(null)}>
							Скасувати
						</Button>
						<Button type='button' onClick={() => save.mutate()} disabled={save.isPending}>
							{save.isPending ? 'Збереження…' : 'Зберегти'}
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	)
}

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
