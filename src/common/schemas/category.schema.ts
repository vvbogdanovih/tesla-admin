import { z } from 'zod'

export const categorySchema = z.object({
	name: z.string().trim().min(1, 'Вкажіть назву'),
	// slug не вводиться вручну — бекенд генерує з name (транслітерація)
	sortOrder: z.coerce.number().int('Має бути цілим').min(0, 'Не може бути відʼємним'),
	seoTitle: z.string().optional(),
	seoDescription: z.string().optional()
})

export type CategoryValues = z.infer<typeof categorySchema>
