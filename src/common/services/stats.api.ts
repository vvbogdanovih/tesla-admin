import { httpService } from '@/common/services/http.service'
import { API_URLS } from '@/common/constants'

export interface DashboardStats {
	ordersThisMonth: number
	revenueThisMonth: number
	newLeads: number
	productsCount: number
}

export const statsApi = {
	dashboard: () => httpService.get<DashboardStats, unknown>(API_URLS.DASHBOARD.STATS)
}
