<?php

use App\Models\Workspace;

if (!function_exists('active_workspace')) {
    function active_workspace(): ?Workspace
    {
        $id = session('active_workspace_id') ?? request()->attributes->get('active_workspace_id');

        return $id ? Workspace::find($id) : null;
    }
}
