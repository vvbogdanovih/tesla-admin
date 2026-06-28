import { API_BASE_URL, API_URLS } from '@/common/constants'
import { HttpService } from '@/common/services/http.service'

/**
 * Завантаження зображення: файл іде на бекенд (multipart), там конвертується
 * в AVIF і кладеться в R2 — повертається публічний URL.
 *
 * Нативний fetch (а не axios), щоб браузер сам виставив multipart-boundary.
 * На 401 пробуємо один раз оновити токен (як інтерсептор axios) і повторюємо.
 */
export async function uploadImage(file: File, prefix = 'products'): Promise<string> {
	const send = () => {
		const fd = new FormData()
		fd.append('file', file)
		fd.append('prefix', prefix)
		return fetch(`${API_BASE_URL}${API_URLS.UPLOAD.IMAGE}`, {
			method: 'POST',
			credentials: 'include',
			body: fd
		})
	}

	let res = await send()
	if (res.status === 401 && (await HttpService.refreshToken())) {
		res = await send()
	}

	if (!res.ok) {
		const data = await res.json().catch(() => null)
		throw new Error(data?.message || 'Не вдалося завантажити фото')
	}

	const { url } = (await res.json()) as { url: string }
	return url
}
