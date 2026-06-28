import { httpService } from '@/common/services/http.service'
import { API_URLS } from '@/common/constants'
import type { Category } from '@/common/types/category.type'

export interface CategoryPayload {
	name: string
	sortOrder?: number
	seo?: { title?: string; description?: string }
}

export const categoriesApi = {
	list: () => httpService.get<Category[], unknown>(API_URLS.CATEGORIES.BASE),
	create: (data: CategoryPayload) =>
		httpService.post<Category, CategoryPayload>(API_URLS.CATEGORIES.BASE, data),
	update: (id: string, data: CategoryPayload) =>
		httpService.patch<Category, CategoryPayload>(API_URLS.CATEGORIES.BY_ID(id), data),
	remove: (id: string) =>
		httpService.delete<{ ok: boolean }, unknown>(API_URLS.CATEGORIES.BY_ID(id))
}
