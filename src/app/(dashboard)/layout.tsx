import { AdminGuard, Sidebar, Topbar } from '@/common/components'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<AdminGuard>
			{/* Лого Tesla у фоні адмінки */}
			<div
				aria-hidden
				className='pointer-events-none fixed inset-0 z-0 bg-center bg-no-repeat opacity-[0.05]'
				style={{ backgroundImage: "url('/tesla.svg')", backgroundSize: 'min(700px, 55vw)' }}
			/>
			<div className='relative z-10 flex min-h-screen'>
				<Sidebar />
				<div className='flex min-w-0 flex-1 flex-col'>
					<Topbar />
					<main className='flex-1 p-6'>{children}</main>
				</div>
			</div>
		</AdminGuard>
	)
}
