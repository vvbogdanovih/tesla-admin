export interface PaymentRequisite {
	id: string
	label: string
	taxId: string | null
	iban: string | null
	bankName: string | null
	liqpayPublicKey: string | null
	liqpayPrivateKeySet: boolean
	ibanActive: boolean
	liqpayActive: boolean
	createdAt: string
	updatedAt: string
}
