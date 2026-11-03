import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function UsersTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="bg-muted h-9 w-64 rounded animate-pulse" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="bg-muted h-4 w-24 rounded animate-pulse" />
              </TableHead>
              <TableHead>
                <div className="bg-muted h-4 w-32 rounded animate-pulse" />
              </TableHead>
              <TableHead>
                <div className="bg-muted h-4 w-16 rounded animate-pulse" />
              </TableHead>
              <TableHead>
                <div className="bg-muted h-4 w-24 rounded animate-pulse" />
              </TableHead>
              <TableHead>
                <div className="bg-muted h-4 w-24 rounded animate-pulse" />
              </TableHead>
              <TableHead>
                <div className="bg-muted h-4 w-8 rounded animate-pulse" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted h-10 w-10 rounded-full animate-pulse" />
                    <div className="flex flex-col gap-1">
                      <div className="bg-muted h-4 w-32 rounded animate-pulse" />
                      <div className="bg-muted h-3 w-24 rounded animate-pulse" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-4 w-full max-w-[180px] rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-6 w-16 rounded-full animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-4 w-24 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-4 w-24 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-8 w-8 rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="bg-muted h-4 w-64 rounded animate-pulse" />
        <div className="flex items-center space-x-2">
          <div className="bg-muted h-8 w-20 rounded animate-pulse" />
          <div className="bg-muted h-8 w-20 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
} 
