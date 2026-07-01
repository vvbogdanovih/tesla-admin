import { z } from 'zod'

export const requisiteSchema = z.object({
	label: z
		.string()
		.trim()
		.refine(v => v.split(/\s+/).filter(Boolean).length === 3, 'Вкажіть ПІБ повністю'),
	taxId: z.string().optional(),
	iban: z.string().optional(),
	bankName: z.string().optional(),
	liqpayPublicKey: z.string().optional(),
	// порожнє при редагуванні = не змінювати ключ/токен
	liqpayPrivateKey: z.string().optional(),
	monopayToken: z.string().optional()
	// активність каналів керується лише кнопками у списку
})

export type RequisiteValues = z.infer<typeof requisiteSchema>
