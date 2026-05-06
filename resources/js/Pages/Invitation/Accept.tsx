import Button from '@/Components/ui/Button';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

interface Props {
    workspaceName: string;
    token: string;
    status: 'valid' | 'expired' | 'cancelled' | 'already_member' | 'accepted';
    isAuthenticated: boolean;
}

export default function Accept({ workspaceName, token, status, isAuthenticated }: Props) {
    const { post, processing } = useForm();

    function handleAccept() {
        post(route('invitation.accept', { token }));
    }

    function handleRegister() {
        window.location.href = route('register', { invite_token: token });
    }

    return (
        <GuestLayout>
            <Head title="Convite" />

            <div className="text-center">
                {status === 'valid' && (
                    <>
                        <h1 className="text-lg font-semibold text-gray-900">Convite para {workspaceName}</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Você foi convidado para participar do workspace &ldquo;{workspaceName}&rdquo;.
                        </p>

                        <div className="mt-6">
                            {isAuthenticated ? (
                                <Button onClick={handleAccept} disabled={processing}>
                                    Entrar no workspace
                                </Button>
                            ) : (
                                <Button onClick={handleRegister}>
                                    Criar conta para entrar
                                </Button>
                            )}
                        </div>
                    </>
                )}

                {status === 'expired' && (
                    <p className="text-sm text-gray-600">
                        Este convite expirou. Peça um novo convite ao proprietário.
                    </p>
                )}

                {status === 'cancelled' && (
                    <p className="text-sm text-gray-600">
                        Este convite foi cancelado pelo proprietário.
                    </p>
                )}

                {status === 'already_member' && (
                    <p className="text-sm text-gray-600">
                        Você já faz parte deste workspace.
                    </p>
                )}

                {status === 'accepted' && (
                    <p className="text-sm text-gray-600">
                        Este convite já foi aceito.
                    </p>
                )}
            </div>
        </GuestLayout>
    );
}
