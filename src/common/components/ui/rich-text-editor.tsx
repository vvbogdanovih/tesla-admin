'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type { JSONContent } from '@tiptap/core'
import {
	Bold,
	Italic,
	Heading2,
	Heading3,
	List,
	ListOrdered,
	Quote,
	Undo,
	Redo
} from 'lucide-react'
import { cn } from '@/common/utils/shad-cn.utils'

// Набір extensions має збігатися з бекендом (richTextToHtml) — ADR-0006.
const extensions = [StarterKit]

interface RichTextEditorProps {
	value?: JSONContent | null
	onChange?: (json: JSONContent) => void
}

const ToolbarButton = ({
	active,
	onClick,
	children
}: {
	active?: boolean
	onClick: () => void
	children: React.ReactNode
}) => (
	<button
		type='button'
		onClick={onClick}
		className={cn(
			'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
			active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
		)}
	>
		{children}
	</button>
)

export const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
	const editor = useEditor({
		extensions,
		content: value ?? '',
		immediatelyRender: false, // SSR-safe (Next)
		editorProps: {
			attributes: {
				class: 'min-h-[180px] px-4 py-3 text-sm leading-relaxed outline-none'
			}
		},
		onUpdate: ({ editor }) => onChange?.(editor.getJSON())
	})

	if (!editor) return null

	return (
		<div className='border-border overflow-hidden rounded-xl border'>
			<div className='border-border bg-card flex flex-wrap items-center gap-1 border-b p-1.5'>
				<ToolbarButton
					active={editor.isActive('bold')}
					onClick={() => editor.chain().focus().toggleBold().run()}
				>
					<Bold className='h-4 w-4' />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive('italic')}
					onClick={() => editor.chain().focus().toggleItalic().run()}
				>
					<Italic className='h-4 w-4' />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive('heading', { level: 2 })}
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				>
					<Heading2 className='h-4 w-4' />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive('heading', { level: 3 })}
					onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
				>
					<Heading3 className='h-4 w-4' />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive('bulletList')}
					onClick={() => editor.chain().focus().toggleBulletList().run()}
				>
					<List className='h-4 w-4' />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive('orderedList')}
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
				>
					<ListOrdered className='h-4 w-4' />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive('blockquote')}
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
				>
					<Quote className='h-4 w-4' />
				</ToolbarButton>
				<span className='bg-border mx-1 h-5 w-px' />
				<ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
					<Undo className='h-4 w-4' />
				</ToolbarButton>
				<ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
					<Redo className='h-4 w-4' />
				</ToolbarButton>
			</div>
			<EditorContent editor={editor} />
		</div>
	)
}
