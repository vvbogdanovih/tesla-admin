export interface Car {
	id: string
	brand: string
	model: string
	generation: string | null
	slug: string
	imageUrl: string | null
	productionStart: string | null
	productionEnd: string | null
	_count?: { fitment: number }
}
