'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { ProductForm } from '@/common/components/products/ProductForm'
import { productsApi } from '@/common/services/products.api'

export default function Page() {
	const { id } = useParams<{ id: string }>()
	const { data, isLoading } = useQuery({
		queryKey: ['product', id],
		queryFn: () => productsApi.get(id)
	})

	if (isLoading || !data) {
		return (
			<div className='text-muted-foreground flex items-center gap-2 py-16'>
				<Loader2 className='h-5 w-5 animate-spin' /> Завантаження…
			</div>
		)
	}

	return <ProductForm product={data} />
}
