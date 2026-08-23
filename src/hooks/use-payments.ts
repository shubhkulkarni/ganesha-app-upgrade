import { useQuery } from "@tanstack/react-query"
import { fetchPayments } from "@/services/fetchPayments"

export function usePaymentsQuery(year: string) {
  return useQuery({
    queryKey: ["payments", year],
    queryFn: () => fetchPayments(year),
  })
}

export function currentYearKey() {
  return `receipt${new Date().getFullYear()}`
}
