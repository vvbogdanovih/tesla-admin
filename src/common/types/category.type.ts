export interface CategorySeo {
	title?: string
	description?: string
}

export interface Category {
	id: string
	slug: string
	name: string
	sortOrder: number
	seo?: CategorySeo
	_count?: { products: number }
}
