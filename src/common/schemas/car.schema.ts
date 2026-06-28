import { z } from 'zod'

// type=date дає або '' або 'YYYY-MM-DD'; порожнє допускаємо (відкидається перед відправкою)
const dateStr = z
	.string()
	.refine(v => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Невірний формат дати')
	.optional()

export const carSchema = z
	.object({
		brand: z.string().optional(),
		model: z.string().trim().min(1, 'Вкажіть модель'),
		generation: z.string().optional(),
		// slug авто-генерується на бекенді з model+generation, якщо лишити порожнім
		slug: z.string().optional(),
		imageUrl: z.string().optional(),
		productionStart: z
			.string()
			.min(1, 'Вкажіть дату початку випуску')
			.regex(/^\d{4}-\d{2}-\d{2}$/, 'Невірний формат дати'),
		productionEnd: dateStr
	})
	.refine(d => !d.productionStart || !d.productionEnd || d.productionEnd >= d.productionStart, {
		path: ['productionEnd'],
		message: 'Кінець випуску не може бути раніше початку'
	})

export type CarValues = z.infer<typeof carSchema>

// Порожні рядки → undefined, щоб не слати порожні поля (бек валідує @IsDateString тощо)
export const stripEmpty = (v: CarValues): CarValues =>
	Object.fromEntries(
		Object.entries(v).map(([k, val]) => [k, val === '' ? undefined : val])
	) as CarValues
