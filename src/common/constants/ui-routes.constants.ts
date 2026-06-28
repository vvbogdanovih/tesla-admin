export const UI_ROUTES = {
	DASHBOARD: '/',
	PRODUCTS: '/products',
	PRODUCT_NEW: '/products/new',
	PRODUCT_EDIT: (id: string) => `/products/${id}`,
	CARS: '/cars',
	CATEGORIES: '/categories',
	ORDERS: '/orders',
	LEADS: '/leads',
	BLOG: '/blog',
	BANNERS: '/banners',
	CONTENT: '/content',
	USERS: '/users',
	LOGIN: '/login'
} as const

import {
	LayoutDashboard,
	Package,
	Car,
	FolderTree,
	Receipt,
	Inbox,
	FileText,
	Image,
	ScrollText,
	Users
} from 'lucide-react'

export const NAV_ITEMS = [
	{ label: 'Дашборд', href: UI_ROUTES.DASHBOARD, icon: LayoutDashboard },
	{ label: 'Товари', href: UI_ROUTES.PRODUCTS, icon: Package },
	{ label: 'Замовлення', href: UI_ROUTES.ORDERS, icon: Receipt },
	{ label: 'Ліди', href: UI_ROUTES.LEADS, icon: Inbox },
	{ label: 'Довідник авто', href: UI_ROUTES.CARS, icon: Car },
	{ label: 'Категорії', href: UI_ROUTES.CATEGORIES, icon: FolderTree },
	{ label: 'Блог', href: UI_ROUTES.BLOG, icon: FileText },
	{ label: 'Банери', href: UI_ROUTES.BANNERS, icon: Image },
	{ label: 'Тексти сайту', href: UI_ROUTES.CONTENT, icon: ScrollText },
	{ label: 'Користувачі', href: UI_ROUTES.USERS, icon: Users }
] as const
