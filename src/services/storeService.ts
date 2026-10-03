import branchesData from '@/data/branches.json'
import departmentsData from '@/data/departments.json'
import type { Branch } from '@/types/checkout'

export const getBranches = (): Branch[] => branchesData
export const getBranch = (id: string | undefined): Branch | undefined =>
  branchesData.find((b) => b.id === id)
export const getDepartments = (): string[] => departmentsData
