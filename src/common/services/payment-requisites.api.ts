import { httpService } from '@/common/services/http.service'
import { API_URLS } from '@/common/constants'
import type { PaymentRequisite } from '@/common/types/payment-requisite.type'

export interface PaymentRequisitePayload {
	label: string
	taxId?: string
	iban?: string
	bankName?: string
	liqpayPublicKey?: string
	liqpayPrivateKey?: string
	ibanActive?: boolean
	liqpayActive?: boolean
}

export const paymentRequisitesApi = {
	list: () => httpService.get<PaymentRequisite[], unknown>(API_URLS.PAYMENT_REQUISITES.BASE),
	create: (data: PaymentRequisitePayload) =>
		httpService.post<PaymentRequisite, PaymentRequisitePayload>(
			API_URLS.PAYMENT_REQUISITES.BASE,
			data
		),
	update: (id: string, data: Partial<PaymentRequisitePayload>) =>
		httpService.patch<PaymentRequisite, Partial<PaymentRequisitePayload>>(
			API_URLS.PAYMENT_REQUISITES.BY_ID(id),
			data
		),
	remove: (id: string) =>
		httpService.delete<{ ok: boolean }, unknown>(API_URLS.PAYMENT_REQUISITES.BY_ID(id))
}
