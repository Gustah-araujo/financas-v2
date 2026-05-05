import Button from '@/Components/ui/Button';
import TextInput from '@/Components/ui/Input/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div>
                    <TextInput
                        id="name"
                        name="name"
                        label="Name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        autoFocus
                        error={errors.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                </div>

                <div className="mt-4">
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
                        required
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
                        error={errors.password}
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                </div>

                <div className="mt-4">
                    <TextInput
                        id="password_confirmation"
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
                        required
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>

                    <Button variant="primary" className="ms-4" disabled={processing}>
                        Register
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
