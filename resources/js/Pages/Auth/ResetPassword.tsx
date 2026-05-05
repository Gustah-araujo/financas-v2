import Button from '@/Components/ui/Button';
import TextInput from '@/Components/ui/Input/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <form onSubmit={submit}>
                <div>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        label="Email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        error={errors.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                </div>

                <div className="mt-4">
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        label="Password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        autoFocus
                        error={errors.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                </div>

                <div className="mt-4">
                    <TextInput
                        type="password"
                        name="password_confirmation"
                        label="Confirm Password"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        error={errors.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Button variant="primary" className="ms-4" disabled={processing}>
                        Reset Password
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
