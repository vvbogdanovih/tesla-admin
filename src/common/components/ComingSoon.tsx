import { Construction } from 'lucide-react'

export const ComingSoon = ({ title }: { title: string }) => (
	<div className='flex min-h-[60vh] flex-col items-center justify-center text-center'>
		<div className='bg-primary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl'>
			<Construction className='text-accent-text h-8 w-8' />
		</div>
		<h1 className='mb-1 text-2xl font-bold'>{title}</h1>
		<p className='text-muted-foreground'>Скоро тут зʼявиться цей розділ.</p>
	</div>
)
