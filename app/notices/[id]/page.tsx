// import NoticeDetail from '../../../components/NoticeDetail'

// interface NoticePageProps {
//   params: {
//     id: string
//   }
// }

// export default async function NoticePage({ params }: NoticePageProps) {
//   // Ensure params.id is available before rendering NoticeDetail
//   const noticeId = await Promise.resolve(params.id)
  
//   return (
//     <div>
//       <NoticeDetail noticeId={noticeId} />
//     </div>
//   )
// }


import NoticeDetail from '../../../components/NoticeDetail'
import { getNotice } from '../../../lib/noticeActions'
import { notFound } from 'next/navigation'

interface NoticePageProps {
  params: {
    id: string
  }
}

export default async function NoticePage({ params }: NoticePageProps) {
  // Validate that the notice exists before rendering the detail component
  const paramss = await params
  const notice = await getNotice(paramss.id)
  
  if (!notice) {
    notFound()
  }

  return (
    <div>
      <NoticeDetail noticeId={params.id} />
    </div>
  )
}

// Generate metadata for the page
export async function generateMetadata({ params }: NoticePageProps) {
  const notice = await getNotice(params.id)
  
  if (!notice) {
    return {
      title: 'Notice Not Found',
    }
  }

  return {
    title: `${notice.title} - CodeClub Notices`,
    description: notice.content.substring(0, 160),
  }
}

