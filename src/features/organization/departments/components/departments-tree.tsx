import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { departmentsApi } from '@/api/departments'
import { type DepartmentTreeVO } from '@/types/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DepartmentRowActions } from './department-row-actions'

function filterTree(
  nodes: DepartmentTreeVO[],
  keyword: string
): DepartmentTreeVO[] {
  const q = keyword.trim().toLowerCase()
  if (!q) return nodes

  return nodes
    .map((node) => {
      const children = node.children ? filterTree(node.children, q) : []
      const matches =
        node.deptName.toLowerCase().includes(q) ||
        node.deptCode.toLowerCase().includes(q)

      if (matches || children.length > 0) {
        return { ...node, children }
      }
      return null
    })
    .filter(Boolean) as DepartmentTreeVO[]
}

function collectExpandableIds(nodes: DepartmentTreeVO[]): Set<string> {
  const ids = new Set<string>()
  for (const node of nodes) {
    if (node.children?.length) {
      ids.add(node.id)
      for (const id of collectExpandableIds(node.children)) {
        ids.add(id)
      }
    }
  }
  return ids
}

type TreeNodeProps = {
  node: DepartmentTreeVO
  depth: number
  expanded: Set<string>
  onToggle: (id: string) => void
}

function TreeNode({ node, depth, expanded, onToggle }: TreeNodeProps) {
  const { t } = useTranslation('department')
  const hasChildren = !!node.children?.length
  const isExpanded = expanded.has(node.id)

  return (
    <>
      <TableRow>
        <TableCell>
          <div
            className='flex items-center gap-1'
            style={{ paddingInlineStart: depth * 24 }}
          >
            {hasChildren ? (
              <Button
                variant='ghost'
                size='sm'
                className='h-6 w-6 p-0'
                onClick={() => onToggle(node.id)}
              >
                {isExpanded ? (
                  <ChevronDown className='h-4 w-4' />
                ) : (
                  <ChevronRight className='h-4 w-4' />
                )}
              </Button>
            ) : (
              <span className='inline-block w-6' />
            )}
            <span className='font-medium'>{node.deptName}</span>
          </div>
        </TableCell>
        <TableCell>
          <span className='font-mono text-sm'>{node.deptCode}</span>
        </TableCell>
        <TableCell className='text-center'>{node.sortOrder}</TableCell>
        <TableCell>
          <Badge variant={node.status === 1 ? 'default' : 'secondary'}>
            {node.status === 1
              ? t('columns.active')
              : t('columns.inactive')}
          </Badge>
        </TableCell>
        <TableCell className='text-end'>
          <DepartmentRowActions row={node} />
        </TableCell>
      </TableRow>
      {hasChildren &&
        isExpanded &&
        node.children!.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            expanded={expanded}
            onToggle={onToggle}
          />
        ))}
    </>
  )
}

export function DepartmentsTree() {
  const { t } = useTranslation(['department', 'common'])
  const [keyword, setKeyword] = useState('')

  const { data = [], isLoading } = useQuery({
    queryKey: ['departments', 'tree'],
    queryFn: () => departmentsApi.tree(),
  })

  const filtered = useMemo(
    () => filterTree(data, keyword),
    [data, keyword]
  )

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())

  const displayExpanded = useMemo(() => {
    if (keyword.trim()) {
      return collectExpandableIds(filtered)
    }
    return expanded
  }, [keyword, filtered, expanded])

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <Input
        className='max-w-sm'
        placeholder={t('department:filter')}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('department:columns.deptName')}</TableHead>
              <TableHead>{t('department:columns.deptCode')}</TableHead>
              <TableHead className='w-20 text-center'>
                {t('department:columns.sortOrder')}
              </TableHead>
              <TableHead className='w-24'>
                {t('department:columns.status')}
              </TableHead>
              <TableHead className='w-16 text-end' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className='h-24 text-center'>
                  {t('common:loading')}
                </TableCell>
              </TableRow>
            ) : filtered.length ? (
              filtered.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  depth={0}
                  expanded={displayExpanded}
                  onToggle={toggleExpand}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className='h-24 text-center'>
                  {t('department:noDepartments')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
