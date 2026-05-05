import Button from '@/Components/ui/Button';
import TextInput from '@/Components/ui/Input/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="mb-4 text-sm text-gray-600">
                This is a secure area of the application. Please confirm your
                password before continuing.
            </div>

            <form onSubmit={submit}>
                <div className="mt-4">
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        label="Password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoFocus
                        error={errors.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Button variant="primary" className="ms-4" disabled={processing}>
                        Confirm
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
