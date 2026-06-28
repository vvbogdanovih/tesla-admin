'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren, useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/common/store/useAuthStore'
import { FullScreenLoader } from '@/common/components'

export const Providers = ({ children }: PropsWithChildren) => {
	const [client] = useState(
		() =>
			new QueryClient({
				defaultOptions: { queries: { refetchOnWindowFocus: false } }
			})
	)
	const [ready, setReady] = useState(false)

	useEffect(() => {
		useAuthStore
			.getState()
			.checkAuth()
			.finally(() => setReady(true))
	}, [])

	return (
		<QueryClientProvider client={client}>
			<Toaster
				position='top-center'
				toastOptions={{
					duration: 4000,
					style: {
						background: 'var(--card)',
						color: 'var(--card-foreground)',
						border: '1px solid var(--border)',
						borderRadius: 'var(--radius-xl)',
						padding: '12px 16px',
						fontSize: '14px',
						fontWeight: 500,
						boxShadow: '0 12px 32px -12px rgba(0,0,0,0.35)',
						maxWidth: '420px'
					},
					success: {
						iconTheme: { primary: 'var(--primary)', secondary: 'var(--primary-foreground)' }
					},
					error: {
						iconTheme: { primary: 'var(--destructive)', secondary: 'var(--card)' }
					}
				}}
			/>
			{ready ? children : <FullScreenLoader />}
		</QueryClientProvider>
	)
}
