import { httpService } from '@/common/services/http.service'
import { API_URLS } from '@/common/constants'
import type { User } from '@/common/types/user.type'
import type { LoginValues } from '@/common/schemas/auth.schema'

export const authApi = {
	login: (data: LoginValues) =>
		httpService.post<{ user: User }, LoginValues>(API_URLS.AUTH.LOGIN, data),
	logout: () => httpService.post(API_URLS.AUTH.LOGOUT, {}, { skipErrorToast: true }),
	me: () => httpService.get<User, unknown>(API_URLS.AUTH.ME, { skipErrorToast: true })
}
