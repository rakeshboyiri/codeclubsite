import { getNotices } from '@/lib/noticeActions'
import NoticeList from '../../../components/admin/NoticeList'

export default async function NoticeListWrapper({ searchParams }: { searchParams: { page?: string } }) {
    const page = !!searchParams?.page ? parseInt(searchParams.page) : 1
  const noticeData = await getNotices(page)

  return <NoticeList initialNoticeData={noticeData} />
}

