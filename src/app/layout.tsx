import type { Metadata } from 'next'
import { Onest, Unbounded } from 'next/font/google'
import './globals.css'
import { Providers } from './provider'
import { SITE_DESCRIPTION, SITE_NAME } from '@/common/constants/seo.constants'

const onest = Onest({
	variable: '--font-onest',
	subsets: ['latin', 'cyrillic'],
	weight: ['400', '500', '600', '700', '800']
})

const unbounded = Unbounded({
	variable: '--font-unbounded',
	subsets: ['latin', 'cyrillic'],
	weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
	title: { absolute: SITE_NAME, template: `%s | ${SITE_NAME}` },
	description: SITE_DESCRIPTION,
	robots: { index: false, follow: false }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang='uk' className={`${onest.variable} ${unbounded.variable}`}>
			<body className='min-h-screen antialiased' suppressHydrationWarning>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
