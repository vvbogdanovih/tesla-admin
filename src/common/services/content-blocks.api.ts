import type { JSONContent } from '@tiptap/core'
import { httpService } from '@/common/services/http.service'
import { API_URLS } from '@/common/constants'
import type { ContentBlock } from '@/common/types/content-block.type'

export const contentBlocksApi = {
	list: () => httpService.get<ContentBlock[], unknown>(API_URLS.CONTENT_BLOCKS.BASE),
	update: (key: string, bodyJson: JSONContent | null) =>
		httpService.patch<ContentBlock, { bodyJson: JSONContent | null }>(
			API_URLS.CONTENT_BLOCKS.BY_KEY(key),
			{ bodyJson }
		)
}
