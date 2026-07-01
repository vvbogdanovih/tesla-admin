import { httpService } from '@/common/services/http.service'
import { API_URLS } from '@/common/constants'
import type { Lead, LeadStatus } from '@/common/types/lead.type'

export const leadsApi = {
	list: (status?: LeadStatus) =>
		httpService.get<Lead[], unknown>(
			status ? `${API_URLS.LEADS.BASE}?status=${status}` : API_URLS.LEADS.BASE
		),
	setStatus: (id: string, status: LeadStatus) =>
		httpService.patch<Lead, { status: LeadStatus }>(API_URLS.LEADS.BY_ID(id), { status }),
	remove: (id: string) => httpService.delete<{ ok: boolean }, unknown>(API_URLS.LEADS.BY_ID(id))
}
