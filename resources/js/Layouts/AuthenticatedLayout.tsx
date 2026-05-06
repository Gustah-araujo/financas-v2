import AppShell from '@/Components/layout/AppShell'
import Sidebar, { type SidebarItem } from '@/Components/layout/Sidebar'
import Header from '@/Components/layout/Header'
import Dropdown from '@/Components/Dropdown'
import WorkspaceSwitcher from '@/Components/workspace/WorkspaceSwitcher'
import { usePage } from '@inertiajs/react'
import { PropsWithChildren, ReactNode } from 'react'
import {
    faHome,
    faBuildingColumns,
    faArrowRightArrowLeft,
    faTags,
} from '@fortawesome/free-solid-svg-icons'

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user

    const sidebarItems: SidebarItem[] = [
        {
            label: 'Dashboard',
            href: route('dashboard'),
            icon: faHome,
            active: route().current('dashboard'),
        },
        {
            label: 'Accounts',
            href: '/accounts',
            icon: faBuildingColumns,
        },
        {
            label: 'Transactions',
            href: '/transactions',
            icon: faArrowRightArrowLeft,
        },
        {
            label: 'Categories',
            href: '/categories',
            icon: faTags,
        },
    ]

    return (
        <AppShell
            sidebar={
                <Sidebar
                    items={sidebarItems}
                    footer={
                        <div className="text-sm text-gray-400">
                            <p className="font-medium text-white">
                                {user.name}
                            </p>
                        </div>
                    }
                />
            }
            header={
                <Header
                    actions={
                        <>
                            <WorkspaceSwitcher />
                            <Dropdown>
                            <Dropdown.Trigger>
                                <span className="inline-flex rounded-md">
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                    >
                                        {user.name}

                                        <svg
                                            className="-me-0.5 ms-2 h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </span>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profile
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                >
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                        </>
                    }
                />
            }
        >
            {header && (
                <header className="bg-white shadow -mx-6 -mt-6 mb-6 px-6 py-4">
                    <div className="mx-auto max-w-7xl">{header}</div>
                </header>
            )}

            <div className="mx-auto max-w-7xl">{children}</div>
        </AppShell>
    )
}
