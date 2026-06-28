import type { JSONContent } from '@tiptap/core'

export type ProductType = 'original' | 'analog'
export type ProductCondition = 'new' | 'used' | 'clearance'

export interface ProductImage {
	id?: string
	url: string
	alt?: string | null
	sortOrder?: number
}

export interface ProductListItem {
	id: string
	name: string
	sku: string
	slug: string
	price: string
	oldPrice: string | null
	onSale: boolean
	type: ProductType
	condition: ProductCondition
	stockQty: number
	isActive: boolean
	category?: { id: string; name: string } | null
	images: ProductImage[]
	_count?: { fitment: number }
}

export interface ProductFitment {
	carId: string
	car?: { id: string; model: string; generation: string | null }
}

export interface ProductDetail extends ProductListItem {
	attributes: Record<string, string>
	descriptionJson: JSONContent | null
	descriptionHtml: string | null
	seo?: { title?: string; description?: string }
	fitment: ProductFitment[]
}
