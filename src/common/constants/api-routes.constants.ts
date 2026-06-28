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
	CATEGORIES: {
		BASE: `/categories`,
		BY_ID: (id: string) => `/categories/${id}`
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
	CONTENT_BLOCKS: {
		BASE: `/content-blocks`,
		BY_KEY: (key: string) => `/content-blocks/${key}`
	},
	PAYMENT_REQUISITES: {
		BASE: `/payment-requisites`,
		BY_ID: (id: string) => `/payment-requisites/${id}`
	},
	UPLOAD: {
		IMAGE: `/s3/upload`,
		PRESIGN: `/s3/presign`
	}
}
