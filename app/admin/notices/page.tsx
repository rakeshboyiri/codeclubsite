// import Link from 'next/link'
// import { Suspense } from 'react'
// import NoticeListWrapper from './NoticeListWrapper'
// import Loading from './loading'

// interface NoticeManagementProps {
//   searchParams: { page?: string }
// }

// export default function NoticeManagement({ searchParams }: NoticeManagementProps) {
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Notice Management</h1>
//         <Link 
//           href="/admin/notices/new" 
//           className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
//         >
//           Add New Notice
//         </Link>
//       </div>
//       <Suspense fallback={<Loading />}>
//         <NoticeListWrapper searchParams={searchParams} />
//       </Suspense>
//     </div>
//   )
// }



import NoticeDetail from '../../../components/NoticeDetail'

interface NoticePageProps {
  params: {
    id: string
  }
}

export default function NoticePage({ params }: NoticePageProps) {
  return (
    <div>
      <NoticeDetail noticeId={params.id} />
    </div>
  )
}

