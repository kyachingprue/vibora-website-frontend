import SEO from '@/components/SEO'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Shield, Server, Database, Wifi } from 'lucide-react'

export default function AdminSettings() {
  return (
    <>
      <SEO title="Admin settings" />
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-sm text-neutral-500">
          Platform configuration overview
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-violet-500" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
            <p>• Role-based access is enforced on every admin API route.</p>
            <p>• Access tokens are verified server-side; roles are never trusted from the client.</p>
            <p>• Admins cannot deactivate or delete their own account or the last administrator.</p>
            <p>• Socket.IO connections are authenticated with the same JWT.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-violet-500" />
              Runtime
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
            <p>• Express API with Helmet, CORS, rate limiting, and compression.</p>
            <p>• PostgreSQL via Prisma (Neon-compatible).</p>
            <p>• Cloudinary for image and video uploads when configured.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-violet-500" />
              Real-time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
            <p>• Online status is based on live Socket.IO connections.</p>
            <p>• Account active/deactivated status always comes from the database.</p>
            <p>• Clients cannot change roles or account status by emitting socket events.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-violet-500" />
              Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
            <p>• Analytics charts use aggregated counts from the live database.</p>
            <p>• No fabricated or hardcoded statistics are shown in the dashboard.</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
