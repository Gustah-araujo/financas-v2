import { useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import Button from '@/Components/ui/Button';
import TextInput from '@/Components/ui/Input/TextInput';
import FormModal from '@/Components/ui/Modal/FormModal';

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function CreateWorkspaceModal({ open, onClose }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('workspaces.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title="Criar Workspace"
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" form="create-workspace-form" loading={processing}>
                        Criar
                    </Button>
                </div>
            }
        >
            <form id="create-workspace-form" onSubmit={submit}>
                <div className="space-y-4">
                    <TextInput
                        id="name"
                        name="name"
                        label="Nome"
                        value={data.name}
                        error={errors.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoFocus
                    />
                    <TextInput
                        id="description"
                        name="description"
                        label="Descrição"
                        value={data.description}
                        error={errors.description}
                        onChange={(e) => setData('description', e.target.value)}
                    />
                </div>
            </form>
        </FormModal>
    );
}
