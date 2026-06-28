import type { JSONContent } from '@tiptap/core'

export interface ContentBlock {
	id: string
	key: string
	title: string
	bodyJson: JSONContent | null
	bodyHtml: string | null
	updatedAt: string
}
