import { WorkspaceProps } from './workspace';
import type { AccountRow } from './accounts';

export interface CategoryOption {
    id: number;
    name: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    workspace: WorkspaceProps | null;
    workspaces: WorkspaceProps[];
    flash: {
        success?: string | null;
        info?: string | null;
        warning?: string | null;
        error?: string | null;
    };
    categories?: CategoryOption[];
    accounts?: AccountRow[];
};
