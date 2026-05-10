import Breadcrumbs from '@/Components/layout/Breadcrumbs'
import PageTitle from '@/Components/layout/PageTitle'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react'

const breadcrumbItems = [
    { label: 'Dashboard' },
]

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <Breadcrumbs items={breadcrumbItems} />
            <PageTitle
                title="Dashboard"
                description="Visão geral do workspace e ponto de partida para a navegação da aplicação."
            />

            <div className="space-y-6">
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="p-6 text-gray-900">
                            You're logged in!
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
