import { z } from 'zod'

export const loginSchema = z.object({
	email: z.string().email('Невірний email'),
	password: z.string().min(1, 'Введіть пароль')
})

export type LoginValues = z.infer<typeof loginSchema>
