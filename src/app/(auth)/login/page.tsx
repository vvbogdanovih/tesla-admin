'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Button } from '@/common/components'
import { Input } from '@/common/components/ui/input'
import { authApi } from '@/common/services/auth.api'
import { loginSchema, type LoginValues } from '@/common/schemas/auth.schema'
import { useAuthStore } from '@/common/store/useAuthStore'
import { Role } from '@/common/constants/role.constants'
import { UI_ROUTES } from '@/common/constants/ui-routes.constants'

export default function LoginPage() {
	const router = useRouter()
	const setUser = useAuthStore(s => s.login)
	const logOut = useAuthStore(s => s.logOut)

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting }
	} = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

	const onSubmit = async (data: LoginValues) => {
		const { user } = await authApi.login(data)
		if (user.role !== Role.ADMIN && user.role !== Role.SUPERADMIN) {
			await logOut()
			toast.error('Доступ лише для адміністраторів')
			return
		}
		setUser(user)
		toast.success('Вітаємо в адмінці')
		router.replace(UI_ROUTES.DASHBOARD)
	}

	return (
		<div className='border-border bg-card rounded-2xl border p-7'>
			<h1 className='mb-1 text-xl font-bold'>Вхід в адмінку</h1>
			<p className='text-muted-foreground mb-6 text-sm'>Tesla Spare Parts Lviv</p>

			<form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
				<div>
					<Input type='email' placeholder='Email' autoComplete='email' {...register('email')} />
					{errors.email && (
						<p className='text-destructive mt-1 text-xs'>{errors.email.message}</p>
					)}
				</div>
				<div>
					<Input
						type='password'
						placeholder='Пароль'
						autoComplete='current-password'
						{...register('password')}
					/>
					{errors.password && (
						<p className='text-destructive mt-1 text-xs'>{errors.password.message}</p>
					)}
				</div>
				<Button type='submit' className='mt-2 w-full' disabled={isSubmitting}>
					{isSubmitting ? 'Вхід…' : 'Увійти'}
				</Button>
			</form>
		</div>
	)
}
