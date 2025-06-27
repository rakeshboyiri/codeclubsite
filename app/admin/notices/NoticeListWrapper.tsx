import { getNotices } from '@/lib/noticeActions'
import NoticeList from '../../../components/admin/NoticeList'

interface NoticeListWrapperProps {
  searchParams: { page?: string }
}

export default async function NoticeListWrapper({ searchParams }: NoticeListWrapperProps) {
  const page = searchParams?.page ? parseInt(searchParams.page) : 1
  const noticeData = await getNotices(page)

  return <NoticeList initialNoticeData={noticeData} />
}

