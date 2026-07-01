export type LeadType = 'fitment' | 'price_match' | 'price_subscribe' | 'contact'
export type LeadStatus = 'new' | 'handled'

export interface Lead {
	id: string
	type: LeadType
	name: string
	phone: string
	email: string | null
	vin: string | null
	link: string | null
	targetPrice: string | null
	productId: string | null
	message: string | null
	status: LeadStatus
	createdAt: string
	product?: { id: string; name: string; slug: string } | null
}
