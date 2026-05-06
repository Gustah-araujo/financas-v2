import { usePage, router } from '@inertiajs/react'
import { faBuilding, faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons'
import Dropdown from '@/Components/Dropdown'
import { FontAwesomeIcon } from '@/lib/icons'

export default function WorkspaceSwitcher() {
    const { workspace, workspaces } = usePage().props

    if (!workspaces || workspaces.length === 0) {
        return null
    }

    if (workspaces.length === 1) {
        return (
            <span className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-500">
                <FontAwesomeIcon icon={faBuilding} className="h-4 w-4" />
                <span>{workspace?.name ?? workspaces[0].name}</span>
            </span>
        )
    }

    return (
        <div className="inline-flex items-center gap-2">
            <Dropdown>
                <Dropdown.Trigger>
                    <span className="inline-flex rounded-md">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                        >
                            <FontAwesomeIcon
                                icon={faBuilding}
                                className="h-4 w-4"
                            />
                            <span>{workspace?.name}</span>
                            <FontAwesomeIcon
                                icon={faChevronDown}
                                className="h-3 w-3"
                            />
                        </button>
                    </span>
                </Dropdown.Trigger>

                <Dropdown.Content width="48" align="right">
                    {workspaces.map((ws) => (
                        <button
                            key={ws.id}
                            type="button"
                            className="flex w-full items-center justify-between px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            onClick={() =>
                                router.post(
                                    route('workspace.switch', {
                                        workspace: ws.id,
                                    }),
                                )
                            }
                        >
                            <span
                                className={
                                    ws.id === (workspace?.id ?? 0)
                                        ? 'font-semibold'
                                        : ''
                                }
                            >
                                {ws.name}
                            </span>
                            {ws.id === (workspace?.id ?? 0) && (
                                <FontAwesomeIcon
                                    icon={faCheck}
                                    className="h-3 w-3 text-green-600"
                                />
                            )}
                        </button>
                    ))}
                </Dropdown.Content>
            </Dropdown>
        </div>
    )
}
