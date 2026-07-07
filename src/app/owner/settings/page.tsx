import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function OwnerSettingsPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground mt-1">
          Kelola pengaturan portal dan preferensi Anda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifikasi</CardTitle>
          <CardDescription>Pilih bagaimana Anda ingin menerima pembaruan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notif" className="flex flex-col space-y-1">
              <span>Notifikasi Email</span>
              <span className="font-normal text-sm text-muted-foreground">Terima email tentang booking dan pembayaran baru.</span>
            </Label>
            <Switch id="email-notif" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notif" className="flex flex-col space-y-1">
              <span>Notifikasi SMS</span>
              <span className="font-normal text-sm text-muted-foreground">Terima SMS untuk pembaruan mendesak.</span>
            </Label>
            <Switch id="sms-notif" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
