import { httpService } from '@/common/services/http.service'
import { API_URLS } from '@/common/constants'
import type { WishlistAdminResponse } from '@/common/types/wishlist.type'

interface AdminListParams {
	productId?: string
	page?: number
	limit?: number
}

export const wishlistApi = {
	adminList: (params?: AdminListParams) => {
		const q = new URLSearchParams()
		if (params?.productId) q.set('productId', params.productId)
		if (params?.page) q.set('page', String(params.page))
		if (params?.limit) q.set('limit', String(params.limit))
		const qs = q.toString()
		return httpService.get<WishlistAdminResponse, unknown>(
			qs ? `${API_URLS.WISHLIST.ADMIN}?${qs}` : API_URLS.WISHLIST.ADMIN
		)
	}
}
