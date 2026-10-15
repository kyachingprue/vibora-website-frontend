import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
  Shield,
  Bell,
  MessageCircle,
  Ban,
  LockKeyhole,
  LogOut,
  Trash2
} from 'lucide-react'
import SEO from '@/components/SEO'
import PageHeader from '@/components/PageHeader'
import { ThemeSwitch } from '@/components/ThemeToggle'
import { logout } from '@/store/authSlice'
import { setAccessToken, api } from '@/lib/api'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
function SettingRow({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-col gap-3 border-b border-neutral-100 py-4 last:border-0 sm:flex-row sm:items-center dark:border-neutral-800">
      <span className="rounded-xl bg-neutral-100 p-3 dark:bg-neutral-800">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      {children}
    </div>
  )
}
export default function Settings() {
  const dispatch = useDispatch(),
    navigate = useNavigate(),
    qc = useQueryClient(),
    user = useSelector(s => s.auth.user)
  const [privacy, setPrivacy] = useState('public'),
    [likes, setLikes] = useState(true),
    [messages, setMessages] = useState('followers')
  const signout = async () => {
    try {
      await api.logout()
    } finally {
      setAccessToken(null)
      dispatch(logout())
      qc.clear()
      navigate('/login', { replace: true })
    }
  }
  const deactivate = () =>
    window.alert(
      'Account deactivation requires an administrator-backed account status flow. Please contact support until self-service deactivation is enabled.'
    )
  return (
    <>
      <SEO
        title="Settings"
        description="Manage account preferences and security."
      />
      <PageHeader
        title="Settings"
        subtitle="Control your account, privacy and experience."
      />
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Choose light, dark, or follow your device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSwitch className="max-w-sm" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Privacy and communication</CardTitle>
            <CardDescription>
              Choose how you want to interact on Vibora.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingRow
              icon={Shield}
              title="Profile visibility"
              description="Choose who can discover your profile."
            >
              <select
                value={privacy}
                onChange={e => setPrivacy(e.target.value)}
                className="rounded-md border border-gray-400 dark:border-gray-600 bg-transparent px-3 py-2 text-sm"
              >
                <option value="public">Public</option>
                <option value="private">Private (preference only)</option>
              </select>
            </SettingRow>
            <SettingRow
              icon={Bell}
              title="Interaction notifications"
              description="Control notifications for social activity."
            >
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={likes}
                  onChange={e => setLikes(e.target.checked)}
                />{' '}
                Likes and comments
              </label>
            </SettingRow>
            <SettingRow
              icon={MessageCircle}
              title="Message requests"
              description="Choose who can start a conversation."
            >
              <select
                value={messages}
                onChange={e => setMessages(e.target.value)}
                className="rounded-md border border-gray-400 dark:border-gray-600 bg-transparent px-3 py-2 text-sm"
              >
                <option value="everyone">Everyone</option>
                <option value="followers">Followers</option>
              </select>
            </SettingRow>
            <SettingRow
              icon={Ban}
              title="Blocked users"
              description="Review blocked accounts when block management is enabled."
            >
              <Button
                variant="outline"
                onClick={() =>
                  window.alert(
                    'Blocked user management is not currently exposed by the existing backend.'
                  )
                }
              >
                Manage
              </Button>
            </SettingRow>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Account security</CardTitle>
            <CardDescription>
              Profile information can now be edited from your Profile page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingRow
              icon={LockKeyhole}
              title="Password and security"
              description="Keep your sign-in credentials secure."
            >
              <Button
                variant="outline"
                onClick={() =>
                  window.alert(
                    'Use the existing password recovery flow from the sign-in page.'
                  )
                }
              >
                Security help
              </Button>
            </SettingRow>
            <SettingRow
              icon={Trash2}
              title="Account deactivation"
              description="Temporarily disable your account."
            >
              <Button variant="outline" onClick={deactivate}>
                Deactivate
              </Button>
            </SettingRow>
            <SettingRow
              icon={LogOut}
              title="Log out"
              description={`Signed in as @${user?.username || ''}`}
            >
              <Button variant="destructive" onClick={signout}>
                Log out
              </Button>
            </SettingRow>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
