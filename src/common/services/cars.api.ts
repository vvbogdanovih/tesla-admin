import { httpService } from '@/common/services/http.service'
import { API_URLS } from '@/common/constants'
import type { Car } from '@/common/types/car.type'
import type { CarValues } from '@/common/schemas/car.schema'

export const carsApi = {
	list: () => httpService.get<Car[], unknown>(API_URLS.CARS.BASE),
	create: (data: CarValues) => httpService.post<Car, CarValues>(API_URLS.CARS.BASE, data),
	update: (id: string, data: CarValues) =>
		httpService.patch<Car, CarValues>(API_URLS.CARS.BY_ID(id), data),
	remove: (id: string) => httpService.delete<{ ok: boolean }, unknown>(API_URLS.CARS.BY_ID(id))
}
