// Адмін-огляд «Обране (лайки)» — сигнал інтересу (ADR-0012)

export interface WishlistUser {
	id: string
	firstName: string | null
	lastName: string | null
	phone: string | null
	email: string | null
}

export interface WishlistProductRef {
	id: string
	name: string
	slug: string
	sku: string
}

export interface WishlistAdminItem {
	createdAt: string
	user: WishlistUser
	product: WishlistProductRef
}

export interface WishlistTopProduct {
	product: WishlistProductRef | null
	count: number
}

export interface WishlistAdminResponse {
	items: WishlistAdminItem[]
	total: number
	page: number
	limit: number
	pages: number
	topProducts: WishlistTopProduct[]
}
