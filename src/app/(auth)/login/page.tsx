import { Button } from '@/common/components'

export default function LoginPage() {
	return (
		<div className='border-border bg-card rounded-2xl border p-7'>
			<h1 className='mb-1 text-xl font-bold'>Вхід в адмінку</h1>
			<p className='text-muted-foreground mb-6 text-sm'>Tesla Spare Parts Lviv</p>
			<form className='flex flex-col gap-3'>
				<input
					className='border-border bg-background focus:border-primary rounded-xl border px-4 py-3 text-sm outline-none'
					placeholder='Email'
				/>
				<input
					type='password'
					className='border-border bg-background focus:border-primary rounded-xl border px-4 py-3 text-sm outline-none'
					placeholder='Пароль'
				/>
				<Button className='mt-2 w-full' type='submit'>
					Увійти
				</Button>
			</form>
		</div>
	)
}
