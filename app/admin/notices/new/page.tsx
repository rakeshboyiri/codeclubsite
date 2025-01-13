import AddNoticeForm from '../../../../components/admin/AddNoticeForm'

export default function NewNoticePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Notice</h1>
      <AddNoticeForm />
    </div>
  )
}

