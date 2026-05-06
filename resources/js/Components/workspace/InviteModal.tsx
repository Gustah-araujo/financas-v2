import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import FormModal from '@/Components/ui/Modal/FormModal';
import TextInput from '@/Components/ui/Input/TextInput';
import Button from '@/Components/ui/Button';
import { toast } from '@/lib/toast';

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function InviteModal({ open, onClose }: Props) {
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const { data, setData, processing, reset } = useForm({
        email: '',
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const response = await axios.post(route('workspace.invite'), {
                email: data.email || null,
            });
            setInviteLink(response.data.invite_link);
            reset();
        } catch (error: any) {
            if (error.response?.data?.errors) {
                Object.entries(error.response.data.errors).forEach(([key, messages]) => {
                    const msg = Array.isArray(messages) ? messages[0] : messages;
                    toast.error(String(msg));
                });
            }
        }
    }

    async function copyToClipboard() {
        if (!inviteLink) return;
        await navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        toast.success('Link copiado!');
        setTimeout(() => setCopied(false), 2000);
    }

    function handleClose() {
        setInviteLink(null);
        setCopied(false);
        reset();
        onClose();
    }

    return (
        <FormModal
            open={open}
            onClose={handleClose}
            title="Convidar Membro"
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={handleClose} disabled={processing}>
                        Fechar
                    </Button>
                    <Button variant="primary" type="submit" form="invite-member-form" loading={processing}>
                        Gerar Link
                    </Button>
                </div>
            }
        >
            <form id="invite-member-form" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <TextInput
                        id="email"
                        name="email"
                        type="email"
                        label="E-mail (opcional)"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="exemplo@email.com"
                    />

                    {inviteLink && (
                        <div className="rounded-md bg-gray-50 p-4 border border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Link de convite:
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={inviteLink}
                                    className="flex-1 rounded-md border-gray-300 bg-white text-sm text-gray-600 p-2 focus:outline-none"
                                />
                                <Button
                                    variant={copied ? 'secondary' : 'primary'}
                                    size="sm"
                                    onClick={copyToClipboard}
                                >
                                    {copied ? 'Copiado' : 'Copiar'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </FormModal>
    );
}
