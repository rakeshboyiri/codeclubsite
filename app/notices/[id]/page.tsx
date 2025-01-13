import NoticeDetail from '../../../components/NoticeDetail'

export default function NoticePage({ params }: { params: { id: string } }) {
  return (
    <div>
      <NoticeDetail noticeId={params.id} />
    </div>
  )
}

