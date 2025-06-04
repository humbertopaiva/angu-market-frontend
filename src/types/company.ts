// // src/types/company.ts
// export interface Company {
//   id: string
//   uuid: string
//   name: string
//   slug: string
//   description: string
//   phone?: string
//   email?: string
//   website?: string
//   address?: string
//   latitude?: number
//   longitude?: number
//   openingHours?: string
//   logo?: string
//   banner?: string
//   cnpj?: string
//   tags?: string
//   categoryId?: number
//   subcategoryId?: number
//   placeId: number
//   place: {
//     id: string
//     name: string
//     city: string
//     state: string
//   }
//   category?: {
//     id: string
//     name: string
//   }
//   subcategory?: {
//     id: string
//     name: string
//   }
//   isActive: boolean
//   createdAt: string
//   updatedAt: string
// }

// export interface CreateCompanyInput {
//   name: string
//   slug: string
//   description: string
//   phone?: string
//   email?: string
//   website?: string
//   address?: string
//   latitude?: number
//   longitude?: number
//   openingHours?: string
//   logo?: string
//   banner?: string
//   cnpj?: string
//   placeId: number
//   isActive?: boolean
// }

// export interface UpdateCompanyInput extends CreateCompanyInput {
//   id: number
// }
