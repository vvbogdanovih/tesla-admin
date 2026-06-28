import { z } from 'zod'

export const productSchema = z.object({
	name: z.string().trim().min(1, 'Вкажіть назву'),
	sku: z.string().trim().min(1, 'Вкажіть артикул'),
	categoryId: z.string().min(1, 'Оберіть категорію'),
	price: z.coerce.number({ message: 'Невірна ціна' }).min(0, 'Не може бути відʼємною'),
	// порожнє → 0; у payload відкидається, якщо ≤ 0 або ≤ price
	oldPrice: z.coerce.number().min(0).optional(),
	type: z.enum(['original', 'analog']),
	condition: z.enum(['new', 'used', 'clearance']),
	inStock: z.boolean(),
	isActive: z.boolean(),
	stockQty: z.coerce.number().int('Має бути цілим').min(0, 'Не може бути відʼємним'),
	warranty: z.string().optional(),
	deliveryTerms: z.string().optional(),
	seoTitle: z.string().optional(),
	seoDescription: z.string().optional()
})

export type ProductValues = z.infer<typeof productSchema>
