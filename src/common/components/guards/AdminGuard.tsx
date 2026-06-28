'use client'

import { useEffect, type PropsWithChildren } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/common/store/useAuthStore'
import { Role } from '@/common/constants/role.constants'
import { UI_ROUTES } from '@/common/constants/ui-routes.constants'
import { FullScreenLoader } from '@/common/components/FullScreenLoader'

export const AdminGuard = ({ children }: PropsWithChildren) => {
	const router = useRouter()
	const user = useAuthStore(s => s.user)
	const isLoading = useAuthStore(s => s.isLoading)

	const allowed = !!user && (user.role === Role.ADMIN || user.role === Role.SUPERADMIN)

	useEffect(() => {
		if (!isLoading && !allowed) router.replace(UI_ROUTES.LOGIN)
	}, [isLoading, allowed, router])

	if (isLoading || !allowed) return <FullScreenLoader />
	return <>{children}</>
}
