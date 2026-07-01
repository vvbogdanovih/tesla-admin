import type { JSONContent } from '@tiptap/core'
import { httpService } from '@/common/services/http.service'
import { API_URLS } from '@/common/constants'
import type {
	ProductCondition,
	ProductDetail,
	ProductListItem,
	ProductType
} from '@/common/types/product.type'

export interface ProductPayload {
	name: string
	sku: string
	categoryId: string
	price: number
	oldPrice?: number
	onSale?: boolean
	type: ProductType
	condition: ProductCondition
	stockQty: number
	descriptionJson?: JSONContent | null
	attributes?: Record<string, string>
	seo?: { title?: string; description?: string }
	images?: { url: string; alt?: string }[]
	livePhotos?: { url: string; alt?: string }[]
	carIds?: string[]
	isActive?: boolean
}

export const productsApi = {
	list: () => httpService.get<ProductListItem[], unknown>(API_URLS.PRODUCTS.BASE),
	get: (id: string) => httpService.get<ProductDetail, unknown>(API_URLS.PRODUCTS.BY_ID(id)),
	create: (data: ProductPayload) =>
		httpService.post<ProductDetail, ProductPayload>(API_URLS.PRODUCTS.BASE, data),
	update: (id: string, data: ProductPayload) =>
		httpService.patch<ProductDetail, ProductPayload>(API_URLS.PRODUCTS.BY_ID(id), data),
	remove: (id: string) =>
		httpService.delete<{ ok: boolean }, unknown>(API_URLS.PRODUCTS.BY_ID(id))
}
