import { type DepartmentVO } from '@/types/api'

export function flattenDepartments(
  flatList: DepartmentVO[]
): { id: string; label: string; depth: number }[] {
  const byParent = new Map<string | null, DepartmentVO[]>()
  for (const d of flatList) {
    const key = d.parentId
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(d)
  }

  function walk(
    parentId: string | null,
    depth: number
  ): { id: string; label: string; depth: number }[] {
    const children = byParent.get(parentId) ?? []
    children.sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || a.deptCode.localeCompare(b.deptCode)
    )
    const result: { id: string; label: string; depth: number }[] = []
    for (const node of children) {
      result.push({ id: node.id, label: node.deptName, depth })
      result.push(...walk(node.id, depth + 1))
    }
    return result
  }

  return walk(null, 0)
}
