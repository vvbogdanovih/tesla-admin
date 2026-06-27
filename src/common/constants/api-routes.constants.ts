export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!

export const API_URLS = {
	AUTH: {
		LOGIN: `/auth/login`,
		REFRESH: `/auth/refresh`,
		LOGOUT: `/auth/logout`,
		ME: `/auth/me`
	},
	DASHBOARD: {
		STATS: `/admin/stats`
	},
	PRODUCTS: {
		BASE: `/products`,
		BY_ID: (id: string) => `/products/${id}`
	},
	CARS: {
		BASE: `/cars`,
		BY_ID: (id: string) => `/cars/${id}`
	},
	SYSTEMS: {
		BASE: `/systems`,
		BY_ID: (id: string) => `/systems/${id}`
	},
	ORDERS: {
		BASE: `/orders`,
		BY_ID: (id: string) => `/orders/${id}`,
		STATUS: (id: string) => `/orders/${id}/status`
	},
	LEADS: {
		BASE: `/leads`,
		BY_ID: (id: string) => `/leads/${id}`
	},
	BLOG: {
		BASE: `/blog`,
		BY_ID: (id: string) => `/blog/${id}`
	},
	BANNERS: {
		BASE: `/banners`,
		BY_ID: (id: string) => `/banners/${id}`
	},
	USERS: {
		BASE: `/users`,
		BY_ID: (id: string) => `/users/${id}`
	},
	UPLOAD: {
		PRESIGN: `/upload/presign`
	}
}
