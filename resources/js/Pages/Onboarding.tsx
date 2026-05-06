import { useEffect, useState } from 'react';
import { usePage, useForm, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateWorkspaceModal from '@/Components/workspace/CreateWorkspaceModal';
import Button from '@/Components/ui/Button';
import TextInput from '@/Components/ui/Input/TextInput';

export default function Onboarding() {
    const { workspace } = usePage().props;
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data, setData, post, processing } = useForm({
        token: '',
    });

    useEffect(() => {
        if (workspace) {
            window.location.href = route('dashboard');
        }
    }, [workspace]);

    function handleJoinWithCode(e: React.FormEvent) {
        e.preventDefault();
        post(route('invitation.accept', { token: data.token }));
    }

    return (
        <AuthenticatedLayout>
            <Head title="Onboarding" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Bem-vindo ao Finanças
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Para começar, crie um workspace ou entre com um código de convite.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="p-8">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Criar Workspace
                                </h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    Crie seu espaço financeiro pessoal ou compartilhado.
                                </p>
                                <Button
                                    className="mt-6 w-full"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    Criar Workspace
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="p-8">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Entrar com código de convite
                                </h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    Recebeu um convite? Cole o código abaixo para entrar.
                                </p>
                                <form onSubmit={handleJoinWithCode} className="mt-6">
                                    <TextInput
                                        value={data.token}
                                        onChange={(e) => setData('token', e.target.value)}
                                        placeholder="Código do convite"
                                    />
                                    <Button
                                        type="submit"
                                        className="mt-4 w-full"
                                        disabled={processing || !data.token}
                                        loading={processing}
                                    >
                                        Entrar
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CreateWorkspaceModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </AuthenticatedLayout>
    );
}
