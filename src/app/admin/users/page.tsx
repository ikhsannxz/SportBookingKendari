import { getAdminUsers } from '@/lib/supabase/queries/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { UserActionDialog } from './user-action-dialog'

export const metadata = {
  title: 'Manajemen Pengguna - Admin',
}

export default async function AdminUsersPage() {
  const users = await getAdminUsers()

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manajemen Pengguna</h2>
        <p className="text-muted-foreground mt-1">Daftar semua pengguna yang terdaftar di platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0">Aktif</Badge>
                      ) : (
                        <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200 border-0">Nonaktif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.role !== 'admin' && (
                        <div className="flex justify-end">
                          <div className="w-[140px]">
                            <UserActionDialog 
                              userId={user.id} 
                              userName={user.full_name || user.email} 
                              isActive={user.is_active} 
                            />
                          </div>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Tidak ada data pengguna.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
