import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function PostsTableSkeleton() {
  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="relative">
          <div className="bg-muted h-9 w-[250px] rounded-md" />
        </div>
        <div className="ml-auto flex gap-2">
          <div className="bg-muted h-9 w-[120px] rounded-md" />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <div className="bg-muted h-5 w-16 rounded" />
              </TableHead>
              <TableHead className="w-[150px]">
                <div className="bg-muted h-5 w-16 rounded" />
              </TableHead>
              <TableHead className="w-[150px]">
                <div className="bg-muted h-5 w-16 rounded" />
              </TableHead>
              <TableHead className="w-[150px]">
                <div className="bg-muted h-5 w-16 rounded" />
              </TableHead>
              <TableHead className="w-[150px]">
                <div className="bg-muted h-5 w-16 rounded" />
              </TableHead>
              <TableHead className="w-[100px]">
                <div className="bg-muted h-5 w-16 rounded" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted h-10 w-14 rounded" />
                    <div className="space-y-1">
                      <div className="bg-muted h-4 w-40 rounded" />
                      <div className="bg-muted h-3 w-24 rounded" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="bg-muted h-8 w-8 rounded-full" />
                    <div className="bg-muted h-4 w-20 rounded" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-4 w-24 rounded" />
                </TableCell>
                <TableCell>
                  <div className="flex gap-3">
                    <div className="bg-muted h-4 w-10 rounded" />
                    <div className="bg-muted h-4 w-10 rounded" />
                    <div className="bg-muted h-4 w-10 rounded" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <div className="bg-muted h-8 w-8 rounded-md" />
                    <div className="bg-muted h-8 w-8 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="bg-muted h-8 w-[100px] rounded" />
        <div className="bg-muted h-8 w-8 rounded" />
        <div className="bg-muted h-8 w-8 rounded" />
      </div>
    </div>
  )
} 
