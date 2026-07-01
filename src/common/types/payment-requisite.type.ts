export interface PaymentRequisite {
	id: string
	label: string
	taxId: string | null
	iban: string | null
	bankName: string | null
	liqpayPublicKey: string | null
	liqpayPrivateKeySet: boolean
	monopayTokenSet: boolean
	ibanActive: boolean
	liqpayActive: boolean
	monopayActive: boolean
	createdAt: string
	updatedAt: string
}
