<?php

namespace App\Http\Controllers;

use Database\Seeders\DatabaseSeeder;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;

class WorkspaceController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $workspace = DB::transaction(function () use ($request, $validated) {
            $workspace = Workspace::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
            ]);

            $workspace->users()->attach($request->user()->id, ['role' => 'owner']);
            DatabaseSeeder::seedWorkspaceCategories($workspace);

            return $workspace;
        });

        $request->session()->put('active_workspace_id', $workspace->id);

        return Redirect::route('dashboard');
    }

    public function switch(Request $request, Workspace $workspace): RedirectResponse
    {
        if (! $request->user()->workspaces()->where('workspace_id', $workspace->id)->exists()) {
            abort(403);
        }

        $request->session()->put('active_workspace_id', $workspace->id);

        return Redirect::back();
    }
}
